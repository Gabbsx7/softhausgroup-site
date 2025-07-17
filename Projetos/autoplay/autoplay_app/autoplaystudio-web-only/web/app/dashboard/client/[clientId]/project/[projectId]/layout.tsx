// apps/web/app/dashboard/client/[clientId]/project/[projectId]/layout.tsx
'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import ViewAsset from '@/components/project/ViewAsset'
import { ViewAssetContext } from '@/contexts/ViewAssetContext'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDesignRoom = pathname?.includes('/design-room-ui')

  const [viewAssetOpen, setViewAssetOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)

  const handleOpenViewAsset = (asset: any) => {
    setSelectedAsset(asset)
    setViewAssetOpen(true)
  }

  const handleCloseViewAsset = () => {
    setViewAssetOpen(false)
    setSelectedAsset(null)
  }

  // Se for design room, renderizar sem layout
  if (isDesignRoom) {
    return (
      <ViewAssetContext.Provider
        value={{
          handleOpenViewAsset,
          handleCloseViewAsset,
          viewAssetOpen,
          selectedAsset,
        }}
      >
        {children}
        <ViewAsset
          open={viewAssetOpen}
          onClose={handleCloseViewAsset}
          asset={selectedAsset || { url: '' }}
        />
      </ViewAssetContext.Provider>
    )
  }

  return (
    <ViewAssetContext.Provider
      value={{
        handleOpenViewAsset,
        handleCloseViewAsset,
        viewAssetOpen,
        selectedAsset,
      }}
    >
      <div className="min-h-screen bg-[#FAFAFA]">
        <TopNav />
        <main className="pt-4">{children}</main>
        <ViewAsset
          open={viewAssetOpen}
          onClose={handleCloseViewAsset}
          asset={selectedAsset || { url: '' }}
        />
      </div>
    </ViewAssetContext.Provider>
  )
}
