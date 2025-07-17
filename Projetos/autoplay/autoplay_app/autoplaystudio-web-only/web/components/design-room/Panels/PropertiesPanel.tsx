'use client'

import React, { useState } from 'react'
import {
  Settings,
  Palette,
  Move,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  FrameIcon,
  Grid,
  ArrowRight,
  ArrowDown,
} from 'lucide-react'
import { CanvasObject } from '@/stores/canvasStore'

interface PropertiesPanelProps {
  selectedId: string | null
  objects: CanvasObject[]
  mode: 'view' | 'edit'
  onUpdateObject?: (id: string, updates: Partial<CanvasObject>) => void
  onDeleteObject?: (id: string) => void
}

export default function PropertiesPanel({
  selectedId,
  objects,
  mode,
  onUpdateObject,
  onDeleteObject,
}: PropertiesPanelProps) {
  const selectedObject = objects.find((obj) => obj.id === selectedId)

  if (mode === 'view') {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">View mode</p>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedObject) {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an object</p>
            <p className="text-xs text-gray-400">to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <ObjectProperties
          object={selectedObject}
          onUpdateObject={onUpdateObject}
          onDeleteObject={onDeleteObject}
        />
      </div>
    </div>
  )
}

interface ObjectPropertiesProps {
  object: CanvasObject
  onUpdateObject?: (id: string, updates: Partial<CanvasObject>) => void
  onDeleteObject?: (id: string) => void
}

function ObjectProperties({
  object,
  onUpdateObject,
  onDeleteObject,
}: ObjectPropertiesProps) {
  const [expanded, setExpanded] = useState({
    general: true,
    position: true,
    appearance: true,
    typography: object.type === 'text',
    frame: object.type === 'frame',
    actions: true,
  })

  const toggle = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="p-4 space-y-4">
      {/* General Section */}
      <PropertySection
        title="General"
        icon={<Settings className="w-4 h-4" />}
        expanded={expanded.general}
        onToggle={() => toggle('general')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              defaultValue={object.name}
              onChange={(e) =>
                onUpdateObject?.(object.id, { name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visible"
                defaultChecked={object.visible}
                onChange={(e) =>
                  onUpdateObject?.(object.id, { visible: e.target.checked })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="visible" className="text-sm text-gray-700">
                Visible
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="locked"
                defaultChecked={object.locked}
                onChange={(e) =>
                  onUpdateObject?.(object.id, { locked: e.target.checked })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="locked" className="text-sm text-gray-700">
                Locked
              </label>
            </div>
          </div>
        </div>
      </PropertySection>

      {/* Position Section */}
      <PropertySection
        title="Position & Size"
        icon={<Move className="w-4 h-4" />}
        expanded={expanded.position}
        onToggle={() => toggle('position')}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X
            </label>
            <input
              type="number"
              defaultValue={Math.round(object.x)}
              onChange={(e) =>
                onUpdateObject?.(object.id, {
                  x: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y
            </label>
            <input
              type="number"
              defaultValue={Math.round(object.y)}
              onChange={(e) =>
                onUpdateObject?.(object.id, {
                  y: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {object.width && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <input
                type="number"
                defaultValue={Math.round(object.width)}
                onChange={(e) =>
                  onUpdateObject?.(object.id, {
                    width: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {object.height && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="number"
                defaultValue={Math.round(object.height)}
                onChange={(e) =>
                  onUpdateObject?.(object.id, {
                    height: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {object.radius && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius
              </label>
              <input
                type="number"
                defaultValue={Math.round(object.radius)}
                onChange={(e) =>
                  onUpdateObject?.(object.id, {
                    radius: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>
      </PropertySection>

      {/* Appearance Section */}
      <PropertySection
        title="Appearance"
        icon={<Palette className="w-4 h-4" />}
        expanded={expanded.appearance}
        onToggle={() => toggle('appearance')}
      >
        <div className="space-y-3">
          {(object.data?.fill || object.type === 'text') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {object.type === 'text' ? 'Text Color' : 'Fill'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  defaultValue={object.data?.fill || '#000000'}
                  onChange={(e) => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, fill: e.target.value },
                      })
                    }
                  }}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue={object.data?.fill || '#000000'}
                  onChange={(e) => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, fill: e.target.value },
                      })
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {object.data?.stroke && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contorno
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  defaultValue={object.data.stroke}
                  onChange={(e) => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, stroke: e.target.value },
                      })
                    }
                  }}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue={object.data.stroke}
                  onChange={(e) => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, stroke: e.target.value },
                      })
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {object.data?.strokeWidth && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espessura do Contorno
              </label>
              <input
                type="number"
                defaultValue={object.data.strokeWidth}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: {
                        ...object.data,
                        strokeWidth: parseFloat(e.target.value) || 1,
                      },
                    })
                  }
                }}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>
      </PropertySection>

      {/* Typography Section */}
      {object.type === 'text' && (
        <PropertySection
          title="Tipografia"
          icon={<Type className="w-4 h-4" />}
          expanded={expanded.typography}
          onToggle={() => toggle('typography')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                defaultValue={object.data?.text || 'Sample Text'}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: { ...object.data, text: e.target.value },
                    })
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font
              </label>
              <select
                defaultValue={object.data?.fontFamily || 'Arial'}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: { ...object.data, fontFamily: e.target.value },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Roboto">Roboto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                type="number"
                defaultValue={object.data?.fontSize || 16}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: {
                        ...object.data,
                        fontSize: parseFloat(e.target.value) || 12,
                      },
                    })
                  }
                }}
                min="8"
                max="72"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Align
              </label>
              <select
                defaultValue={object.data?.align || 'left'}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: { ...object.data, align: e.target.value },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </PropertySection>
      )}

      {/* Frame Layout Section */}
      {object.type === 'frame' && (
        <PropertySection
          title="Layout & Frame"
          icon={<FrameIcon className="w-4 h-4" />}
          expanded={expanded.frame}
          onToggle={() => toggle('frame')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame Name
              </label>
              <input
                type="text"
                defaultValue={object.data?.name || 'Frame'}
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: { ...object.data, name: e.target.value },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Children Count
              </label>
              <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md">
                {object.data?.children?.length || 0} objects inside
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Direction
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, layoutDirection: 'row' },
                      })
                    }
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    object.data?.layoutDirection === 'row'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowRight className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => {
                    if (onUpdateObject) {
                      onUpdateObject(object.id, {
                        data: { ...object.data, layoutDirection: 'column' },
                      })
                    }
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    object.data?.layoutDirection === 'column'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowDown className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding
              </label>
              <input
                type="number"
                defaultValue={object.data?.layoutPadding || 16}
                min="0"
                max="100"
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: {
                        ...object.data,
                        layoutPadding: Number(e.target.value),
                      },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gap Between Items
              </label>
              <input
                type="number"
                defaultValue={object.data?.layoutGap || 12}
                min="0"
                max="50"
                onChange={(e) => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: {
                        ...object.data,
                        layoutGap: Number(e.target.value),
                      },
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Wrap Items
              </label>
              <button
                onClick={() => {
                  if (onUpdateObject) {
                    onUpdateObject(object.id, {
                      data: {
                        ...object.data,
                        layoutWrap: !object.data?.layoutWrap,
                      },
                    })
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  object.data?.layoutWrap !== false
                    ? 'bg-purple-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    object.data?.layoutWrap !== false
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </PropertySection>
      )}

      {/* Actions Section */}
      <PropertySection
        title="Actions"
        icon={<Settings className="w-4 h-4" />}
        expanded={expanded.actions}
        onToggle={() => toggle('actions')}
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              // TODO: Implement duplicate functionality
              console.log('Duplicate object:', object.id)
            }}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              // TODO: Implement bring to front functionality
              console.log('Bring to front:', object.id)
            }}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Bring to Front
          </button>
          <button
            onClick={() => {
              // TODO: Implement send to back functionality
              console.log('Send to back:', object.id)
            }}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Send to Back
          </button>
          <button
            onClick={() => {
              if (
                onDeleteObject &&
                window.confirm('Are you sure you want to delete this object?')
              ) {
                onDeleteObject(object.id)
              }
            }}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </PropertySection>
    </div>
  )
}

interface PropertySectionProps {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function PropertySection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: PropertySectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center space-x-2 p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="text-purple-500">{icon}</div>
        <span className="text-sm font-medium text-gray-800 flex-1">
          {title}
        </span>
        <div className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="p-3 pt-0 border-t border-gray-100">{children}</div>
      )}
    </div>
  )
}
