'use client'

import React, { useState } from 'react'
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Image,
  Square,
  Circle,
  Type,
  Minus,
  ChevronDown,
  ChevronRight,
  FrameIcon,
  FolderOpen,
} from 'lucide-react'
import { CanvasObject } from '@/stores/canvasStore'
import { ProjectAsset } from '@/hooks/useProjectAssets'

interface LayersPanelProps {
  objects: CanvasObject[]
  selectedId: string | null
  assets: ProjectAsset[]
  onSelectObject: (id: string) => void
  onAssetDragStart?: (asset: ProjectAsset) => void
  onObjectDragStart?: (object: CanvasObject) => void
}

export default function LayersPanel({
  objects,
  selectedId,
  assets,
  onSelectObject,
  onAssetDragStart,
  onObjectDragStart,
}: LayersPanelProps) {
  const [collapsed, setCollapsed] = useState({
    assets: false,
    objects: false,
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-4 h-4 text-blue-500" />
      case 'circle':
        return <Circle className="w-4 h-4 text-green-500" />
      case 'text':
        return <Type className="w-4 h-4 text-purple-500" />
      case 'line':
        return <Minus className="w-4 h-4 text-gray-500" />
      case 'frame':
        return <FrameIcon className="w-4 h-4 text-orange-500" />
      case 'asset':
        return <Image className="w-4 h-4 text-pink-500" />
      default:
        return <Square className="w-4 h-4 text-gray-500" />
    }
  }

  const toggleCollapse = (section: 'assets' | 'objects') => {
    setCollapsed((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <Layers className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-800">Layers</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Assets Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleCollapse('assets')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {collapsed.assets ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-700">Project Assets</span>
              <span className="text-xs text-gray-500">({assets.length})</span>
            </div>
          </button>

          {!collapsed.assets && (
            <div className="px-3 pb-3 space-y-1">
              {assets.map((asset) => (
                <AssetItem
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedId === `asset-${asset.id}`}
                  onSelect={() => onSelectObject(`asset-${asset.id}`)}
                  onDragStart={onAssetDragStart}
                />
              ))}

              {assets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No assets found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Objects Section */}
        <div>
          <button
            onClick={() => toggleCollapse('objects')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {collapsed.objects ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-700">Canvas Objects</span>
              <span className="text-xs text-gray-500">({objects.length})</span>
            </div>
          </button>

          {!collapsed.objects && (
            <div className="px-3 pb-3 space-y-1">
              {objects.map((object) => (
                <ObjectItem
                  key={object.id}
                  object={object}
                  isSelected={object.id === selectedId}
                  onSelect={() => onSelectObject(object.id)}
                  onDragStart={onObjectDragStart}
                />
              ))}

              {objects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No objects on canvas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface AssetItemProps {
  asset: ProjectAsset
  isSelected: boolean
  onSelect: () => void
  onDragStart?: (asset: ProjectAsset) => void
}

function AssetItem({
  asset,
  isSelected,
  onSelect,
  onDragStart,
}: AssetItemProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'asset',
        asset: asset,
      })
    )
    e.dataTransfer.effectAllowed = 'copy'
    if (onDragStart) {
      onDragStart(asset)
    }
  }

  return (
    <div
      onClick={onSelect}
      draggable={true}
      onDragStart={handleDragStart}
      className={`
        flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200
        ${
          isSelected
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
            : 'hover:bg-gray-50'
        }
        hover:shadow-sm
      `}
    >
      {/* Thumbnail */}
      <div className="w-8 h-8 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
        <img
          src={asset.file_url}
          alt={asset.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {asset.title}
        </p>
        <p className="text-xs text-gray-500">
          {asset.width}x{asset.height}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(!isVisible)
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isVisible ? (
            <Eye className="w-3 h-3 text-gray-500" />
          ) : (
            <EyeOff className="w-3 h-3 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  )
}

interface ObjectItemProps {
  object: CanvasObject
  isSelected: boolean
  onSelect: () => void
  onDragStart?: (object: CanvasObject) => void
}

function ObjectItem({
  object,
  isSelected,
  onSelect,
  onDragStart,
}: ObjectItemProps) {
  const [isVisible, setIsVisible] = useState(object.visible)
  const [isLocked, setIsLocked] = useState(object.locked)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'object',
        object: object,
      })
    )
    e.dataTransfer.effectAllowed = 'move'
    if (onDragStart) {
      onDragStart(object)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-4 h-4 text-blue-500" />
      case 'circle':
        return <Circle className="w-4 h-4 text-green-500" />
      case 'text':
        return <Type className="w-4 h-4 text-purple-500" />
      case 'line':
        return <Minus className="w-4 h-4 text-gray-500" />
      case 'frame':
        return <FrameIcon className="w-4 h-4 text-orange-500" />
      case 'asset':
        return <Image className="w-4 h-4 text-pink-500" />
      default:
        return <Square className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div
      onClick={onSelect}
      draggable={true}
      onDragStart={handleDragStart}
      className={`
        flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200
        ${
          isSelected
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
            : 'hover:bg-gray-50'
        }
        hover:shadow-sm
      `}
    >
      {/* Type Icon */}
      <div className="flex-shrink-0">{getTypeIcon(object.type)}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {object.name}
        </p>
        <p className="text-xs text-gray-500">
          {Math.round(object.x)}, {Math.round(object.y)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(!isVisible)
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isVisible ? (
            <Eye className="w-3 h-3 text-gray-500" />
          ) : (
            <EyeOff className="w-3 h-3 text-gray-500" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsLocked(!isLocked)
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isLocked ? (
            <Lock className="w-3 h-3 text-gray-500" />
          ) : (
            <Unlock className="w-3 h-3 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  )
}
