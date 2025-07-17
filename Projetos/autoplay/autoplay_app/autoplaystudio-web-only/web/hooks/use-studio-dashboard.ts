import { useEffect, useState } from 'react'
import { useSupabase } from '../../../packages/hooks/src/use-supabase'
import { usePermissions } from '@/components/role-based/permissions'

export interface StudioDashboardClient {
  client_id: string
  client_name: string
  client_description: string
  client_logo_url: string
  is_active: boolean
}

export interface StudioDashboardProject {
  project_id: string
  project_name: string
  client_id: string
  client_name: string
  project_description?: string
  category?: string
  deadline?: string
  budget?: string
  status?: string
}

export function useStudioDashboard() {
  const supabase = useSupabase()
  const { studioId } = usePermissions()
  const [clients, setClients] = useState<StudioDashboardClient[]>([])
  const [projects, setProjects] = useState<StudioDashboardProject[]>([])
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientsAndProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      let currentStudioId = studioId
      if (!currentStudioId) {
        // Fallback para o studio padrão
        currentStudioId = 'fe0391e4-6d69-43c0-8aae-f611a5b40f21'
      }
      if (!currentStudioId) {
        setClients([])
        setProjects([])
        setData(null)
        setLoading(false)
        return
      }
      const { data: viewData, error } = await supabase
        .from('studio_dashboard_view')
        .select('*')
        .eq('studio_id', currentStudioId)
        .single()
      if (error) throw error

      // Armazenar os dados completos da view
      setData(viewData)

      const studioClients = (viewData?.clients || []).map((client: any) => ({
        client_id: client.client_id,
        client_name: client.client_name,
        client_description: client.client_description,
        client_logo_url: client.client_logo_url,
        is_active: client.client_is_active,
      }))
      setClients(studioClients)
      // Extrair todos os projetos de todos os clients
      const allProjects = (viewData?.clients || []).flatMap((client: any) =>
        (client.projects || []).map((project: any) => ({
          project_id: project.project_id,
          project_name: project.project_name,
          client_id: client.client_id,
          client_name: client.client_name,
          project_description: project.project_description,
          category: project.category,
          deadline: project.deadline,
          budget: project.budget,
          status: project.status,
        }))
      )
      setProjects(allProjects)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar clients/projetos do studio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientsAndProjects()
  }, [supabase, studioId])

  return {
    clients,
    projects,
    data,
    loading,
    error,
    refetch: fetchClientsAndProjects,
  }
}
