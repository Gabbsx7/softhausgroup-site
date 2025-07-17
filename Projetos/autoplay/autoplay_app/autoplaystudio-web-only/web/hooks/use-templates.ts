import { useEffect, useState } from 'react'
import { useSupabase } from '../../../packages/hooks/src/use-supabase'

export interface Template {
  id: string
  name: string
  description?: string
  created_at: string
}

export function useTemplates() {
  const supabase = useSupabase()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('project_templates')
          .select('*')
          .order('name')

        if (error) throw error
        setTemplates(data || [])
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar templates')
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [supabase])

  return { templates, loading, error }
}
