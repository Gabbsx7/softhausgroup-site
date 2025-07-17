import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DesignRoomUI from '@/components/design-room/DesignRoomUI'

interface PageProps {
  params: {
    clientId: string
    projectId: string
  }
  searchParams: { mode?: 'view' | 'edit' }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', params.projectId)
    .single()

  return {
    title: `Design Room - ${project?.name || 'Project'}`,
    description: 'Collaborative design workspace powered by Autoplay Studio',
  }
}

export default async function DesignRoomPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = createServerSupabaseClient()

  // Verificar se o usuário tem acesso ao projeto
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verificar se o projeto existe e pertence ao cliente
  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      name,
      description,
      client_id,
      clients (
        id,
        name
      )
    `
    )
    .eq('id', params.projectId)
    .eq('client_id', params.clientId)
    .single()

  if (error || !project) {
    redirect(`/dashboard/client/${params.clientId}`)
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Suspense
        fallback={
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading Design Room...</p>
            </div>
          </div>
        }
      >
        <DesignRoomUI
          projectId={params.projectId}
          clientId={params.clientId}
          project={project as any}
          mode={searchParams.mode || 'edit'}
          user={user}
        />
      </Suspense>
    </div>
  )
}
