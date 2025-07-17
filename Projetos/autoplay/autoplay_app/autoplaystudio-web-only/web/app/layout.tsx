// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { PermissionProvider } from '@/components/role-based/permissions'

export const metadata: Metadata = {
  title: 'Autoplaystudio – Collaborative Design Platform',
  description: 'Professional design collaboration platform with AI-powered features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts carregadas via globals.css */}
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <PermissionProvider>{children}</PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
