'use client'

import React from 'react'
import { MoreHorizontal, Plus, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'

interface ClientCardProps {
  client_id: string
  name: string
  description?: string
  isActive: boolean
}

export function ClientCard({
  client_id,
  name,
  description,
  isActive,
}: ClientCardProps) {
  const handleViewDashboard = () => {
    window.location.href = `/dashboard/client/${client_id}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></div>
              <h4 className="text-base font-medium text-black">{name}</h4>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 line-clamp-3">{description}</p>
      </div>

      {/* Team and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 text-gray-600" />
          </div>
          <div className="flex -space-x-1">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="sm" />
            <Avatar name="Bob Johnson" size="sm" />
          </div>
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded text-xs font-bold"
          onClick={handleViewDashboard}
        >
          VIEW DASHBOARD
        </button>
      </div>
    </div>
  )
}
