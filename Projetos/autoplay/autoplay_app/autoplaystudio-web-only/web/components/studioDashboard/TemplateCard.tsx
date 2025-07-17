'use client'

import React from 'react'
import { MapPin } from 'lucide-react'

interface TemplateCardProps {
  name: string
  description?: string
  category?: string
  previewImage?: string
  foldersCount?: number
  assetsCount?: number
}

export function TemplateCard({
  name,
  description,
  category,
  previewImage,
  foldersCount = 2,
  assetsCount = 4,
}: TemplateCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Navigation Header */}
      <div className="flex items-stretch h-11">
        {/* Left: Icon + Title */}
        <div className="flex items-center flex-1">
          <div className="flex items-center justify-center h-full px-2.5">
            <MapPin className="w-5 h-5 text-black" />
          </div>
          <div className="flex items-center justify-center flex-1 h-full px-2.5">
            <span className="text-xs font-medium text-black text-center">
              {name}
            </span>
          </div>
        </div>

        {/* Right: Menu de três pontos */}
        <div className="flex items-center justify-center w-8 h-full">
          <div className="flex flex-col gap-0.5">
            <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="px-2.5 pb-2">
        <div className="px-1.5 py-1">
          {/* Status with folders and assets count */}
          <div className="flex items-center justify-between gap-2.5 opacity-50">
            <span className="text-xs font-medium text-gray-500 text-right flex-1">
              {foldersCount} Folders
            </span>
            <span className="text-xs font-medium text-gray-400">
              {assetsCount} Assets
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
