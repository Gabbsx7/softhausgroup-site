import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  thumbnail?: string
  size: string
  uploadedAt: string
  uploadedBy: string
  uploadedByAvatar?: string
  status: 'approved' | 'pending' | 'rejected'
  project_id: string
  client_id: string
  file_size: number
  mime_type: string
  width?: number
  height?: number
}

export interface AssetWithUsers extends Asset {
  uploader: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  projectMembers: Array<{
    id: string
    name: string
    email: string
    avatar_url?: string
    role: string
  }>
}

// Novo hook para trabalhar com a estrutura real da tabela media
export const useAssetsForClient = (clientId?: string) => {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssets = async () => {
      if (!clientId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar assets diretamente filtrados por client_id
        const { data: assetsData, error: assetsError } = await supabase
          .from('media')
          .select(
            `
            id,
            title,
            file_url,
            file_size,
            mime_type,
            description,
            client_id,
            project_id,
            uploaded_by,
            created_at,
            users!media_uploaded_by_fkey (
              id,
              name,
              email
            )
          `
          )
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })

        if (assetsError) {
          console.error('Assets error:', assetsError)
          throw assetsError
        }

        // Transformar dados para o formato esperado pelo AssetCard
        const transformedAssets = (assetsData || []).map((media: any) => {
          const fileName = media.title || 'Unnamed Asset'

          // Determinar tipo baseado no mime_type
          let type = 'Image'
          if (media.mime_type?.startsWith('video/')) {
            type = 'Video'
          } else if (media.mime_type?.startsWith('audio/')) {
            type = 'Audio'
          } else if (
            media.mime_type?.includes('pdf') ||
            media.mime_type?.includes('document')
          ) {
            type = 'PDF'
          }

          // Usar file_url como preview se for imagem, caso contrário sem preview
          const previewImage = media.mime_type?.startsWith('image/')
            ? media.file_url
            : undefined

          return {
            id: media.id.toString(),
            name: fileName,
            type: type,
            previewImage: previewImage,
            approvedAvatars: [media.users?.name || 'Unknown'], // Mock approval data
            deniedAvatars: [], // Mock denial data
            // Dados adicionais para futuro uso
            originalData: {
              file_url: media.file_url,
              file_size: media.file_size,
              mime_type: media.mime_type,
              created_at: media.created_at,
              project_id: media.project_id,
              client_id: media.client_id,
              uploader: media.users,
            },
          }
        })

        setAssets(transformedAssets)
      } catch (err) {
        console.error('Error fetching assets:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()

    // --- SUPABASE REALTIME ---
    const channel = supabase
      .channel('media-inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media',
          ...(clientId ? { filter: `client_id=eq.${clientId}` } : {}),
        },
        (payload) => {
          // Transformar o asset inserido para o formato do AssetCard
          const media = payload.new
          const fileName = media.title || 'Unnamed Asset'
          let type = 'Image'
          if (media.mime_type?.startsWith('video/')) {
            type = 'Video'
          } else if (media.mime_type?.startsWith('audio/')) {
            type = 'Audio'
          } else if (
            media.mime_type?.includes('pdf') ||
            media.mime_type?.includes('document')
          ) {
            type = 'PDF'
          }
          const previewImage = media.mime_type?.startsWith('image/')
            ? media.file_url
            : undefined
          setAssets((prev) => {
            // Evitar duplicidade
            if (prev.some((a) => a.id === media.id)) return prev
            return [
              {
                id: media.id.toString(),
                name: fileName,
                type: type,
                previewImage: previewImage,
                approvedAvatars: [media.users?.name || 'Unknown'],
                deniedAvatars: [],
                originalData: {
                  file_url: media.file_url,
                  file_size: media.file_size,
                  mime_type: media.mime_type,
                  created_at: media.created_at,
                  project_id: media.project_id,
                  client_id: media.client_id,
                  uploader: media.users,
                },
              },
              ...prev,
            ]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, supabase])

  return { assets, loading, error }
}

// Hook original mantido para compatibilidade
export const useAssets = (projectId?: string, clientId?: string) => {
  const [assets, setAssets] = useState<AssetWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('media')
          .select(
            `
            id,
            file_url,
            file_size,
            mime_type,
            width,
            height,
            alt_text,
            description,
            project_id,
            client_id,
            created_at,
            updated_at,
            uploader:uploaded_by(
              id,
              name,
              email,
              avatar_url
            )
          `
          )
          .order('created_at', { ascending: false })

        // Filtrar por projeto se especificado
        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        // Filtrar por cliente se especificado
        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        const { data: mediaData, error: mediaError } = await query

        if (mediaError) throw mediaError

        // Buscar membros do projeto para cada asset
        const assetsWithUsers: AssetWithUsers[] = await Promise.all(
          (mediaData || []).map(async (media: any) => {
            // Buscar membros do projeto
            const { data: projectMembers } = await supabase
              .from('client_users')
              .select(
                `
                user:users(
                  id,
                  name,
                  email,
                  avatar_url
                ),
                role:roles(name)
              `
              )
              .eq('client_id', media.client_id)
              .limit(3) // Limitar a 3 membros para performance

            const members =
              projectMembers?.map((member) => ({
                id: (member.user as any).id,
                name: (member.user as any).name,
                email: (member.user as any).email,
                avatar_url: (member.user as any).avatar_url,
                role: (member.role as any)?.name || 'member',
              })) || []

            // Determinar tipo do arquivo baseado no mime_type
            let type: 'image' | 'video' | 'audio' | 'document' = 'document'
            if (media.mime_type?.startsWith('image/')) {
              type = 'image'
            } else if (media.mime_type?.startsWith('video/')) {
              type = 'video'
            } else if (media.mime_type?.startsWith('audio/')) {
              type = 'audio'
            }

            // Usar file_url como url e thumbnail para imagens
            const url = media.file_url || ''
            const thumbnailUrl = type === 'image' ? url : undefined

            // Gerar nome do arquivo baseado no file_url se name não existir
            const fileName = url
              ? url.split('/').pop() || 'Unnamed File'
              : 'Unnamed File'

            return {
              id: media.id,
              name: fileName,
              type,
              url: url,
              thumbnail: thumbnailUrl,
              size: formatFileSize(media.file_size || 0),
              uploadedAt: media.created_at,
              uploadedBy: (media.uploader as any)?.name || 'Unknown',
              uploadedByAvatar: (media.uploader as any)?.avatar_url,
              status: 'pending' as const, // Você pode adicionar uma coluna status na tabela media
              project_id: media.project_id,
              client_id: media.client_id,
              file_size: media.file_size || 0,
              mime_type: media.mime_type || '',
              width: media.width,
              height: media.height,
              uploader: {
                id: (media.uploader as any)?.id || '',
                name: (media.uploader as any)?.name || 'Unknown',
                email: (media.uploader as any)?.email || '',
                avatar_url: (media.uploader as any)?.avatar_url,
              },
              projectMembers: members,
            }
          })
        )

        setAssets(assetsWithUsers)
      } catch (err) {
        console.error('Error fetching assets:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (projectId || clientId) {
      fetchAssets()
    } else {
      setLoading(false)
    }
  }, [projectId, clientId, supabase])

  const uploadAsset = async (
    file: File,
    projectId: string,
    clientId: string
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload do arquivo (você precisa configurar o storage do Supabase)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${clientId}/${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Inserir registro na tabela media
      const { error: insertError } = await supabase.from('media').insert({
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        project_id: projectId,
        client_id: clientId,
        uploaded_by: user.id,
      })

      if (insertError) throw insertError

      // Recarregar assets
      return true
    } catch (error) {
      console.error('Error uploading asset:', error)
      throw error
    }
  }

  const approveAsset = async (assetId: string) => {
    try {
      // Aqui você pode adicionar lógica para aprovar o asset
      // Por exemplo, atualizar uma coluna 'status' na tabela media
      console.log('Approving asset:', assetId)

      // Atualizar estado local temporariamente
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId
            ? { ...asset, status: 'approved' as const }
            : asset
        )
      )
    } catch (error) {
      console.error('Error approving asset:', error)
      throw error
    }
  }

  const downloadAsset = async (asset: AssetWithUsers) => {
    try {
      // Gerar URL assinada para download
      const { data: signedUrl } = await supabase.storage
        .from('assets')
        .createSignedUrl(asset.url, 60) // URL válida por 60 segundos

      if (signedUrl?.signedUrl) {
        // Abrir URL em nova janela para download
        window.open(signedUrl.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading asset:', error)
      throw error
    }
  }

  return {
    assets,
    loading,
    error,
    uploadAsset,
    approveAsset,
    downloadAsset,
  }
}

// Hook para studio: todos os assets em tempo real
export const useAssetsRealtime = () => {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data: assetsData, error: assetsError } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false })
        if (assetsError) throw assetsError
        setAssets(assetsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
    const channel = supabase
      .channel('media-inserts-studio')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media',
        },
        (payload) => {
          const media = payload.new
          setAssets((prev) => {
            if (prev.some((a) => a.id === media.id)) return prev
            return [media, ...prev]
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  return { assets, loading, error }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
