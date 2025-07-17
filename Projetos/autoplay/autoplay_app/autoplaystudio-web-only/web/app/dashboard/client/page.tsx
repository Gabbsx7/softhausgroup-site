'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/components/role-based/permissions'
import { Loader2 } from 'lucide-react'

export default function ClientRedirectPage() {
  const router = useRouter()
  const { isStudioMember, clientId, loading } = usePermissions()

  useEffect(() => {
    if (loading) return

    // Caso seja membro de studio mas sem clientId, redireciona para página inicial (lá haverá seletor futuramente)
    if (isStudioMember) {
      // Se não tivermos clientId, enviamos para home
      if (!clientId) {
        router.push('/')
        return
      }

      router.push(`/dashboard/client/${clientId}`)
      return
    }

    // Para membros de client, usar o clientId obtido pelas permissões
    if (clientId) {
      router.push(`/dashboard/client/${clientId}`)
      return
    }

    // Fallback: volta para home (que tratará o redirecionamento)
    router.push('/')
  }, [router, isStudioMember, clientId, loading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to client dashboard...</p>
      </div>
    </div>
  )
}
