import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
  client_id: string
  budget?: number
  category?: string
  deadline?: string
  status_new?: string // <- adicionar
}

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
  due_date?: string
  project_id: string
  progress?: number
}

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  thumbnail?: string
  size: string
  uploadedAt: string
  uploadedBy: string
  uploadedByAvatar: string
  status: 'pending' | 'approved' | 'rejected'
  projectMembers?: { id: string; name: string; avatar_url: string }[]
  milestoneId?: string | null
}

interface ProjectData {
  project: Project | null
  milestones: Milestone[]
  assets: Asset[]
  loading: boolean
  error: string | null
  foldersCount?: number
}

// Cache para evitar múltiplas queries
const projectCache = new Map<string, ProjectData>()

export function useProjectDetails(projectId: string): ProjectData {
  const [data, setData] = useState<ProjectData>({
    project: null,
    milestones: [],
    assets: [],
    loading: true,
    error: null,
    foldersCount: 0,
  })

  useEffect(() => {
    // Verificar cache primeiro
    if (projectCache.has(projectId)) {
      const cachedData = projectCache.get(projectId)!
      setData({ ...cachedData, loading: false })
      return
    }
    async function fetchProjectData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }))

        // Fetch all data in parallel for better performance
        const [projectResult, milestonesResult, mediaResult, foldersResult] =
          await Promise.allSettled([
            supabase.from('projects').select('*').eq('id', projectId).single(),
            supabase
              .from('milestones')
              .select('*')
              .eq('project_id', projectId)
              .order('created_at', { ascending: true }),
            supabase
              .from('media')
              .select(
                'id, title, file_url, mime_type, file_size, created_at, uploaded_by, project_id'
              )
              .eq('project_id', projectId)
              .order('created_at', { ascending: false }),
            supabase
              .from('folders')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', projectId),
          ])

        // Handle project result
        if (projectResult.status === 'rejected') {
          throw new Error(`Error fetching project: ${projectResult.reason}`)
        }
        if (projectResult.value.error) {
          throw new Error(
            `Error fetching project: ${projectResult.value.error.message}`
          )
        }

        const project = projectResult.value.data
        if (!project) {
          throw new Error('Project not found')
        }

        // Handle milestones result
        const milestones =
          milestonesResult.status === 'fulfilled'
            ? milestonesResult.value.data || []
            : []

        // Handle media result
        const media =
          mediaResult.status === 'fulfilled' ? mediaResult.value.data || [] : []

        // Handle folders result
        const foldersCount =
          foldersResult.status === 'fulfilled'
            ? foldersResult.value.count || 0
            : 0

        // Calculate milestone progress efficiently
        const milestonesWithProgress = await Promise.all(
          milestones.map(async (milestone) => {
            const { data: tasks } = await supabase
              .from('milestone_tasks')
              .select('status')
              .eq('milestone_id', milestone.id)

            const totalTasks = tasks?.length || 0
            const completedTasks =
              tasks?.filter((task) => task.status === 'completed').length || 0
            const progress =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0

            return {
              ...milestone,
              progress,
            }
          })
        )

        // Transform media into assets efficiently
        let assets: Asset[] = []
        let projectMembers: any[] = []

        // Fetch project members once for all assets
        if (project && project.client_id) {
          const { data: membersData } = await supabase
            .from('client_users')
            .select('user:users(id,name,email,avatar_url)')
            .eq('client_id', project.client_id)
            .limit(3)

          projectMembers = (membersData || [])
            .filter((m: any) => m.user && m.user.id)
            .map((m: any) => ({
              id: m.user.id,
              name: m.user.name || 'Unknown User',
              avatar_url: m.user.avatar_url || '',
            }))

          // Transform media without async operations
          assets = media.map((item: any) => {
            // Determine type based on mime_type
            let type: 'image' | 'video' | 'audio' | 'document' = 'document'
            if (item.mime_type?.startsWith('image/')) {
              type = 'image'
            } else if (item.mime_type?.startsWith('video/')) {
              type = 'video'
            } else if (item.mime_type?.startsWith('audio/')) {
              type = 'audio'
            }

            return {
              id: item.id.toString(),
              name: item.title || 'Unnamed File',
              type,
              url: item.file_url || '',
              thumbnail: type === 'image' ? item.file_url : undefined,
              size: item.file_size
                ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB`
                : '0 MB',
              uploadedAt: item.created_at || '',
              uploadedBy: 'Unknown User',
              uploadedByAvatar:
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32',
              status: item.status || 'pending',
              milestoneId: null, // Não há relacionamento direto milestone_id na tabela media atual
              projectMembers,
              width: item.width ?? undefined,
              height: item.height ?? undefined,
            }
          })
        }

        const finalData = {
          project,
          milestones: milestonesWithProgress,
          assets,
          loading: false,
          error: null,
          foldersCount: foldersCount || 0,
        }

        // Salvar no cache
        projectCache.set(projectId, finalData)

        setData(finalData)
      } catch (error) {
        console.error('Error fetching project data:', error)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    if (projectId) {
      fetchProjectData()
    }

    // Realtime listener para milestones
    let channel: RealtimeChannel | null = null
    if (projectId) {
      channel = supabase
        .channel('milestones-realtime-' + projectId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'milestones',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            fetchProjectData()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            fetchProjectData()
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [projectId])

  return data
}
