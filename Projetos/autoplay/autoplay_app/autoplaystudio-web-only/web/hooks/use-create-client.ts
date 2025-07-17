import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ClientData {
  name: string
  website: string
  description: string
}

interface UserData {
  name: string
  jobTitle: string
  email: string
  role: string
}

interface CreateClientResult {
  clientId: string
  userId?: string
  success: boolean
  error?: string
}

export function useCreateClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const createClient = async (
    clientData: ClientData
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          description: clientData.description,
          site: clientData.website,
          is_active: true,
        })
        .select('id')
        .single()

      if (error) {
        throw new Error(`Failed to create client: ${error.message}`)
      }

      return data.id
    } catch (err) {
      console.error('Error creating client:', err)
      throw err
    }
  }

  const uploadLogo = async (
    file: File,
    clientId: string
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${clientId}.${fileExt}`
      const filePath = `client_logo/${fileName}`

      const { data, error } = await supabase.storage
        .from('userfiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw new Error(`Failed to upload logo: ${error.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('userfiles').getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Error uploading logo:', err)
      throw err
    }
  }

  const updateClientLogo = async (
    clientId: string,
    logoUrl: string
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ logo_url: logoUrl })
        .eq('id', clientId)

      if (error) {
        throw new Error(`Failed to update client logo: ${error.message}`)
      }
    } catch (err) {
      console.error('Error updating client logo:', err)
      throw err
    }
  }

  const getStudioId = async (): Promise<string | null> => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get studio_id from studio_members table
      const { data, error } = await supabase
        .from('studio_members')
        .select('studio_id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw new Error(`Failed to get studio ID: ${error.message}`)
      }

      return data.studio_id
    } catch (err) {
      console.error('Error getting studio ID:', err)
      throw err
    }
  }

  const linkClientToStudio = async (
    clientId: string,
    studioId: string
  ): Promise<void> => {
    try {
      const { error } = await supabase.from('client_studio').insert({
        client_id: clientId,
        studio_id: studioId,
      })

      if (error) {
        throw new Error(`Failed to link client to studio: ${error.message}`)
      }
    } catch (err) {
      console.error('Error linking client to studio:', err)
      throw err
    }
  }

  const createUser = async (
    userData: UserData,
    clientId: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'inviteNewUsers',
        {
          body: {
            email: userData.email,
            metadata: {
              name: userData.name,
              job_title: userData.jobTitle,
            },
            role: userData.role,
            client_id: clientId,
          },
        }
      )

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`)
      }

      return data.user?.id || null
    } catch (err) {
      console.error('Error creating user:', err)
      throw err
    }
  }

  const sendInviteEmail = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/setup`,
        },
      })

      if (error) {
        throw new Error(`Failed to send invite email: ${error.message}`)
      }
    } catch (err) {
      console.error('Error sending invite email:', err)
      throw err
    }
  }

  const createClientWithUser = async (
    clientData: ClientData,
    userData: UserData,
    logoFile?: File,
    logoUrl?: string
  ): Promise<CreateClientResult> => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create client
      const clientId = await createClient(clientData)
      if (!clientId) {
        throw new Error('Failed to create client')
      }

      // Step 2: Handle logo upload/update
      let finalLogoUrl = logoUrl
      if (logoFile) {
        const uploaded = await uploadLogo(logoFile, clientId)
        finalLogoUrl = uploaded === null ? undefined : uploaded
      }

      if (finalLogoUrl) {
        await updateClientLogo(clientId, finalLogoUrl)
      }

      // Step 3: Get studio ID and link client to studio
      const studioId = await getStudioId()
      if (studioId) {
        await linkClientToStudio(clientId, studioId)
      }

      // Step 4: Create user
      const userId = await createUser(userData, clientId)

      // Step 5: Send invite email
      await sendInviteEmail(userData.email)

      return {
        clientId,
        userId: userId || undefined,
        success: true,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return {
        clientId: '',
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Função para criar apenas o client, sem usuário
  const createClientOnly = async (
    clientData: ClientData,
    logoFile?: File,
    logoUrl?: string
  ): Promise<CreateClientResult> => {
    setLoading(true)
    setError(null)
    try {
      // Step 1: Create client
      const clientId = await createClient(clientData)
      if (!clientId) {
        throw new Error('Failed to create client')
      }
      // Step 2: Handle logo upload/update
      let finalLogoUrl = logoUrl
      if (logoFile) {
        const uploaded = await uploadLogo(logoFile, clientId)
        finalLogoUrl = uploaded === null ? undefined : uploaded
      }
      if (finalLogoUrl) {
        await updateClientLogo(clientId, finalLogoUrl)
      }
      // Step 3: Get studio ID and link client to studio
      const studioId = await getStudioId()
      if (studioId) {
        await linkClientToStudio(clientId, studioId)
      }
      return {
        clientId,
        success: true,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return {
        clientId: '',
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    createClientWithUser,
    createClientOnly,
    loading,
    error,
  }
}
