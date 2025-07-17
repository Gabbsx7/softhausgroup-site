'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { Avatar } from './Avatar'
import ChatDrawerAdvanced from '../layout/ChatDrawerAdvanced'
import { useStudioDashboard } from '../../hooks/use-studio-dashboard'

interface TopBarProps {
  className?: string
}

export function TopBar({ className = '' }: TopBarProps) {
  const { data: studioData, loading } = useStudioDashboard()

  // Obter o nome do studio dos dados
  const studioName = studioData?.studio_name || 'Studio'

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-10 w-full bg-white border-b border-[#E9E9E9] flex items-center justify-between px-2.5 ${className}`}
    >
      {/* Left Section - Studio Name */}
      <div className="flex items-center gap-8 px-2">
        {loading ? (
          <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <span className="text-xs font-medium text-black">{studioName}</span>
        )}
        <div className="flex items-center gap-1.5">
          {/* Empty space for breadcrumbs if needed */}
        </div>
      </div>

      {/* Right Section - Icons and Avatar */}
      <div className="flex items-center">
        {/* Notification Bell */}
        <div className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded">
          <div className="relative">
            <Bell className="w-5 h-5 text-black" />
            {/* Notification dot */}
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Advanced Chat with Client Selector */}
        <div className="w-10 h-10 flex items-center justify-center">
          <ChatDrawerAdvanced />
        </div>

        {/* User Avatar */}
        <div className="flex items-center pl-2.5">
          <div className="w-8 h-8 bg-white rounded-full border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors">
            <img
              className="w-8 h-8 object-cover"
              src="https://placehold.co/32x32"
              alt="User"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
