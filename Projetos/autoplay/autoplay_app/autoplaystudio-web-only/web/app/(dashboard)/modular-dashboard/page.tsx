'use client'

import { useState, useEffect } from 'react'
import { DynamicModuleLoader, ModulePreloader, useModuleLoader } from '@/modules/DynamicModuleLoader'
import { moduleRegistry, registerDefaultModules } from '@autoplaystudio/core'
import { moduleEventBus, ModuleEventTypes } from '@autoplaystudio/core'

export default function ModularDashboard() {
  const [activeModule, setActiveModule] = useState<string>('')
  const [moduleEvents, setModuleEvents] = useState<any[]>([])
  const { loadedModules, loadingModules, loadModule } = useModuleLoader()

  // Register default modules on mount
  useEffect(() => {
    registerDefaultModules()
  }, [])

  // Listen to module events
  useEffect(() => {
    const handleModuleEvent = (event: any) => {
      setModuleEvents(prev => [...prev.slice(-9), event])
    }

    const listenerId = moduleEventBus.subscribe(ModuleEventTypes.MODULE_LOADED, handleModuleEvent)
    const errorListenerId = moduleEventBus.subscribe(ModuleEventTypes.MODULE_ERROR, handleModuleEvent)

    return () => {
      moduleEventBus.unsubscribe(ModuleEventTypes.MODULE_LOADED, listenerId)
      moduleEventBus.unsubscribe(ModuleEventTypes.MODULE_ERROR, errorListenerId)
    }
  }, [])

  const availableModules = moduleRegistry.getAllModules()

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId)
    loadModule(moduleId)
  }

  const handleModuleLoad = (module: any) => {
    console.log('Module loaded:', module)
  }

  const handleModuleError = (error: Error) => {
    console.error('Module error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modular Dashboard</h1>
            <p className="text-gray-600">Dynamic module loading system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Loaded: {loadedModules.length} | Loading: {loadingModules.length}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Module Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Modules</h2>
            <div className="space-y-2">
              {availableModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeModule === module.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{module.name}</h3>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {loadedModules.includes(module.id) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {loadingModules.includes(module.id) && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      )}
                      <span className="text-xs text-gray-400">v{module.version}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {module.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module Stats */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Module Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Modules:</span>
                <span className="font-medium">{availableModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loaded:</span>
                <span className="font-medium text-green-600">{loadedModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loading:</span>
                <span className="font-medium text-yellow-600">{loadingModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bundle Size:</span>
                <span className="font-medium">
                  {(availableModules.reduce((acc, m) => acc + m.bundleSize, 0) / 1024).toFixed(1)} MB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Module Display Area */}
          <div className="flex-1 p-6">
            {activeModule ? (
              <div className="h-full">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {moduleRegistry.getModule(activeModule)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {moduleRegistry.getModule(activeModule)?.description}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden">
                  <DynamicModuleLoader
                    moduleId={activeModule}
                    onLoad={handleModuleLoad}
                    onError={handleModuleError}
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600">Loading {moduleRegistry.getModule(activeModule)?.name}...</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Module</h3>
                  <p className="text-gray-600">Choose a module from the sidebar to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Log */}
          <div className="h-64 bg-white border-t border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Module Events</h3>
            <div className="h-48 overflow-y-auto space-y-2">
              {moduleEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No events yet</p>
              ) : (
                moduleEvents.map((event, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{event.type}</span>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.payload && (
                      <pre className="text-gray-600 mt-1">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}