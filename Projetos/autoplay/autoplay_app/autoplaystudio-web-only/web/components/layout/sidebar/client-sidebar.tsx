'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, Plus } from 'lucide-react'
import {
  CompassIcon,
  ExpandDownIcon,
  FolderIcon,
  CheckRingIcon,
  TimeProgressIcon,
  PendingIcon,
  ImageBoxIcon,
  AddSquareIcon,
  AddRingIcon,
  VideoFileIcon,
  FileDocIcon,
  MenuIcon,
} from '@/components/icons/sidebar-icons'
import {
  useClientSidebar,
  SidebarProject,
  SidebarCollection,
  SidebarAsset,
  SidebarFolder,
  SidebarMilestone,
  SidebarTask,
  SidebarNavigationItem,
} from '../../../hooks'

interface ClientSidebarProps {
  className?: string
}

export function ClientSidebar({ className }: ClientSidebarProps) {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string

  const {
    navigationItems,
    loading,
    error,
    toggleSection,
    toggleProject,
    toggleProjectDetails,
    toggleMilestone,
    toggleFolder,
  } = useClientSidebar(clientId)

  // Evitar problemas de hidratação - não renderizar até estar montado
  if (loading) {
    return (
      <div
        className={`w-[280px] bg-white border-r border-[#DAE2E8] h-full flex items-center justify-center ${
          className || ''
        }`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`w-[280px] bg-white border-r border-[#DAE2E8] h-full flex items-center justify-center ${
          className || ''
        }`}
      >
        <div className="text-red-500 text-sm text-center p-4">
          Error loading sidebar: {error}
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckRingIcon className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <TimeProgressIcon className="w-4 h-4 text-blue-500" />
      default:
        return <PendingIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageBoxIcon className="w-[14px] h-[14px] text-[#CC00FF]" />
      case 'video':
        return <VideoFileIcon className="w-[14px] h-[14px] text-[#7E869E]" />
      default:
        return <FileDocIcon className="w-[14px] h-[14px] text-[#7E869E]" />
    }
  }

  return (
    <div
      className={`w-[280px] bg-white border-r border-[#DAE2E8] h-full overflow-y-auto ${
        className || ''
      }`}
    >
      <div className="p-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CompassIcon className="w-6 h-6 text-[#222222]" />
            <span className="text-base font-medium text-[#222222]">Home</span>
          </div>
          <div className="flex items-center space-x-2">
            <ExpandDownIcon className="w-4 h-4 text-[#7E869E]" />
            <MenuIcon className="w-4 h-4 text-[#7E869E]" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((section: SidebarNavigationItem) => (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <div
                className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center space-x-2">
                  <ChevronDown
                    className={`w-4 h-4 text-[#7E869E] transition-transform ${
                      section.isExpanded
                        ? 'transform rotate-0'
                        : 'transform -rotate-90'
                    }`}
                  />
                  <span className="text-sm font-medium text-[#222222]">
                    {section.name}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-[#7E869E]" />
              </div>

              {/* Section Content */}
              {section.isExpanded && (
                <div className="ml-2 space-y-1">
                  {section.type === 'projects' && (
                    <div className="space-y-1">
                      {(section.data as SidebarProject[]).map(
                        (project: SidebarProject) => (
                          <div key={project.id} className="space-y-1">
                            {/* Project Container com background */}
                            <div className="bg-[#FDFBF3] rounded-lg p-1">
                              {/* Project Header */}
                              <div
                                className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded"
                                onClick={() => toggleProject(project.id)}
                              >
                                <div className="flex items-center space-x-2">
                                  <FolderIcon className="w-[18px] h-[18px] text-[#222222]" />
                                  <span className="text-sm font-medium text-[#222222]">
                                    {project.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(project.status)}
                                </div>
                              </div>

                              {/* Project Content */}
                              {project.isExpanded && (
                                <div className="space-y-2 px-2 pb-2">
                                  {/* 1. Project Details (primeiro) */}
                                  <div
                                    className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-50 rounded"
                                    onClick={() =>
                                      toggleProjectDetails(project.id)
                                    }
                                  >
                                    <div className="flex items-center space-x-2">
                                      <ChevronDown
                                        className={`w-3 h-3 text-[#7E869E] transition-transform ${
                                          project.showDetails
                                            ? 'transform rotate-0'
                                            : 'transform -rotate-90'
                                        }`}
                                      />
                                      <span className="text-xs text-[#7E869E]">
                                        Project Details
                                      </span>
                                    </div>
                                  </div>

                                  {/* Project Details Content */}
                                  {project.showDetails && (
                                    <div className="ml-4 space-y-3 p-3 bg-[#F8F9FA] rounded">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <AddRingIcon className="w-6 h-6 text-[#222222]" />
                                          <div className="flex -space-x-1">
                                            {project.team.map(
                                              (
                                                avatar: string,
                                                index: number
                                              ) => (
                                                <div
                                                  key={index}
                                                  className="w-[18px] h-[18px] bg-blue-500 rounded-full border border-[#DAE2E8]"
                                                ></div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                        <div className="bg-[#DBF4FF] rounded px-3 py-1.5 flex items-center space-x-1">
                                          <div className="w-2 h-2 bg-[#0EA5E9] rounded-full"></div>
                                          <span className="text-xs text-[#0EA5E9] font-medium">
                                            {project.status === 'in_progress'
                                              ? 'In Progress'
                                              : project.status === 'completed'
                                              ? 'Completed'
                                              : project.status === 'cancelled'
                                              ? 'Cancelled'
                                              : 'Draft'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="text-xs text-[#7E869E] leading-relaxed">
                                        {project.description}
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-xs text-[#7E869E]">
                                            Category
                                          </span>
                                          <span className="text-xs text-[#222222]">
                                            {project.category}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-xs text-[#7E869E]">
                                            Deadline
                                          </span>
                                          <span className="text-xs text-[#222222]">
                                            {project.deadline || 'Not set'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-xs text-[#7E869E]">
                                            Budget
                                          </span>
                                          <span className="text-xs text-[#222222]">
                                            {project.budget}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 2. Assets Section (segundo) */}
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 px-2 py-1">
                                      <span className="text-xs text-[#7E869E]">
                                        Assets ({project.assets.length})
                                      </span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                      {project.assets.map(
                                        (asset: SidebarAsset) => (
                                          <div
                                            key={asset.id}
                                            className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded"
                                          >
                                            {getAssetIcon(asset.type)}
                                            <span className="text-xs text-[#222222] truncate">
                                              {asset.name}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* 3. Milestones (terceiro) */}
                                  <div className="space-y-1">
                                    {project.milestones.map(
                                      (milestone: SidebarMilestone) => (
                                        <div
                                          key={milestone.id}
                                          className="bg-[#FFF9D7] rounded-lg p-1"
                                        >
                                          {/* Milestone Header */}
                                          <div
                                            className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded"
                                            onClick={() =>
                                              toggleMilestone(
                                                project.id,
                                                milestone.id
                                              )
                                            }
                                          >
                                            <div className="flex items-center space-x-2">
                                              {getStatusIcon(milestone.status)}
                                              <span className="text-sm font-medium text-[#222222]">
                                                {milestone.title}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Milestone Tasks */}
                                          {milestone.isExpanded &&
                                            milestone.tasks.length > 0 && (
                                              <div className="space-y-1 px-1 pb-1">
                                                {milestone.tasks.map(
                                                  (task: SidebarTask) => (
                                                    <div
                                                      key={task.id}
                                                      className="bg-[#FEFDF7] rounded-lg p-2"
                                                    >
                                                      <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                          {getStatusIcon(
                                                            task.status
                                                          )}
                                                          <span className="text-xs font-medium text-[#222222]">
                                                            {task.name}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      <div className="mt-2 bg-[#FFFBE5] rounded p-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                          <span className="text-[#A9A9A9]">
                                                            Due{' '}
                                                            {task.due_date ||
                                                              'next tuesday'}
                                                          </span>
                                                          <div className="flex items-center space-x-2">
                                                            <span className="text-[#222222] font-medium">
                                                              {task.assignee_name ||
                                                                'Jodi'}
                                                            </span>
                                                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {section.type === 'assets' && (
                    <div className="space-y-1">
                      {(section.data as SidebarAsset[]).map(
                        (asset: SidebarAsset) => (
                          <div
                            key={asset.id}
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            {getAssetIcon(asset.type)}
                            <span className="text-sm text-[#222222] truncate">
                              {asset.name}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {section.type === 'collection' && (
                    <div className="space-y-1">
                      {(section.data as SidebarCollection[]).map(
                        (collection: SidebarCollection) => (
                          <div key={collection.id} className="space-y-1">
                            {/* Collection Header */}
                            <div
                              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded"
                              onClick={() =>
                                toggleFolder('folders', collection.id)
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <ChevronDown
                                  className={`w-3 h-3 text-[#7E869E] transition-transform ${
                                    collection.isExpanded
                                      ? 'transform rotate-0'
                                      : 'transform -rotate-90'
                                  }`}
                                />
                                <FolderIcon className="w-4 h-4 text-[#7E869E]" />
                                <span className="text-sm text-[#222222] truncate">
                                  {collection.name}
                                </span>
                              </div>
                              <MenuIcon className="w-3 h-3 text-[#7E869E]" />
                            </div>

                            {/* Collection Content */}
                            {collection.isExpanded && (
                              <div className="ml-6 space-y-1">
                                {/* Collection Assets */}
                                {collection.assets.map(
                                  (asset: SidebarAsset) => (
                                    <div
                                      key={asset.id}
                                      className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded"
                                    >
                                      {getAssetIcon(asset.type)}
                                      <span className="text-xs text-[#222222] truncate">
                                        {asset.name}
                                      </span>
                                    </div>
                                  )
                                )}

                                {/* Subfolders */}
                                {collection.folders.map(
                                  (subfolder: SidebarFolder) => (
                                    <div
                                      key={subfolder.id}
                                      className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded"
                                    >
                                      <FolderIcon className="w-3 h-3 text-[#7E869E]" />
                                      <span className="text-xs text-[#222222] truncate">
                                        {subfolder.name}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
