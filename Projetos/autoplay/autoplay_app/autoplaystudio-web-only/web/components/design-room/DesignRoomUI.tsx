'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import {
  Move,
  Hand,
  Square,
  Circle,
  Type,
  Minus,
  ZoomIn,
  ZoomOut,
  Layers,
  Settings,
  Users,
  Share2,
  Undo2,
  Redo2,
} from 'lucide-react'

import KonvaSSRFix from './Canvas/KonvaSSRFix'
import Toolbar from './Toolbar/Toolbar'
import LayersPanel from './Panels/LayersPanel'
import PropertiesPanel from './Panels/PropertiesPanel'
import Header from './Header/Header'
import { useCanvasStore } from '@/stores/canvasStore'
import { useToolStore } from '@/stores/toolStore'
import { useProjectAssets } from '@/hooks/useProjectAssets'

interface DesignRoomUIProps {
  projectId: string
  clientId: string
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
  mode: 'view' | 'edit'
  user: User
}

export default function DesignRoomUI({
  projectId,
  clientId,
  project,
  mode,
  user,
}: DesignRoomUIProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const {
    objects,
    selectedId,
    zoom,
    setZoom,
    setObjects,
    selectObject,
    updateObject,
    deleteObject,
  } = useCanvasStore()
  const { activeTool, setActiveTool } = useToolStore()
  const {
    assets,
    canvasObjects,
    loading: assetsLoading,
    refreshAssets,
  } = useProjectAssets(projectId)

  // Debug logs
  // useEffect(() => {
  //   console.log(
  //     'DesignRoomUI - Assets:',
  //     assets.length,
  //     'Canvas Objects:',
  //     canvasObjects.length
  //   )
  // }, [assets, canvasObjects])

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Load assets as canvas objects
  useEffect(() => {
    console.log(
      'Loading canvas objects:',
      canvasObjects.length,
      'Current objects:',
      objects.length
    )
    if (canvasObjects.length > 0 && objects.length === 0) {
      console.log('Setting canvas objects from assets')
      setObjects(canvasObjects)
    }
  }, [canvasObjects, objects.length, setObjects])

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 8))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1))
  }

  const handleFitToScreen = () => {
    setZoom(1)
  }

  if (isLoading || assetsLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Initializing Design Room
            </h3>
            <p className="text-gray-600">Loading project assets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      {/* Header - Fixo no topo da tela */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <Header
          project={project}
          user={user}
          mode={mode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          zoom={zoom}
          leftPanelOpen={leftPanelOpen}
          rightPanelOpen={rightPanelOpen}
          onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          onAssetUpload={refreshAssets}
        />
      </div>

      {/* Main Content - Canvas Area ocupando toda a tela com margem do header */}
      <div className="flex-1 relative mt-16">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-20">
          <Toolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            mode={mode}
          />
        </div>

        {/* Canvas - ocupa toda a área */}
        <KonvaSSRFix
          projectId={projectId}
          assets={assets}
          objects={objects}
          selectedId={selectedId}
          zoom={zoom}
          mode={mode}
        />

        {/* Status Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <div className="w-px h-4 bg-gray-300" />
            <span className="text-sm text-gray-600">
              {objects.length} objects
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
              <span className="text-sm text-gray-600">
                {mode === 'edit' ? 'Edit Mode' : 'View Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Left Panel - Layers (Fixed on left side) */}
      <div
        className={`
          fixed top-16 left-0 bottom-0 z-30
          transition-all duration-300 ease-in-out
          ${leftPanelOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'}
          bg-white shadow-lg border-r border-gray-200
        `}
      >
        <LayersPanel
          objects={objects}
          selectedId={selectedId}
          assets={assets}
          onSelectObject={(id) => {
            selectObject(id)
          }}
          onAssetDragStart={(asset) => {
            console.log('Asset drag started:', asset.title)
          }}
          onObjectDragStart={(object) => {
            console.log('Object drag started:', object.name)
          }}
        />
      </div>

      {/* Right Panel - Properties (Fixed on right side) */}
      <div
        className={`
          fixed top-16 right-0 bottom-0 z-30
          transition-all duration-300 ease-in-out
          ${rightPanelOpen ? 'w-80 translate-x-0' : 'w-80 translate-x-full'}
          bg-white shadow-lg border-l border-gray-200
        `}
      >
        <PropertiesPanel
          selectedId={selectedId}
          objects={objects}
          mode={mode}
          onUpdateObject={updateObject}
          onDeleteObject={deleteObject}
        />
      </div>
    </div>
  )
}
