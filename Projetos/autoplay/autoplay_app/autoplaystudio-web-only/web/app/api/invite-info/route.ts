import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createRouteHandlerSupabaseClient()

    // Buscar o usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let inviteInfo: any = {
      role: null,
      roleName: null,
      clientName: null,
      studioName: null,
      type: null,
    }

    // Verificar se é membro do studio
    const { data: studioMember } = await (supabase as any)
      .from('studio_members')
      .select(
        `
        id,
        role_id,
        roles!inner(name),
        studio!inner(name)
      `
      )
      .eq('user_id', userData.id)
      .single()

    if (studioMember) {
      inviteInfo = {
        role: studioMember.roles?.name,
        roleName: studioMember.roles?.name
          ?.replace('_', ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        studioName: studioMember.studio?.name,
        type: 'studio',
      }
    } else {
      // Verificar se é membro do cliente
      const { data: clientMember } = await supabase
        .from('client_users')
        .select(
          `
          id,
          role_id,
          roles!inner(name),
          clients!inner(name)
        `
        )
        .eq('user_id', userData.id)
        .single()

      if (clientMember) {
        inviteInfo = {
          role: clientMember.roles?.name,
          roleName: clientMember.roles?.name
            ?.replace('_', ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          clientName: clientMember.clients?.name,
          type: 'client',
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: userData,
      invite: inviteInfo,
    })
  } catch (error: any) {
    console.error('Error in /api/invite-info:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
