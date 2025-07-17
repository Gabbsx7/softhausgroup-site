'use client'

import React from 'react'
import { File, Users, FolderOpen, Briefcase } from 'lucide-react'

interface EmptyStateProps {
  type: 'projects' | 'clients' | 'members' | 'templates' | 'assets'
  message?: string
}

const iconMap = {
  projects: Briefcase,
  clients: Users,
  members: Users,
  templates: File,
  assets: FolderOpen,
}

const defaultMessages = {
  projects: 'No projects found',
  clients: 'No clients found',
  members: 'No members found',
  templates: 'No templates found',
  assets: 'No assets found',
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const Icon = iconMap[type]
  const displayMessage = message || defaultMessages[type]

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <Icon className="w-8 h-8 text-gray-300 mb-2" />
      <span className="text-xs text-gray-400 text-center">
        {displayMessage}
      </span>
    </div>
  )
}
