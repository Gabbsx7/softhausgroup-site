'use client'

import React from 'react'
import { CollectionCard } from './CollectionCard'
import { FolderGrid } from './FolderGrid'

interface Collection {
  id: string
  title: string
  description: string
  type: 'visual' | 'folder'
  backgroundImage?: string
  itemCount?: number
  folders?: Array<{
    id: string
    name: string
    itemCount?: number
  }>
}

interface CollectionsGridProps {
  collections: Collection[]
  onNewCollection: () => void
  onViewFolder: (collectionId: string) => void
  onNewItem: (collectionId: string) => void
  onNewFolder: (collectionId: string) => void
  onFolderClick: (collectionId: string, folderId: string) => void
  className?: string
}

export function CollectionsGrid({
  collections,
  onNewCollection,
  onViewFolder,
  onNewItem,
  onNewFolder,
  onFolderClick,
  className = '',
}: CollectionsGridProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {collections.map((collection) => {
        if (collection.type === 'visual') {
          return (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              title={collection.title}
              description={collection.description}
              backgroundImage={collection.backgroundImage}
              itemCount={collection.itemCount}
              onViewFolder={() => onViewFolder(collection.id)}
              onNewItem={() => onNewItem(collection.id)}
            />
          )
        } else {
          return (
            <FolderGrid
              key={collection.id}
              title={collection.title}
              folders={collection.folders || []}
              onNewFolder={() => onNewFolder(collection.id)}
              onFolderClick={(folderId) =>
                onFolderClick(collection.id, folderId)
              }
            />
          )
        }
      })}
    </div>
  )
}

export default CollectionsGrid
