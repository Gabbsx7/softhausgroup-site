'use client'

import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'

interface AssetsHeaderProps {
  assetsCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateAsset: () => void
  selectedFilter?: string
  onFilterChange?: (filter: string) => void
}

export function AssetsHeader({
  assetsCount,
  searchQuery,
  onSearchChange,
  onCreateAsset,
  selectedFilter = 'All',
  onFilterChange,
}: AssetsHeaderProps) {
  const filters = [
    { id: 'All', label: 'All' },
    { id: 'Images', label: 'Images' },
    { id: 'Videos', label: 'Videos' },
    { id: 'PDF', label: 'PDF' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-2.5">
          <div className="flex items-center justify-center gap-2.5 py-2.5">
            <h2 className="text-xl font-medium leading-[24.2px] text-black">
              Assets
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2.5 pb-7.5">
            <span className="text-[10px] font-medium leading-[12.1px] text-[#AAAAAA]">
              {assetsCount}
            </span>
          </div>
        </div>
        <button
          onClick={onCreateAsset}
          className="flex items-center justify-center gap-2.5 px-6 py-1.5 bg-white text-black text-xs rounded-[50px] hover:bg-gray-50 transition-colors"
        >
          + Create new asset
        </button>
      </div>

      {/* Search and Filters Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#989898]" />
          <input
            type="text"
            placeholder="Search assets and files"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-[12px] font-normal text-[#989898] placeholder-[#989898] bg-white border border-[#E5E5E5] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-2">+ Filter</span>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AssetsHeader
