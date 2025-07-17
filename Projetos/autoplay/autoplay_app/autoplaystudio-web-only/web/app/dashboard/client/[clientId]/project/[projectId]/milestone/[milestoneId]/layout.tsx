'use client'

import React from 'react'
import TopNav from '@/components/layout/TopNav'

export default function MilestoneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Este layout sobrescreve completamente o layout do projeto
  // para evitar que o sidebar do projeto apareça
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TopNav />
      <main>{children}</main>
    </div>
  )
}
