'use client'

import React, { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  count: number
  children?: ReactNode
}

export function SectionHeader({ title, count, children }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div className="flex items-end gap-3">
        <h3 className="text-xl font-medium text-black">{title}</h3>
        <div className="bg-gray-100 rounded px-2 py-1 mb-1">
          <span className="text-xs font-medium text-gray-600">{count}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
