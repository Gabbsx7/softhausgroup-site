'use client'

import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'

interface MemberCardProps {
  name: string
  role: string
  email: string
  status: 'active' | 'inactive'
  avatar?: string
  onViewDashboard?: () => void
  onMenuClick?: () => void
  onViewMember?: () => void
  onDeleteMember?: () => void
  onDirectChat?: () => void
}

export function MemberCard({
  name,
  role,
  email,
  status,
  avatar,
  onMenuClick,
  onViewMember,
  onDeleteMember,
  onDirectChat,
}: MemberCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  return (
    <div className="bg-white rounded-[12px] px-[10px] py-6 flex flex-col gap-4 min-w-[260px] max-w-[320px] shadow border border-[#E6E6E6] relative">
      {/* Menu 3 pontos */}
      <button
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        <MoreHorizontal className="w-5 h-5 text-[#B0B0B0]" />
      </button>
      {menuOpen && (
        <div className="absolute right-2 top-12 w-40 bg-white rounded-lg shadow-lg z-10 border border-gray-100 text-[13px]">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
            onClick={() => {
              setMenuOpen(false)
              onViewMember?.()
            }}
          >
            View Member
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500"
            onClick={() => {
              setMenuOpen(false)
              onDeleteMember?.()
            }}
          >
            Delete Member
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-blue-500"
            onClick={() => {
              setMenuOpen(false)
              onDirectChat?.()
            }}
          >
            Direct Chat
          </button>
        </div>
      )}
      {/* Avatar + Info */}
      <div className="flex items-center gap-4">
        <Avatar name={name} avatarUrl={avatar} size="xl" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
            <span className="text-lg font-semibold text-black leading-tight">
              {name}
            </span>
          </div>
          <span className="text-xs font-medium text-[#222] leading-tight">
            {role}
          </span>
        </div>
      </div>
      {/* Email */}
      <div className="text-xs text-[#7A7A7A] ml-[60px] -mt-2">{email}</div>
    </div>
  )
}
