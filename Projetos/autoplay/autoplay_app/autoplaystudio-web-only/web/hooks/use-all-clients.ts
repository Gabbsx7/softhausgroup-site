import { useEffect, useState } from 'react'
import { useSupabase } from '../../../packages/hooks/src/use-supabase'

export interface StudioClient {
  client_id: string
  client_name: string
  client_description: string
  client_logo_url: string
  is_active: boolean
  assigned_users: any
}

export function useAllClients() {
  const supabase = useSupabase()
  const [clients, setClients] = useState<StudioClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.rpc('get_all_clients')
        if (error) throw error
        setClients(data || [])
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar clients')
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [supabase])

  return { clients, loading, error }
}
