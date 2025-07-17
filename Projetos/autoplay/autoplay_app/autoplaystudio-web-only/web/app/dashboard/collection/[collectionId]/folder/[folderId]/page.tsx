'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus } from 'lucide-react'

interface Asset {
  id: string
  title: string
  file_url: string
  mime_type: string
  status?: string
}

const assetType = (mime: string, url: string) => {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'pdf'
  if (url.match(/\.pdf$/)) return 'pdf'
  if (url.match(/\.docx$/)) return 'docx'
  return 'document'
}

export default function SubfolderPage() {
  const params = useParams()
  const { folderId } = params as {
    folderId: string
  }

  const [folder, setFolder] = useState<any>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetsCount, setAssetsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClientComponentClient()
        // Buscar dados do folder
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('id, name, description')
          .eq('id', folderId)
          .single()
        if (folderError) throw folderError
        setFolder(folderData)

        // Buscar assets relacionados via folder_media
        const { data: folderMedia, error: fmError } = await supabase
          .from('folder_media')
          .select('media_id')
          .eq('folder_id', folderId)
        if (fmError) throw fmError
        const mediaIds = (folderMedia || []).map((fm: any) => fm.media_id)
        let assetsData: Asset[] = []
        if (mediaIds.length > 0) {
          const { data: assetsList, error: assetsError } = await supabase
            .from('media')
            .select('id, title, file_url, mime_type, status')
            .in('id', mediaIds)
          if (assetsError) throw assetsError
          assetsData = assetsList || []
        }
        setAssets(assetsData)
        setAssetsCount(assetsData.length)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (folderId) fetchData()
  }, [folderId])

  // Filtros
  const filteredAssets = assets.filter((asset) => {
    const type = assetType(asset.mime_type, asset.file_url)
    if (filter !== 'All' && filter.toLowerCase() !== type) return false
    if (
      search &&
      !(asset.title || '').toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const handleUpload = () => {
    // TODO: Implementar upload
    alert('Upload (em breve)')
  }
  const handleNewAsset = () => {
    // TODO: Implementar novo asset
    alert('Create new asset (em breve)')
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col px-[35px] py-10">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-medium text-black">
            {folder?.name || 'Folder'}
          </span>
          <div className="flex flex-row gap-6 mt-2">
            <div className="flex flex-col items-start">
              <span className="text-[16px] font-semibold text-[#222] leading-none">
                {assetsCount}
              </span>
              <span className="text-[10px] font-medium text-[#A5A5A5]">
                Assets
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Upload
          </button>
          <button
            onClick={handleNewAsset}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Create new asset
          </button>
        </div>
      </div>
      {/* Filtros e busca */}
      <div className="flex flex-row items-center gap-4 mb-6">
        <div className="flex gap-2">
          {['All', 'Images', 'Videos', 'PDF'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-full text-sm font-medium border ${
                filter === f
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              } transition-colors`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search assets and files"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-4 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      {/* Grid de assets */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-gray-400 font-semibold">
            Loading assets...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-red-500 font-semibold">{error}</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-gray-400 font-semibold">
            No assets found
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            const type = assetType(asset.mime_type, asset.file_url)
            return (
              <div
                key={asset.id}
                className="flex flex-col bg-white rounded-xl shadow-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Preview */}
                {type === 'image' ? (
                  <img
                    src={asset.file_url}
                    alt={asset.title}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                ) : type === 'video' ? (
                  <video
                    src={asset.file_url}
                    className="w-full h-40 object-cover rounded-md mb-2"
                    controls
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md mb-2 text-gray-400">
                    {type.toUpperCase()}
                  </div>
                )}
                {/* Info */}
                <span className="text-base font-semibold text-black mb-1 line-clamp-1">
                  {asset.title || 'Unnamed Asset'}
                </span>
                <span className="text-xs text-gray-500 mb-1">
                  {type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {asset.status || 'pending'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
