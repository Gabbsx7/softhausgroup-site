'use client'

import React, { useState, useEffect } from 'react'
import { Download, MoreHorizontal, Check } from 'lucide-react'

interface ProjectMember {
  id: string
  name: string
  avatar_url?: string
}

interface AssetCardProps {
  asset: {
    id: string
    name: string
    url: string
    thumbnail?: string
    status: 'approved' | 'pending' | 'rejected'
    projectMembers?: ProjectMember[]
    type?: 'image' | 'video' | 'audio' | 'document' // Tornar opcional
  }
  onApprove?: (id: string) => void
  onDownload?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  onViewAsset?: (asset: any) => void
  onClick?: (asset: any) => void
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onApprove,
  onDownload,
  onReject,
  onDelete,
  onViewAsset,
  onClick,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [imgError, setImgError] = useState(false)

  const assetData = {
    id: asset?.id || '',
    name: asset?.name || 'Unnamed Asset',
    url: asset?.url || '',
    thumbnail:
      asset?.thumbnail || (asset?.type === 'image' ? asset?.url : undefined),
    status: asset?.status || 'pending',
    projectMembers: asset?.projectMembers || [],
    type: asset?.type || 'document',
  }

  const safeAssetData = assetData

  const showFeedback = (message: string) => {
    setFeedback(message)
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleApprove = () => {
    onApprove?.(safeAssetData.id)
    showFeedback('Asset approved!')
  }

  const handleReject = () => {
    onReject?.(safeAssetData.id)
    showFeedback('Asset rejected!')
  }

  const handleDelete = () => {
    onDelete?.(safeAssetData.id)
    showFeedback('Asset deleted!')
  }

  const handleDownload = () => {
    onDownload?.(safeAssetData.id)
    showFeedback('Download started!')
  }

  const handleViewAsset = () => {
    onViewAsset?.(safeAssetData)
  }

  return (
    <div
      className="bg-white rounded-[12px] flex flex-col shadow-sm border border-[#F0F0F0] w-full h-[260px] cursor-pointer"
      onClick={() => onClick?.(safeAssetData)}
    >
      {/* Feedback */}
      {feedback && (
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-xs font-semibold z-20 ${
            feedback.includes('approved') || feedback.includes('started')
              ? 'bg-green-100 text-green-800'
              : feedback.includes('rejected') || feedback.includes('deleted')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            onChange={(e) => {
              e.stopPropagation()
            }}
            className="w-4 h-4 accent-black rounded"
          />
          <span className="text-[11px] font-medium text-[#222] truncate max-w-[120px]">
            {safeAssetData.name}
          </span>
        </div>
        <div className="relative">
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown(!showDropdown)
            }}
          >
            <MoreHorizontal className="w-5 h-5 text-[#676767]" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 border border-gray-100 text-[13px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewAsset()
                  setShowDropdown(false)
                }}
              >
                View Asset
              </button>
              {onReject && (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReject()
                    setShowDropdown(false)
                  }}
                >
                  Reject
                </button>
              )}
              {onDelete && (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                    setShowDropdown(false)
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center px-3 py-2 min-h-[100px]">
        {(() => {
          console.log('[AssetCard] preview', {
            type: safeAssetData.type,
            thumbnail: safeAssetData.thumbnail,
            url: safeAssetData.url,
            name: safeAssetData.name,
            imgError,
          })
          if (
            safeAssetData.type === 'image' &&
            safeAssetData.thumbnail &&
            !imgError
          ) {
            let imgSrc = safeAssetData.thumbnail
            try {
              imgSrc = decodeURIComponent(safeAssetData.thumbnail)
            } catch (e) {
              // Se der erro, usa o original
              console.warn(
                '[AssetCard] decodeURIComponent falhou, usando original',
                safeAssetData.thumbnail
              )
            }
            return (
              <img
                src={imgSrc}
                alt={safeAssetData.name}
                className="object-cover rounded-[4px] w-full h-[100px]"
                onError={() => {
                  setImgError(true)
                  console.error('[AssetCard] Erro ao carregar imagem', {
                    src: imgSrc,
                    asset: safeAssetData,
                  })
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                }}
              />
            )
          } else if (safeAssetData.type === 'video' && safeAssetData.url) {
            return (
              <video
                src={safeAssetData.url}
                className="object-cover rounded-[4px] w-full h-[100px]"
                controls={false}
              />
            )
          } else if (safeAssetData.type === 'document') {
            return (
              <div className="flex flex-col items-center justify-center w-full h-[100px] bg-gray-100 rounded-[4px]">
                <span className="text-3xl">📄</span>
                <span className="text-xs mt-1">Document</span>
              </div>
            )
          } else {
            if (safeAssetData.type === 'image' && imgError) {
              console.warn(
                '[AssetCard] Fallback visual para imagem com erro',
                safeAssetData
              )
            }
            return (
              <div className="bg-gray-200 rounded-[4px] w-full h-[100px]" />
            )
          }
        })()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
        <button
          className="w-9 h-9 bg-black rounded-full flex items-center justify-center hover:bg-[#222]"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
        >
          <Download className="w-4 h-4 text-white" />
        </button>
        <div className="flex -space-x-2">
          {safeAssetData.projectMembers.slice(0, 3).map((member) => (
            <img
              key={member.id}
              src={member.avatar_url || '/default-avatar.png'}
              alt={member.name}
              className="w-6 h-6 rounded-full border-2 border-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/default-avatar.png'
              }}
            />
          ))}
        </div>
        <button
          className="bg-[#93D693] hover:bg-[#7FC87A] text-[#3A6441] text-[11px] font-bold uppercase rounded-[6px] px-4 py-2 flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation()
            handleApprove()
          }}
          disabled={safeAssetData.status === 'approved'}
        >
          <Check className="w-4 h-4" />{' '}
          {safeAssetData.status === 'approved' ? 'Approved' : 'Approve'}
        </button>
      </div>
    </div>
  )
}

export default AssetCard
