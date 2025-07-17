'use client'

import { createContext } from 'react'

export const ViewAssetContext = createContext({
  handleOpenViewAsset: (asset: any) => {},
  handleCloseViewAsset: () => {},
  viewAssetOpen: false,
  selectedAsset: null as any,
})
