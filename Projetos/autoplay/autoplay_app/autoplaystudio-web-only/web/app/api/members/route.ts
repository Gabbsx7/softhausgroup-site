import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, metadata = {}, role, type, client_id, studio_id } = body

    // Validar campos obrigatórios
    if (!email || !role || !type) {
      return NextResponse.json(
        { error: 'Fields "email", "role" and "type" are required.' },
        { status: 400 }
      )
    }

    if (type === 'client' && !client_id) {
      return NextResponse.json(
        { error: 'client_id is required for client members' },
        { status: 400 }
      )
    }

    if (type === 'studio' && !studio_id) {
      return NextResponse.json(
        { error: 'studio_id is required for studio members' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient()

    // 1. Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let userId = existingUser?.id
    let userWasCreated = false

    if (!userId) {
      // 2. Criar usuário no auth e na tabela users se não existir
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: '12345678', // Senha temporária
          email_confirm: true,
          user_metadata: metadata,
        })

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      if (!authUser.user?.id) {
        return NextResponse.json(
          { error: 'Failed to create user in auth' },
          { status: 500 }
        )
      }

      userId = authUser.user.id
      userWasCreated = true

      // 3. Inserir na tabela public.users
      const publicUser = {
        id: userId,
        email,
        name: metadata.name || null,
        job_title: metadata.job_title || null,
      }

      const { error: userError } = await supabase
        .from('users')
        .insert(publicUser)

      if (userError) {
        return NextResponse.json(
          { error: `Failed to insert into users table: ${userError.message}` },
          { status: 500 }
        )
      }
    }

    // 4. Buscar role_id
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: `Role "${role}" not found` },
        { status: 400 }
      )
    }

    // 5. Criar relação baseada no tipo da role
    // Determinar tipo de relação pela role
    let relationType: 'studio' | 'client' | null = null
    if (role.startsWith('studio_')) {
      relationType = 'studio'
    } else if (role.startsWith('client_') || role === 'guest') {
      relationType = 'client'
    } else if (type === 'studio' || type === 'client') {
      // fallback para compatibilidade
      relationType = type
    }
    if (!relationType) {
      return NextResponse.json(
        { error: `Could not determine relation type for role '${role}'` },
        { status: 400 }
      )
    }
    if (relationType === 'studio') {
      // Verificar se já existe relação (usando any para evitar problemas de tipo)
      const { data: existingStudioMember } = await (supabase as any)
        .from('studio_members')
        .select('id')
        .eq('user_id', userId)
        .eq('studio_id', studio_id)
        .single()
      if (!existingStudioMember) {
        const { error: studioMemberError } = await (supabase as any)
          .from('studio_members')
          .insert({
            user_id: userId,
            studio_id: studio_id,
            role_id: roleData.id,
          })
        if (studioMemberError) {
          return NextResponse.json(
            {
              error: `Failed to add studio member: ${studioMemberError.message}`,
            },
            { status: 500 }
          )
        }
      }
    } else if (relationType === 'client') {
      // Verificar se já existe relação
      const { data: existingClientMember } = await supabase
        .from('client_users')
        .select('id')
        .eq('user_id', userId)
        .eq('client_id', client_id)
        .single()
      if (!existingClientMember) {
        const { error: clientMemberError } = await supabase
          .from('client_users')
          .insert({
            user_id: userId,
            client_id: client_id,
            role_id: roleData.id,
          })
        if (clientMemberError) {
          return NextResponse.json(
            {
              error: `Failed to add client member: ${clientMemberError.message}`,
            },
            { status: 500 }
          )
        }
      }
    }

    console.log('[API/MEMBERS] Iniciando fluxo de convite para', email)
    // 6. Gerar magic link para login e setup
    let magicLink = null
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup?email=${email}`,
        },
      })
    console.log('[API/MEMBERS] generateLink:', { linkData, linkError })
    if (linkError) {
      console.warn('Failed to generate magic link:', linkError.message)
    } else {
      magicLink = linkData?.properties?.action_link || null
      console.log('[API/MEMBERS] magicLink gerado:', magicLink)
      if (magicLink) {
        // Envio de e-mail via Edge Function sendEmail
        try {
          const sendEmailResponse = await fetch(
            'https://hgraqbucwvqkbbhhhtps.supabase.co/functions/v1/sendEmail',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                redirect_to: `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup?email=${email}`,
              }),
            }
          )
          const sendEmailResult = await sendEmailResponse.json()
          if (!sendEmailResponse.ok) {
            console.error(
              '[API/MEMBERS] Erro ao enviar e-mail via Edge Function:',
              sendEmailResult.error
            )
            return NextResponse.json(
              {
                error: 'Erro ao enviar e-mail de convite',
                magicLink,
                sendEmailResult,
              },
              { status: 500 }
            )
          }
        } catch (err) {
          console.error(
            '[API/MEMBERS] Erro inesperado ao chamar Edge Function sendEmail:',
            err
          )
          return NextResponse.json(
            {
              error: 'Erro inesperado ao enviar e-mail de convite',
              magicLink,
            },
            { status: 500 }
          )
        }
      }
    }
    console.log(
      '[API/MEMBERS] Fim do fluxo. userId:',
      userId,
      'magicLink:',
      magicLink
    )

    return NextResponse.json({
      success: true,
      message: 'Member created/related and magic link sent',
      userId,
      magicLink,
    })
  } catch (error: any) {
    console.error('Error in /api/members:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
