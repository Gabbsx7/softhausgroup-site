'use client'

import React, { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { usePermissions } from '@/components/role-based/permissions'
import { Bell } from 'lucide-react'
import {
  UploadButton,
  NotificationsButton,
  TasksButton,
} from '@/components/common'
import InviteMemberModal from './InviteMemberModal'
import ChatDrawerAdvanced from './ChatDrawerAdvanced'

// Remover imports e variáveis não usados: Flag, ChevronDown, LogOut, User, Upload, Plus, AVATAR_COLORS, teamMembers, handleUpload, etc., se não utilizados.

export default function TopNav() {
  const { user, signOut } = useAuth()
  const { role, permissions } = usePermissions()
  const [logoDropdownOpen, setLogoDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  // Mock data - substituir por dados reais depois
  // const teamMembers = [
  //   {
  //     id: 1,
  //     name: 'John Doe',
  //     avatar: 'https://placehold.co/32x32',
  //   },
  //   {
  //     id: 2,
  //     name: 'Jane Smith',
  //     avatar: 'https://placehold.co/32x32',
  //   },
  //   {
  //     id: 3,
  //     name: 'Bob Johnson',
  //     avatar: 'https://placehold.co/32x32',
  //   },
  // ]

  // const handleUpload = (files: File[]) => {
  //   console.log('Upload files:', files)
  // }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 w-full bg-white border-b border-zinc-200 flex items-center px-6 z-50">
      {/* Logo/Workspace Name */}
      <div className="flex items-center gap-2 mr-8">
        <span className="text-lg font-semibold text-black tracking-tight">
          Molecule
        </span>
      </div>

      {/* Team Avatars + Add */}
      <div className="flex items-center gap-2 mr-8">
        {/* {teamMembers.slice(0, 3).map((member, idx) => (
          <div
            key={member.id}
            className={`w-8 h-8 bg-white rounded-full overflow-hidden outline outline-2 outline-offset-[-2px] ${getAvatarColor(
              member,
              idx
            )}${idx > 0 ? ' -ml-3' : ''}`}
          >
            <img
              className="w-8 h-8 object-cover"
              src={member.avatar}
              alt={member.name}
            />
          </div>
        ))} */}
        {/* <button
          onClick={() => setInviteModalOpen(true)}
          className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center ml-2 hover:bg-zinc-200 transition-colors border border-zinc-200"
          title="Invite member"
        >
          <Plus size={18} className="text-neutral-800" />
        </button> */}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <UploadButton />
        {permissions.canInviteUsers && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="w-20 h-8 bg-black rounded-3xl flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <span className="text-white text-xs font-normal">SHARE</span>
          </button>
        )}
        <TasksButton />
        <NotificationsButton />
        <ChatDrawerAdvanced />
        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-8 h-8 bg-white rounded-full outline outline-1 outline-offset-[-1px] outline-zinc-200 overflow-hidden hover:outline-gray-400 transition-colors"
          >
            <img
              className="w-8 h-8 object-cover"
              src="https://placehold.co/32x32"
              alt={user?.email || 'User'}
            />
          </button>
          {userDropdownOpen && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px] z-50">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                {/* <User size={14} /> */}
                View Profile
              </button>
              <hr className="my-1" />
              <button
                onClick={signOut}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                {/* <LogOut size={14} /> */}
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </header>
  )
}
