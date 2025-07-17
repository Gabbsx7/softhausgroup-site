import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Task {
  id: string
  name: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
  assigned_to?: string
  due_date?: string
  created_at: string
  milestone_id: string
}

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
  due_date?: string
  project_id: string
  client_id: string
  created_at: string
}

interface MilestoneData {
  milestone: Milestone | null
  tasks: Task[]
  assetsCount: number
  foldersCount: number
  loading: boolean
  error: string | null
}

export function useMilestoneData(milestoneId: string): MilestoneData {
  const [data, setData] = useState<MilestoneData>({
    milestone: null,
    tasks: [],
    assetsCount: 0,
    foldersCount: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchMilestoneData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }))

        // Fetch milestone data
        const { data: milestoneData, error: milestoneError } = await supabase
          .from('milestones')
          .select('*')
          .eq('id', milestoneId)
          .single()

        if (milestoneError) {
          throw new Error(`Error fetching milestone: ${milestoneError.message}`)
        }

        // Fetch milestone tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('milestone_tasks')
          .select('*')
          .eq('milestone_id', milestoneId)
          .order('created_at', { ascending: true })

        if (tasksError) {
          console.warn('Error fetching tasks:', tasksError.message)
        }

        // Fetch assets count using milestone_media junction table
        const { count: assetsCountData } = await supabase
          .from('milestone_media')
          .select('media_id', { count: 'exact', head: true })
          .eq('milestone_id', milestoneId)

        // Mock data for folders for now
        const foldersCount = 4

        setData({
          milestone: milestoneData,
          tasks: tasksData || [],
          assetsCount: assetsCountData || 0,
          foldersCount,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching milestone data:', error)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    if (milestoneId) {
      fetchMilestoneData()
    }
  }, [milestoneId])

  return data
}
