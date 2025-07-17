'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface CollectionCardProps {
  id: string
  title: string
  description: string
  backgroundImage?: string
  itemCount?: number
  onViewFolder: () => void
  onNewItem: () => void
  className?: string
}

export function CollectionCard({
  id,
  title,
  description,
  backgroundImage,
  itemCount,
  onViewFolder,
  onNewItem,
  className = '',
}: CollectionCardProps) {
  const bgImage =
    backgroundImage ||
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'

  return (
    <div
      className={`relative w-full min-h-[280px] rounded-xl overflow-hidden shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div />
        <button
          onClick={onNewItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/90 text-gray-900 rounded-md text-sm font-medium hover:bg-white transition-colors"
        >
          <Plus size={14} />
          New Item
        </button>
      </div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bgImage}')`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <div className="text-white space-y-3">
          <div>
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {itemCount !== undefined && (
            <p className="text-white/70 text-xs leading-relaxed">
              Currently in production: a CGI video for
              Footlocker/Footlocker/Footlocker featuring...
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={onViewFolder}
              className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              VIEW FOLDER
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionCard
