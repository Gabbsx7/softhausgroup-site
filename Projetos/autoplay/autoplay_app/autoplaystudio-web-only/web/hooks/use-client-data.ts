'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { usePermissions } from '@/components/role-based/permissions'
import { useParams } from 'next/navigation'

interface ClientData {
  id: string
  name: string
  description?: string
  logo_url?: string
  created_at: string
}

interface ProjectData {
  id: string
  name: string
  description?: string
  status: string
  progress?: number
  due_date?: string
  client_id: string
}

interface AssetData {
  id: string
  name: string
  type: string
  url: string
  thumbnail_url?: string
  project_id: string
  created_at: string
  size?: number
  width?: number
  height?: number
}

interface MemberData {
  id: string
  name: string
  email: string
  avatar_url?: string
  role_name?: string
  is_primary?: boolean
}

interface MilestoneData {
  id: string
  name: string
  description?: string
  status: string
  project_id: string
  due_date?: string
  created_at: string
}

interface ClientStats {
  totalProjects: number
  activeProjects: number
  totalAssets: number
  totalMembers: number
  completedMilestones: number
  pendingMilestones: number
}

export const useClientData = () => {
  const { user } = useAuth()
  const { isStudioMember, clientId: userClientId } = usePermissions()
  const params = useParams()
  const clientIdFromPath = params?.clientId as string | undefined

  // Prioridade: path > permissões
  const targetClientId = clientIdFromPath || userClientId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<ClientData | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [assets, setAssets] = useState<AssetData[]>([])
  const [teamMembers, setTeamMembers] = useState<MemberData[]>([])
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalAssets: 0,
    totalMembers: 0,
    completedMilestones: 0,
    pendingMilestones: 0,
  })

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !targetClientId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar dados do client pela view agregada
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('client_dashboard_view')
          .select('*')
          .eq('client_id', targetClientId)
          .single()

        if (dashboardError) {
          console.error('Dashboard data error:', dashboardError)
          throw new Error(
            `Failed to fetch dashboard data: ${dashboardError.message}`
          )
        }

        if (dashboardData) {
          setClient({
            id: dashboardData.client_id,
            name: dashboardData.client_name,
            description: dashboardData.client_description,
            logo_url: dashboardData.client_logo_url,
            created_at: dashboardData.client_created_at,
          })
          setProjects(dashboardData.projects || [])
          setAssets(dashboardData.assets || [])
          setTeamMembers(
            (dashboardData.team_members || []).map((m: any) => ({
              id: m.user_id,
              name: m.user_name || m.user_email || 'Unknown',
              email: m.user_email || '',
              avatar_url: m.avatar_url || '',
              role_name: m.role_name || '',
              is_primary: m.is_primary || false,
            }))
          )
          setMilestones(dashboardData.milestones || [])
          setStats({
            totalProjects: dashboardData.stats?.total_projects || 0,
            activeProjects: dashboardData.stats?.active_projects || 0,
            totalAssets: dashboardData.stats?.total_assets || 0,
            totalMembers: dashboardData.stats?.total_members || 0,
            completedMilestones: dashboardData.stats?.completed_milestones || 0,
            pendingMilestones: dashboardData.stats?.pending_milestones || 0,
          })
        } else {
          setError('Client not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [user, targetClientId])

  return {
    loading,
    error,
    client,
    projects,
    assets,
    teamMembers,
    milestones,
    stats,
    // Additional info for debugging
    isStudioMember,
    targetClientId,
    userClientId,
    clientIdFromPath,
  }
}
