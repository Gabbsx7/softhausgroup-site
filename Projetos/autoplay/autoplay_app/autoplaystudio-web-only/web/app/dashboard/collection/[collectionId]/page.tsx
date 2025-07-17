'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus } from 'lucide-react'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.collectionId as string

  const [collection, setCollection] = useState<any>(null)
  const [folders, setFolders] = useState<any[]>([])
  const [assetsCount, setAssetsCount] = useState(0)
  const [foldersCount, setFoldersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClientComponentClient()
        // Buscar a collection na tabela 'collections'
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('id, name')
          .eq('id', collectionId)
          .single()
        if (collectionError) throw collectionError
        setCollection(collectionData)
        // Buscar todos os folder_id da collection na folder_media
        const { data: folderMedia, error: folderMediaError } = await supabase
          .from('folder_media')
          .select('folder_id')
          .eq('collection_id', collectionId)
        if (folderMediaError) throw folderMediaError
        const folderIds = (folderMedia || []).map((fm) => fm.folder_id)
        if (!folderIds.length) {
          setFolders([])
          setFoldersCount(0)
          setAssetsCount(0)
          setLoading(false)
          return
        }
        // Buscar os folders raiz (parent_id IS NULL) desses IDs
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('id, name')
          .in('id', folderIds)
          .is('parent_id', null)
        if (foldersError) throw foldersError
        setFolders(foldersData || [])
        setFoldersCount((foldersData || []).length)
        // Contar assets relacionados a essa collection
        const { count: assetsCount } = await supabase
          .from('folder_media')
          .select('media_id', { count: 'exact', head: true })
          .eq('collection_id', collectionId)
        setAssetsCount(assetsCount || 0)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [collectionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-gray-400 font-semibold">
          Loading collection...
        </span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-red-500 font-semibold">{error}</span>
      </div>
    )
  }
  if (!collection) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-gray-400 font-semibold">
          Collection not found
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col px-[35px] py-10">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-medium text-black">
            {collection?.name || 'Collection'}
          </span>
          <div className="flex flex-row gap-6 mt-2">
            <div className="flex flex-col items-start">
              <span className="text-[16px] font-semibold text-[#222] leading-none">
                {foldersCount}
              </span>
              <span className="text-[10px] font-medium text-[#A5A5A5]">
                Folders
              </span>
            </div>
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
        <button
          onClick={() => alert('New Folder (em breve)')}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          New Folder
        </button>
      </div>
      {/* Folders Grid */}
      <div className="mb-10">
        <div className="flex flex-row items-center justify-between mb-4">
          <span className="text-lg font-semibold text-black">Folders</span>
          <span className="text-xs text-gray-400">{foldersCount} folders</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de adicionar novo folder */}
          <div
            className="flex flex-col items-center justify-center bg-[#F7F7F7] border border-gray-200 rounded-lg h-32 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => alert('New Folder (em breve)')}
          >
            <Plus size={32} className="text-gray-400 mb-2" />
            <span className="text-xs text-gray-500">Add Folder</span>
          </div>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 flex flex-col justify-between h-32"
              onClick={() =>
                router.push(
                  `/dashboard/collection/${collectionId}/folder/${folder.id}`
                )
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 7a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.41.59l1.83 1.83A2 2 0 0 0 12.83 8H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                      stroke="#222"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <span className="font-semibold text-base text-black">
                  {folder.name}
                </span>
              </div>
              <div className="flex flex-row gap-4 mt-auto">
                <span className="text-xs text-gray-400">Assets: --</span>
                <span className="text-xs text-gray-400">Subfolders: --</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Seção de Assets (placeholder visual, pode ser integrado depois) */}
      <div className="mb-8">
        <div className="flex flex-row items-center justify-between mb-4">
          <span className="text-lg font-semibold text-black">Assets</span>
          <div className="flex flex-row gap-2">
            <button className="px-3 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
              All
            </button>
            <button className="px-3 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
              Images
            </button>
            <button className="px-3 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
              Videos
            </button>
            <button className="px-3 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700">
              PDF
            </button>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            onClick={() => alert('Create new asset (em breve)')}
          >
            <Plus size={16} />
            Create new asset
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder de asset card */}
          <div className="bg-white rounded-lg shadow p-4 h-40 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">📦</span>
            <span className="text-xs">No assets yet</span>
          </div>
        </div>
      </div>
    </div>
  )
}
