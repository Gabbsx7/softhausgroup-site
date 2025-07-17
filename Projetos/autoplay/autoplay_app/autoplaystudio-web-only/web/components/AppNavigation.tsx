'use client'

import { useState, useEffect } from 'react'
import { createAppCommunication, AppMessageTypes } from '@autoplaystudio/core'
import { Button } from '@/ui/button'
import { 
  Palette, 
  FolderOpen, 
  CreditCard, 
  Settings,
  ExternalLink,
  Home
} from 'lucide-react'

interface AppNavigationProps {
  className?: string
}

export function AppNavigation({ className = '' }: AppNavigationProps) {
  const [currentApp, setCurrentApp] = useState<string>('web')
  const [appComm] = useState(() => createAppCommunication())

  useEffect(() => {
    // Listen for navigation messages
    appComm.onMessage(AppMessageTypes.NAVIGATE, (payload) => {
      console.log('Navigation requested:', payload)
      // Handle navigation to other apps
    })

    // Determine current app based on pathname
    const pathname = window.location.pathname
    if (pathname.startsWith('/design')) setCurrentApp('design-room')
    else if (pathname.startsWith('/assets')) setCurrentApp('asset-manager')
    else if (pathname.startsWith('/billing')) setCurrentApp('billing')
    else if (pathname.startsWith('/admin')) setCurrentApp('admin-panel')
    else setCurrentApp('web')

    return () => {
      appComm.destroy()
    }
  }, [appComm])

  const navigateToApp = (appPath: string, appName: string) => {
    // Notify other apps about navigation
    appComm.sendMessage(AppMessageTypes.NAVIGATE, { 
      path: appPath, 
      app: appName 
    })
    
    // Navigate to the app
    window.location.href = appPath
  }

  const apps = [
    {
      id: 'web',
      name: 'Dashboard',
      path: '/',
      icon: Home,
      description: 'Main dashboard and project management'
    },
    {
      id: 'design-room',
      name: 'Design Room',
      path: '/design',
      icon: Palette,
      description: 'Collaborative design editor'
    },
    {
      id: 'asset-manager',
      name: 'Asset Manager',
      path: '/assets',
      icon: FolderOpen,
      description: 'Asset management and organization'
    },
    {
      id: 'billing',
      name: 'Billing',
      path: '/billing',
      icon: CreditCard,
      description: 'Billing and subscription management'
    },
    {
      id: 'admin-panel',
      name: 'Admin Panel',
      path: '/admin',
      icon: Settings,
      description: 'Administrative interface'
    }
  ]

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-3">Applications</div>
      
      {apps.map((app) => {
        const Icon = app.icon
        const isActive = currentApp === app.id
        
        return (
          <Button
            key={app.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={`justify-start h-auto p-3 ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => navigateToApp(app.path, app.name)}
          >
            <div className="flex items-center space-x-3 w-full">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">{app.name}</div>
                <div className={`text-xs ${
                  isActive ? 'text-primary-foreground/80' : 'text-gray-500'
                }`}>
                  {app.description}
                </div>
              </div>
              {app.id !== 'web' && (
                <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60" />
              )}
            </div>
          </Button>
        )
      })}
    </div>
  )
}