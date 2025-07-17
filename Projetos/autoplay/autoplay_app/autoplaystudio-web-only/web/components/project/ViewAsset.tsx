import React from 'react'

interface ViewAssetProps {
  open: boolean
  onClose: () => void
  asset: {
    url: string
    name?: string
    mime_type?: string // Tornar opcional
  }
}

const getAssetType = (asset: {
  mime_type?: string
  url: string
  name?: string
}) => {
  if (asset.mime_type) {
    if (asset.mime_type.startsWith('image/')) return 'image'
    if (asset.mime_type.startsWith('video/')) return 'video'
    if (asset.mime_type === 'application/pdf') return 'pdf'
    if (
      asset.mime_type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return 'docx'
  }
  // Deduzir pelo nome/extensão
  const url = asset.url.toLowerCase()
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) return 'image'
  if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/)) return 'video'
  if (url.match(/\.pdf$/)) return 'pdf'
  if (url.match(/\.docx$/)) return 'docx'
  return 'unknown'
}

const ViewAsset: React.FC<ViewAssetProps> = ({ open, onClose, asset }) => {
  if (!open) return null

  // Decodificar a URL para evitar problemas de duplo encoding
  let assetUrl = asset.url
  try {
    assetUrl = decodeURIComponent(asset.url)
  } catch (e) {
    // Se der erro, usa o original
    console.warn(
      '[ViewAsset] decodeURIComponent falhou, usando original',
      asset.url
    )
  }
  const assetType = getAssetType(asset)
  console.log('[ViewAsset] asset recebido:', asset)
  console.log('[ViewAsset] assetUrl final:', assetUrl)
  console.log('[ViewAsset] assetType:', assetType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-transparent rounded-xl shadow-xl flex flex-col items-center justify-center">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
          aria-label="Fechar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6L14 14M14 6L6 14"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* Asset em destaque */}
        {assetType === 'image' ? (
          <img
            src={assetUrl}
            alt={asset.name || 'Asset'}
            className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-lg"
          />
        ) : assetType === 'video' ? (
          <video
            src={assetUrl}
            controls
            className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-lg"
          />
        ) : assetType === 'pdf' ? (
          <iframe
            src={assetUrl}
            title={asset.name || 'PDF'}
            className="w-[80vw] h-[80vh] rounded-lg shadow-lg bg-white"
          />
        ) : assetType === 'docx' ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl mb-4">📄</div>
            <div className="mb-2">DOCX document</div>
            <a
              href={assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open or Download
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl mb-4">❓</div>
            <div className="mb-2">Preview not available</div>
            <a
              href={assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewAsset
