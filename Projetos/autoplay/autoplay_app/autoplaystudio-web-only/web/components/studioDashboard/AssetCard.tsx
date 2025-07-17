'use client'

import React, { useState, useEffect } from 'react'
import { Download, MoreHorizontal, Check } from 'lucide-react'

interface ProjectMember {
  id: string
  name: string
  avatar_url?: string
}

interface AssetCardProps {
  asset?: {
    id: string
    name: string
    url: string
    thumbnail?: string
    status: 'approved' | 'pending' | 'rejected'
    projectMembers?: any[]
    mime_type: string // Corrigido: garantir que sempre exista
  }
  // Props antigas para compatibilidade
  name?: string
  type?: string
  size?: string
  previewImage?: string
  approved?: boolean
  approvedAvatars?: string[]
  deniedAvatars?: string[]
  fileUrl?: string
  onDelete?: (id: string) => void
  id?: string
  // Novos handlers
  onApprove?: (id: string) => void
  onDownload?: (id: string) => void
  onReject?: (id: string) => void
  onViewAsset?: (asset: any) => void
  onClick?: (asset: any) => void
}

export function AssetCard({
  asset,
  // Props antigas para compatibilidade
  name,
  type,
  size,
  previewImage,
  approved = false,
  approvedAvatars = [],
  deniedAvatars = [],
  fileUrl,
  onDelete,
  id,
  // Novos handlers
  onApprove,
  onDownload,
  onReject,
  onViewAsset,
  onClick,
}: AssetCardProps) {
  const [checked, setChecked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Normalizar dados - usar props do asset se disponível, senão usar props antigas
  const assetData = asset || {
    id: id || '',
    name: name || 'Unnamed Asset',
    url: fileUrl || '',
    thumbnail: previewImage,
    status: (approved ? 'approved' : 'pending') as
      | 'approved'
      | 'pending'
      | 'rejected',
    projectMembers: [],
    mime_type: type || '',
  }

  // Garantir que os dados essenciais existam
  const safeAssetData = {
    id: assetData.id || '',
    name: assetData.name || 'Unnamed Asset',
    url: assetData.url || '',
    thumbnail: assetData.thumbnail,
    status: assetData.status || 'pending',
    projectMembers: assetData.projectMembers || [],
    mime_type: assetData.mime_type || '',
  }

  // Handlers
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (onApprove) {
        await onApprove(safeAssetData.id)
        setFeedback({ type: 'success', message: 'Asset approved!' })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error approving asset',
      })
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (onDownload) {
        await onDownload(safeAssetData.id)
        setFeedback({ type: 'success', message: 'Download started!' })
      } else {
        const url = safeAssetData.url
        if (!url) throw new Error('No file URL')
        const link = document.createElement('a')
        link.href = url
        link.download = safeAssetData.name || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setFeedback({ type: 'success', message: 'Download started!' })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error downloading asset',
      })
    }
  }

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (onReject) {
        await onReject(safeAssetData.id)
        setFeedback({ type: 'success', message: 'Asset rejected!' })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error rejecting asset',
      })
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (onDelete) {
        await onDelete(safeAssetData.id)
        setFeedback({ type: 'success', message: 'Asset deleted!' })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error deleting asset',
      })
    }
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewAsset) {
      onViewAsset(safeAssetData)
    } else if (safeAssetData.url) {
      window.open(safeAssetData.url, '_blank')
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(safeAssetData)
    }
  }

  // Limpar feedback após 2 segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  return (
    <div
      className="bg-white rounded-[12px] flex flex-col shadow-sm border border-[#F0F0F0] w-full h-[260px] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Feedback visual */}
      {feedback && (
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-xs font-semibold z-20 ${
            feedback.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {/* Top */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((v) => !v)}
            onClick={(e) => e.stopPropagation()}
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
              setMenuOpen((v) => !v)
            }}
          >
            <MoreHorizontal className="w-5 h-5 text-[#676767]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 border border-gray-100 text-[13px]">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                onClick={handleView}
              >
                View Asset
              </button>
              {onReject && (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500"
                  onClick={handleReject}
                >
                  Reject
                </button>
              )}
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mid */}
      <div className="flex-1 flex items-center justify-center px-3 py-2">
        {safeAssetData.thumbnail ? (
          safeAssetData.mime_type?.startsWith('image/') ? (
            <img
              src={safeAssetData.thumbnail}
              alt={safeAssetData.name}
              className="object-cover rounded-[4px] w-full h-[100px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML =
                    '<div class="bg-gray-200 rounded-[4px] w-full h-[100px]"></div>'
                }
              }}
            />
          ) : safeAssetData.mime_type?.startsWith('video/') ? (
            <video
              src={safeAssetData.thumbnail}
              className="object-cover rounded-[4px] w-full h-[100px]"
              controls
            />
          ) : safeAssetData.mime_type === 'application/pdf' ? (
            <iframe
              src={safeAssetData.url}
              className="w-full h-[100px] rounded-[4px] border"
              title={safeAssetData.name}
            />
          ) : safeAssetData.mime_type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
            <a
              href={safeAssetData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center w-full h-[100px] bg-gray-100 rounded-[4px] hover:bg-gray-200 transition"
            >
              <span className="text-3xl">📄</span>
              <span className="text-xs mt-1">Open DOCX</span>
            </a>
          ) : (
            <div className="bg-gray-200 rounded-[4px] w-full h-[100px]" />
          )
        ) : (
          <div className="bg-gray-200 rounded-[4px] w-full h-[100px]" />
        )}
      </div>

      {/* Bot */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
        {/* Download */}
        <button
          className="w-9 h-9 bg-black rounded-full flex items-center justify-center hover:bg-[#222]"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 text-white" />
        </button>

        {/* Avatares */}
        <div className="flex -space-x-2">
          {safeAssetData.projectMembers.slice(0, 3).map((member, index) => (
            <img
              key={member.id || index}
              src={
                member.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name || 'User'
                )}&background=random`
              }
              alt={member.name || 'User'}
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
              title={member.name || 'User'}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name || 'User'
                )}&background=random`
              }}
            />
          ))}

          {/* Fallback para avatares antigos */}
          {(!safeAssetData.projectMembers ||
            safeAssetData.projectMembers.length === 0) && (
            <>
              {approvedAvatars.slice(0, 2).map((avatar, index) => (
                <div
                  key={`approved-${index}`}
                  className="w-7 h-7 bg-blue-400 border-2 border-white rounded-full flex items-center justify-center text-xs text-white"
                >
                  {avatar.charAt(0)}
                </div>
              ))}
              {deniedAvatars.slice(0, 1).map((avatar, index) => (
                <div
                  key={`denied-${index}`}
                  className="w-7 h-7 bg-orange-400 border-2 border-white rounded-full flex items-center justify-center text-xs text-white"
                >
                  {avatar.charAt(0)}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Approve */}
        <button
          className="bg-[#93D693] hover:bg-[#7FC87A] text-[#3A6441] text-[11px] font-bold uppercase rounded-[6px] px-4 py-2 flex items-center gap-1"
          onClick={handleApprove}
          disabled={safeAssetData.status === 'approved'}
        >
          <Check className="w-4 h-4" />{' '}
          {safeAssetData.status === 'approved' ? 'Approved' : 'Approve'}
        </button>
      </div>
    </div>
  )
}
