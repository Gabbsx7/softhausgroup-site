'use client'

import AssetCard from './AssetCard'

interface AssetCardWrapperProps {
  asset: any // Aceita qualquer formato de asset
  onApprove?: (id: string) => void
  onDownload?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  onViewAsset?: (asset: any) => void
  onClick?: (asset: any) => void
}

export default function AssetCardWrapper({
  asset,
  ...handlers
}: AssetCardWrapperProps) {
  // Debug detalhado
  console.log('[AssetCardWrapper] original:', asset)

  // Normalizar o asset para o formato esperado pelo AssetCard
  const normalizedAsset = {
    id: asset.id || '',
    name: asset.name || asset.title || 'Unnamed Asset',
    url: asset.url || asset.file_url || '',
    thumbnail:
      asset.thumbnail ||
      asset.previewImage ||
      // Se for imagem, usa a própria URL como thumbnail
      (asset.type === 'image' ||
      asset.type === 'Image' ||
      asset.mime_type?.startsWith('image/') ||
      isImageUrl(asset.url || asset.file_url)
        ? asset.url || asset.file_url
        : undefined),
    status: asset.status || 'pending',
    projectMembers: asset.projectMembers || [],
    type: normalizeType(asset),
  }

  // Log detalhado do asset normalizado
  console.log('[AssetCardWrapper] normalized:', normalizedAsset)
  if (!normalizedAsset.url) {
    console.warn('[AssetCardWrapper] Asset sem URL:', normalizedAsset)
  }
  if (!normalizedAsset.type) {
    console.warn('[AssetCardWrapper] Asset sem tipo:', normalizedAsset)
  }
  if (normalizedAsset.type === 'image' && !normalizedAsset.thumbnail) {
    console.warn(
      '[AssetCardWrapper] Asset de imagem sem thumbnail:',
      normalizedAsset
    )
  }

  return <AssetCard asset={normalizedAsset} {...handlers} />
}

function normalizeType(asset: any): 'image' | 'video' | 'audio' | 'document' {
  // Verificar campo type primeiro
  if (asset.type) {
    const type = asset.type.toLowerCase()
    if (['image', 'video', 'audio', 'document'].includes(type)) {
      return type as any
    }
  }

  // Verificar mime_type
  if (asset.mime_type) {
    if (asset.mime_type.startsWith('image/')) return 'image'
    if (asset.mime_type.startsWith('video/')) return 'video'
    if (asset.mime_type.startsWith('audio/')) return 'audio'
  }

  // Verificar pela URL/extensão do arquivo
  const url = asset.url || asset.file_url || ''
  if (isImageUrl(url)) return 'image'
  if (isVideoUrl(url)) return 'video'
  if (isAudioUrl(url)) return 'audio'

  // Default para document
  return 'document'
}

function isImageUrl(url: string): boolean {
  if (!url) return false
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.bmp',
    '.ico',
  ]
  const urlLower = url.toLowerCase()
  return imageExtensions.some((ext) => urlLower.includes(ext))
}

function isVideoUrl(url: string): boolean {
  if (!url) return false
  const videoExtensions = [
    '.mp4',
    '.webm',
    '.ogg',
    '.mov',
    '.avi',
    '.wmv',
    '.flv',
    '.mkv',
  ]
  const urlLower = url.toLowerCase()
  return videoExtensions.some((ext) => urlLower.includes(ext))
}

function isAudioUrl(url: string): boolean {
  if (!url) return false
  const audioExtensions = [
    '.mp3',
    '.wav',
    '.ogg',
    '.m4a',
    '.aac',
    '.flac',
    '.wma',
  ]
  const urlLower = url.toLowerCase()
  return audioExtensions.some((ext) => urlLower.includes(ext))
}
