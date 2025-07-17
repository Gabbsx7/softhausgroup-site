'use client'

import React from 'react'
import { Plus, Folder } from 'lucide-react'

interface FolderItem {
  id: string
  name: string
  itemCount?: number
}

interface FolderGridProps {
  title: string
  folders: FolderItem[]
  onNewFolder: () => void
  onFolderClick: (folderId: string) => void
  className?: string
}

export function FolderGrid({
  title,
  folders,
  onNewFolder,
  onFolderClick,
  className = '',
}: FolderGridProps) {
  return (
    <div className={`w-full bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button
          onClick={onNewFolder}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Plus size={16} />
          New Folder
        </button>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderClick(folder.id)}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="flex-shrink-0">
              <Folder
                size={24}
                className="text-gray-500 group-hover:text-gray-700"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {folder.name}
              </p>
              {folder.itemCount !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {folder.itemCount} items
                </p>
              )}
            </div>
          </button>
        ))}

        {/* Add New Folder Button */}
        <button
          onClick={onNewFolder}
          className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors text-gray-600"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">Add Folder</span>
        </button>
      </div>

      {/* Empty State */}
      {folders.length === 0 && (
        <div className="text-center py-12">
          <Folder size={48} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-gray-900 font-medium mb-2">No folders yet</h4>
          <p className="text-gray-500 text-sm mb-6">
            Create your first folder to organize your content
          </p>
          <button
            onClick={onNewFolder}
            className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create First Folder
          </button>
        </div>
      )}
    </div>
  )
}

export default FolderGrid
