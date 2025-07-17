// apps/web/app/page.tsx - Responsivo
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { usePermissions } from '@/components/role-based/permissions'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const {
    role,
    isStudioMember,
    clientId,
    loading: permissionsLoading,
  } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    // Aguarda o carregamento da autenticação e permissões
    if (authLoading || permissionsLoading) {
      return
    }

    // Se não há usuário logado, redireciona para login
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Se o usuário está logado, verifica o tipo e redireciona
    if (role && role !== 'guest') {
      if (isStudioMember) {
        // Usuário é membro de um studio - redireciona para studio dashboard
        window.location.href = '/dashboard/stdio'
      } else if (clientId) {
        // Usuário é membro de um client - redireciona para client dashboard específico
        router.push(`/dashboard/client/${clientId}`)
      } else {
        // Usuário tem role mas não tem clientId - redireciona para login
        router.push('/auth/login')
      }
    } else {
      // Usuário não tem permissões válidas - redireciona para login
      router.push('/auth/login')
    }
  }, [
    user,
    role,
    isStudioMember,
    clientId,
    authLoading,
    permissionsLoading,
    router,
  ])

  // Loading state enquanto verifica autenticação e permissões
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Fallback - não deveria chegar aqui, mas por segurança
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
