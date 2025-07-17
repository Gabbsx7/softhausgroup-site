'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CollectionCard } from '@/components/dashboard/CollectionCard'
import SectionHeader from '@/components/layout/SectionHeader'
import { Plus } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description?: string
  backgroundImage?: string
  foldersCount?: number
  assetsCount?: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCollections() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClientComponentClient()
        // Busca todas as collections (folders matrizes)
        const { data, error } = await supabase
          .from('folders')
          .select('id, name, description')
          .is('parent_id', null)
          .order('created_at', { ascending: false })
        if (error) throw error
        // Para cada collection, buscar contagem de folders e assets
        const collectionsWithCounts = await Promise.all(
          (data || []).map(async (col: any) => {
            // Busca folders filhos
            const { count: foldersCount } = await supabase
              .from('folders')
              .select('id', { count: 'exact', head: true })
              .eq('parent_id', col.id)
            // Busca assets relacionados via folder_media
            const { count: assetsCount } = await supabase
              .from('folder_media')
              .select('media_id', { count: 'exact', head: true })
              .eq('folder_id', col.id)
            return {
              id: col.id,
              name: col.name,
              description: col.description,
              foldersCount: foldersCount || 0,
              assetsCount: assetsCount || 0,
            }
          })
        )
        setCollections(collectionsWithCounts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const handleNewCollection = () => {
    // TODO: Implementar modal de criação de collection
    alert('New Collection (em breve)')
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col px-[35px] py-10">
      <div className="flex flex-row items-center justify-between mb-8">
        <SectionHeader title="Collections" count={collections.length} />
        <button
          onClick={handleNewCollection}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          New Collection
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-gray-400 font-semibold">
            Loading collections...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-red-500 font-semibold">{error}</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-lg text-gray-400 font-semibold">
            No collections found
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              title={col.name}
              description={col.description || ''}
              itemCount={col.foldersCount}
              onViewFolder={() => {
                // Redirecionar para a página da collection
                window.location.href = `/dashboard/collection/${col.id}`
              }}
              onNewItem={() => {
                // TODO: Implementar criação de novo item/folder
                alert('New Folder (em breve)')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
