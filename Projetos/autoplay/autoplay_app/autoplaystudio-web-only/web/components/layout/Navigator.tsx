'use client'

import React, { useState } from 'react'
import { Compass, ChevronDown, MoreHorizontal, Menu } from 'lucide-react'

interface NavigatorProps {
  className?: string
}

interface NavigationItem {
  id: string
  name: string
  type: 'projects' | 'collection' | 'assets'
  isExpanded?: boolean
  children?: any[]
}

// O componente Navigator foi removido pois não deve mais ser exibido como sidebar do projeto.
export default function Navigator() {
  return null
}
