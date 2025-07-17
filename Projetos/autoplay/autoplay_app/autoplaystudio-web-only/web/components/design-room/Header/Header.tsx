'use client'

import React, { useState } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Users,
  Share2,
  Undo2,
  Redo2,
  Layers,
  Settings,
  ArrowLeft,
  Play,
  Upload,
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import NewAssetModal from '../../studioDashboard/NewAssetModal'

interface HeaderProps {
  project: {
    id: string
    name: string
    description: string | null
    client_id: string
    clients: {
      id: string
      name: string
    }
  }
  user: User
  mode: 'view' | 'edit'
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToScreen: () => void
  zoom: number
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
  onAssetUpload?: () => void
}

export default function Header({
  project,
  user,
  mode,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  zoom,
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
  onAssetUpload,
}: HeaderProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const handleAssetUploadSuccess = () => {
    setUploadModalOpen(false)
    if (onAssetUpload) {
      onAssetUpload()
    }
  }
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Back Button */}
        <Link
          href={`/dashboard/client/${project.client_id}/project/${project.id}`}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Project Info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {project.name}
            </h1>
            <p className="text-xs text-gray-500">{project.clients.name}</p>
          </div>
        </div>

        {/* Mode Badge */}
        <div
          className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${
            mode === 'edit'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }
        `}
        >
          {mode === 'edit' ? 'Edit Mode' : 'View Mode'}
        </div>

        {/* Upload Button */}
        {mode === 'edit' && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium"
            title="Upload Asset"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        )}
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onFitToScreen}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* History Controls */}
        {mode === 'edit' && (
          <div className="flex items-center space-x-1">
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Panel Toggle Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleLeftPanel}
            className={`
              p-2 rounded-lg transition-colors
              ${
                leftPanelOpen
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            title="Toggle Layers Panel"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleRightPanel}
            className={`
              p-2 rounded-lg transition-colors
              ${
                rightPanelOpen
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }
            `}
            title="Toggle Properties Panel"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Collaboration */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-4 h-4" />
          </button>

          <button className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <NewAssetModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleAssetUploadSuccess}
      />
    </header>
  )
}
