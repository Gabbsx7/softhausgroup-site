import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CanvasObject } from '@/stores/canvasStore'

export interface ProjectAsset {
  id: string
  title: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  alt_text: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export function useProjectAssets(projectId: string) {
  const [assets, setAssets] = useState<ProjectAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('media')
          .select(
            `
            id,
            title,
            file_url,
            file_size,
            mime_type,
            width,
            height,
            alt_text,
            description,
            created_at,
            updated_at
          `
          )
          .eq('project_id', projectId)
          // .eq('status', 'approved') // Removendo filtro para ver todos os assets
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        // console.log('Assets fetched:', data?.length || 0, 'assets')
        // console.log('Assets data:', data)
        setAssets(data || [])
      } catch (err) {
        console.error('Erro ao buscar assets:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [projectId, supabase])

  // Converter assets para objetos do canvas
  const convertAssetsToCanvasObjects = (
    assets: ProjectAsset[]
  ): CanvasObject[] => {
    // console.log('Converting assets to canvas objects:', assets.length, 'assets')
    return assets.map((asset, index) => ({
      id: `asset-${asset.id}`,
      type: 'asset' as const,
      name: asset.title,
      x: 100 + (index % 3) * 420, // Organizar em grid 3 colunas
      y: 100 + Math.floor(index / 3) * 320, // Espaçamento vertical
      width: asset.width || 375,
      height: asset.height || 250,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 1,
      locked: false,
      data: {
        assetId: asset.id,
        imageUrl: asset.file_url,
        title: asset.title,
        file_url: asset.file_url,
      },
      createdAt: new Date(asset.created_at),
      updatedAt: new Date(asset.updated_at),
    }))
  }

  const canvasObjects = convertAssetsToCanvasObjects(assets)

  // Função para recarregar assets
  const refreshAssets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('media')
        .select(
          `
          id,
          title,
          file_url,
          file_size,
          mime_type,
          width,
          height,
          alt_text,
          description,
          created_at,
          updated_at
        `
        )
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setAssets(data || [])
    } catch (err) {
      console.error('Erro ao recarregar assets:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return {
    assets,
    canvasObjects,
    loading,
    error,
    refreshAssets,
  }
}

// Hook para buscar um asset específico
export function useAsset(assetId: string) {
  const [asset, setAsset] = useState<ProjectAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!assetId) return

    const fetchAsset = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('media')
          .select(
            `
            id,
            title,
            file_url,
            file_size,
            mime_type,
            width,
            height,
            alt_text,
            description,
            created_at,
            updated_at
          `
          )
          .eq('id', assetId)
          .single()

        if (error) {
          throw error
        }

        setAsset(data)
      } catch (err) {
        console.error('Erro ao buscar asset:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchAsset()
  }, [assetId, supabase])

  return {
    asset,
    loading,
    error,
  }
}

// Hook para assets filtrados por tipo
export function useAssetsByType(projectId: string, mimeType: string) {
  const { assets, loading, error, refreshAssets } = useProjectAssets(projectId)

  const filteredAssets = assets.filter(
    (asset) => asset.mime_type?.startsWith(mimeType) || false
  )

  return {
    assets: filteredAssets,
    loading,
    error,
    refreshAssets,
  }
}

// Hook para estatísticas de assets
export function useAssetsStats(projectId: string) {
  const { assets, loading } = useProjectAssets(projectId)

  const stats = {
    total: assets.length,
    images: assets.filter((a) => a.mime_type?.startsWith('image/')).length,
    videos: assets.filter((a) => a.mime_type?.startsWith('video/')).length,
    documents: assets.filter((a) => a.mime_type?.startsWith('application/'))
      .length,
    totalSize: assets.reduce((sum, a) => sum + (a.file_size || 0), 0),
  }

  return {
    stats,
    loading,
  }
}
