// apps/web/app/dashboard/client/layout.tsx - Responsivo
'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ClientSidebar } from '@/components/layout/sidebar/client-sidebar'
import TopNav from '@/components/layout/TopNav'
import { Menu, X } from 'lucide-react'

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on design room
  const isDesignRoom = pathname?.includes('/design-room-ui')

  // Só mostra o banner na página principal do client (não em rotas filhas)

  // Check if we're on a project page
  const isProjectPage = pathname.includes('/project/')

  // Se for design room, renderizar apenas o children sem layout
  if (isDesignRoom) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
      {/* TopNav */}
      <TopNav />

      <div className="flex flex-1 min-h-0 pt-10 gap-2.5 px-2.5">
        {/* Sidebar */}
        {!isProjectPage && (
          <aside
            className={`
              hidden lg:flex flex-col w-[265px] bg-transparent min-h-0 h-[calc(100vh-44px)] sticky top-11 z-20
            `}
          >
            <ClientSidebar />
          </aside>
        )}

        {/* Sidebar Mobile */}
        {!isProjectPage && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {!isProjectPage && (
          <aside
            className={`
              fixed top-11 left-0 z-50 w-[260px] h-[calc(100vh-44px)] bg-white border-r border-zinc-200 transition-transform duration-300 lg:hidden
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          >
            <ClientSidebar />
          </aside>
        )}
        {!isProjectPage && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center border border-gray-200"
            aria-label="Abrir menu"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        )}

        {/* Main Content */}
        <main
          className={`
          flex-1 min-h-0 overflow-y-auto w-full
          h-[calc(100vh-44px)]
        `}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
