'use client'

import React from 'react'
import {
  MousePointer,
  Hand,
  Square,
  Circle,
  Type,
  Minus,
  FrameIcon,
} from 'lucide-react'
import { ToolType } from '@/stores/toolStore'

interface ToolbarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  mode: 'view' | 'edit'
}

const tools = [
  { id: 'select', icon: MousePointer, label: 'Selecionar', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Mão', shortcut: 'H' },
  { id: 'frame', icon: FrameIcon, label: 'Frame', shortcut: 'F' },
  { id: 'rectangle', icon: Square, label: 'Retângulo', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Círculo', shortcut: 'O' },
  { id: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
  { id: 'line', icon: Minus, label: 'Linha', shortcut: 'L' },
] as const

export default function Toolbar({
  activeTool,
  onToolChange,
  mode,
}: ToolbarProps) {
  if (mode === 'view') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex flex-col space-y-1">
          <ToolButton
            tool="select"
            icon={MousePointer}
            label="Visualizar"
            shortcut="V"
            isActive={true}
            onClick={() => {}}
            disabled={true}
          />
          <ToolButton
            tool="hand"
            icon={Hand}
            label="Navegar"
            shortcut="H"
            isActive={false}
            onClick={() => {}}
            disabled={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex flex-col space-y-1">
        {tools.map(({ id, icon, label, shortcut }) => (
          <ToolButton
            key={id}
            tool={id}
            icon={icon}
            label={label}
            shortcut={shortcut}
            isActive={activeTool === id}
            onClick={() => onToolChange(id)}
          />
        ))}
      </div>
    </div>
  )
}

interface ToolButtonProps {
  tool: string
  icon: React.ComponentType<any>
  label: string
  shortcut: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

function ToolButton({
  tool,
  icon: Icon,
  label,
  shortcut,
  isActive,
  onClick,
  disabled = false,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group p-2 rounded-md transition-all duration-200
        ${
          isActive
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
            : 'hover:bg-gray-100 text-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      `}
      title={`${label} (${shortcut})`}
    >
      <Icon className="w-5 h-5" />

      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {label}
        <span className="ml-1 text-gray-300">({shortcut})</span>
      </div>

      {/* Shortcut indicator */}
      {!disabled && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {shortcut}
        </div>
      )}
    </button>
  )
}
