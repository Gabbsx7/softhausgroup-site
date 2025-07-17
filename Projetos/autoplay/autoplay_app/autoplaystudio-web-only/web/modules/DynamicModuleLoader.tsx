'use client'

import { Suspense, lazy, useEffect, useState, useCallback } from 'react'
import { moduleRegistry, ModuleDefinition } from '@autoplaystudio/core'
import { moduleEventBus, ModuleEventTypes, EventHelpers } from '@autoplaystudio/core'

interface DynamicModuleLoaderProps {
  moduleId: string
  fallback?: React.ReactNode
  onLoad?: (module: any) => void
  onError?: (error: Error) => void
  onUnload?: () => void
  autoPreload?: boolean
  preloadDelay?: number
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface ModuleErrorBoundaryProps {
  error: Error
  retry: () => void
}

const DefaultErrorBoundary: React.FC<ModuleErrorBoundaryProps> = ({ error, retry }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <h3 className="text-sm font-medium text-red-800">Module Error</h3>
    </div>
    <p className="text-sm text-red-600 mb-3">{error.message}</p>
    <button
      onClick={retry}
      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
    >
      Retry
    </button>
  </div>
)

export function DynamicModuleLoader({
  moduleId,
  fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600">Loading module...</p>
      </div>
    </div>
  ),
  onLoad,
  onError,
  onUnload,
  autoPreload = true,
  preloadDelay = 1000,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary
}: DynamicModuleLoaderProps) {
  const [Module, setModule] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [moduleDefinition, setModuleDefinition] = useState<ModuleDefinition | null>(null)

  const loadModule = useCallback(async () => {
    if (Module || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Get module definition
      const def = moduleRegistry.getModule(moduleId)
      if (!def) {
        throw new Error(`Module not found: ${moduleId}`)
      }
      setModuleDefinition(def)

      // Check if already loaded
      if (moduleRegistry.isModuleLoaded(moduleId)) {
        const cachedModule = await moduleRegistry.loadModule(moduleId)
        setModule(() => cachedModule.default || cachedModule)
        onLoad?.(cachedModule)
        return
      }

      // Dynamic import with retry logic
      let retries = 0
      const maxRetries = 3
      
      while (retries < maxRetries) {
        try {
          const startTime = performance.now()
          const module = await import(`@autoplaystudio/${moduleId}`)
          const loadTime = performance.now() - startTime

          setModule(() => module.default || module)
          onLoad?.(module)

          // Publish module loaded event
          EventHelpers.publishModuleLoaded(moduleId, loadTime)

          console.log(`Module loaded successfully: ${moduleId} (${loadTime.toFixed(2)}ms)`)
          break
        } catch (importError) {
          retries++
          if (retries >= maxRetries) {
            throw importError
          }
          console.warn(`Module load attempt ${retries} failed for ${moduleId}, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
        }
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)

      // Publish module error event
      EventHelpers.publishModuleError(moduleId, error)

      console.error(`Failed to load module: ${moduleId}`, error)
    } finally {
      setIsLoading(false)
    }
  }, [moduleId, Module, isLoading, onLoad, onError])

  const retry = useCallback(() => {
    setError(null)
    setModule(null)
    loadModule()
  }, [loadModule])

  // Auto-preload module
  useEffect(() => {
    if (!autoPreload) return

    const timer = setTimeout(() => {
      // Only preload if not already loaded
      if (!moduleRegistry.isModuleLoaded(moduleId)) {
        moduleRegistry.loadModule(moduleId).catch(() => {
          // Silently fail preloading
        })
      }
    }, preloadDelay)

    return () => clearTimeout(timer)
  }, [moduleId, autoPreload, preloadDelay])

  // Load module when component mounts
  useEffect(() => {
    loadModule()
  }, [loadModule])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onUnload?.()
    }
  }, [onUnload])

  // Error state
  if (error) {
    return <ErrorBoundary error={error} retry={retry} />
  }

  // Loading state
  if (!Module || isLoading) {
    return <>{fallback}</> 
  }

  // Module info for debugging
  const moduleInfo = moduleDefinition ? (
    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black/10 px-2 py-1 rounded">
      {moduleDefinition.name} v{moduleDefinition.version}
    </div>
  ) : null

  // Render module
  return (
    <div className="relative">
      {moduleInfo}
      <Suspense fallback={fallback}>
        <Module />
      </Suspense>
    </div>
  )
}

// Hook for module management
export function useModuleLoader() {
  const [loadedModules, setLoadedModules] = useState<string[]>([])
  const [loadingModules, setLoadingModules] = useState<string[]>([])

  const loadModule = useCallback(async (moduleId: string) => {
    if (loadedModules.includes(moduleId)) return

    setLoadingModules(prev => [...prev, moduleId])
    
    try {
      await moduleRegistry.loadModule(moduleId)
      setLoadedModules(prev => [...prev, moduleId])
    } catch (error) {
      console.error(`Failed to load module: ${moduleId}`, error)
    } finally {
      setLoadingModules(prev => prev.filter(id => id !== moduleId))
    }
  }, [loadedModules])

  const unloadModule = useCallback((moduleId: string) => {
    // Note: In a real implementation, you might want to actually unload the module
    setLoadedModules(prev => prev.filter(id => id !== moduleId))
  }, [])

  const preloadModules = useCallback((moduleIds: string[]) => {
    moduleIds.forEach(moduleId => {
      if (!loadedModules.includes(moduleId) && !loadingModules.includes(moduleId)) {
        loadModule(moduleId)
      }
    })
  }, [loadedModules, loadingModules, loadModule])

  return {
    loadedModules,
    loadingModules,
    loadModule,
    unloadModule,
    preloadModules,
    isModuleLoaded: (moduleId: string) => loadedModules.includes(moduleId),
    isModuleLoading: (moduleId: string) => loadingModules.includes(moduleId)
  }
}

// Module preloader component
interface ModulePreloaderProps {
  moduleIds: string[]
  onReady?: () => void
  children: React.ReactNode
}

export function ModulePreloader({ moduleIds, onReady, children }: ModulePreloaderProps) {
  const { loadedModules, loadingModules, preloadModules } = useModuleLoader()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    preloadModules(moduleIds)
  }, [moduleIds, preloadModules])

  useEffect(() => {
    const allLoaded = moduleIds.every(id => loadedModules.includes(id))
    const noneLoading = !moduleIds.some(id => loadingModules.includes(id))
    
    if (allLoaded && noneLoading && !isReady) {
      setIsReady(true)
      onReady?.()
    }
  }, [moduleIds, loadedModules, loadingModules, isReady, onReady])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {moduleIds.map(id => (
              <div
                key={id}
                className={`w-3 h-3 rounded-full ${
                  loadedModules.includes(id) 
                    ? 'bg-green-500' 
                    : loadingModules.includes(id)
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Loading modules... ({loadedModules.length}/{moduleIds.length})
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}