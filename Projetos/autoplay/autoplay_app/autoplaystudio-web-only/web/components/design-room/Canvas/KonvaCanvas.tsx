'use client'

import React, { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useCanvasStore, CanvasObject } from '@/stores/canvasStore'
import { useToolStore } from '@/stores/toolStore'
import { ProjectAsset } from '@/hooks/useProjectAssets'

// Lazy load do KonvaEventObject apenas quando necessário  
let KonvaEventObject: any = null
if (typeof window !== 'undefined') {
  import('konva/lib/Node').then((mod) => {
    KonvaEventObject = mod.KonvaEventObject
  })
}

// Dynamic imports para componentes Konva pesados
const Stage = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Stage })), { ssr: false })
const Layer = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Layer })), { ssr: false })
const Rect = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Rect })), { ssr: false })
const Circle = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Circle })), { ssr: false })
const Text = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Text })), { ssr: false })
const Line = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Line })), { ssr: false })
const Group = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Group })), { ssr: false })
const Image = dynamic(() => import('react-konva').then((mod) => ({ default: mod.Image })), { ssr: false })

interface KonvaCanvasProps {
  projectId: string
  assets: ProjectAsset[]
  objects: CanvasObject[]
  selectedId: string | null
  zoom: number
  mode: 'view' | 'edit'
}

export default function KonvaCanvas({
  projectId,
  assets,
  objects,
  selectedId,
  zoom,
  mode,
}: KonvaCanvasProps) {
  const stageRef = useRef<any>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({})
  const [hoveredFrameId, setHoveredFrameId] = useState<string | null>(null)

  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [textEditValue, setTextEditValue] = useState('')
  const [textEditPosition, setTextEditPosition] = useState({ x: 0, y: 0 })

  const {
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setPan,
    setZoom,
    gridVisible,
    gridSize,
    panX,
    panY,
  } = useCanvasStore()

  const {
    activeTool,
    isDrawing,
    startPoint,
    endPoint,
    setIsDrawing,
    setStartPoint,
    setEndPoint,
    resetDrawing,
    toolSettings,
  } = useToolStore()

  // Adjust stage size
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container()
        if (container) {
          const rect = container.getBoundingClientRect()
          setStageSize({
            width: rect.width,
            height: rect.height,
          })
        }
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Keyboard and scroll handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'view') return

      // Check if user is editing text (input, textarea, contentEditable)
      const isEditingText =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement &&
          e.target.contentEditable === 'true') ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)

      // Only handle shortcuts if the canvas container has focus or the event target is the canvas
      const canvasContainer = canvasContainerRef.current
      const isCanvasFocused =
        canvasContainer &&
        (canvasContainer === document.activeElement ||
          canvasContainer.contains(e.target as Node))

      if (!isCanvasFocused && !isEditingText) return

      // Delete key to delete selected object (only if not editing text)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
        if (selectedId) {
          e.preventDefault() // Prevent default browser behavior
          deleteObject(selectedId)
        }
      }

      // Ctrl + Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // TODO: Implement undo
        console.log('Undo triggered')
      }

      // Ctrl + Shift + Z for redo (or Ctrl + Y)
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'Z') ||
        (e.ctrlKey && e.key === 'y')
      ) {
        e.preventDefault()
        // TODO: Implement redo
        console.log('Redo triggered')
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        selectObject(null)
      }
    }

    // Zoom with Ctrl + scroll
    const handleWheel = (e: WheelEvent) => {
      const canvasContainer = canvasContainerRef.current
      if (!canvasContainer || !canvasContainer.contains(e.target as Node))
        return

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5)
        setZoom(newZoom)
      } else if (e.shiftKey) {
        // Horizontal pan with Shift + scroll
        e.preventDefault()
        const newPos = { x: panX - e.deltaY, y: panY }
        setPan(newPos.x, newPos.y)
      } else {
        // Vertical pan with normal scroll
        e.preventDefault()
        const newPos = { x: panX, y: panY - e.deltaY }
        setPan(newPos.x, newPos.y)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [
    mode,
    selectedId,
    deleteObject,
    setZoom,
    setPan,
    zoom,
    panX,
    panY,
    selectObject,
  ])

  // Pre-load asset images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = assets.map(async (asset) => {
        return new Promise<{ id: string; img: HTMLImageElement }>(
          (resolve, reject) => {
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              resolve({ id: asset.id, img })
            }
            img.onerror = () => {
              reject(new Error(`Failed to load image: ${asset.title}`))
            }
            img.src = asset.file_url
          }
        )
      })

      try {
        const loadedImages = await Promise.allSettled(imagePromises)
        const imageMap: { [key: string]: HTMLImageElement } = {}

        loadedImages.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            imageMap[result.value.id] = result.value.img
          } else {
            console.error(
              'Failed to load image for asset:',
              assets[index].title
            )
          }
        })

        setImages(imageMap)
      } catch (error) {
        console.error('Error loading images:', error)
      }
    }

    if (assets.length > 0) {
      loadImages()
    }
  }, [assets])

  // Load images for canvas objects
  useEffect(() => {
    if (objects.length > 0) {
      const loadObjectImages = async () => {
        const objectsWithImages = objects.filter(
          (obj) => obj.type === 'asset' && obj.data?.file_url
        )

        const imagePromises = objectsWithImages.map(async (obj) => {
          return new Promise<{ id: string; img: HTMLImageElement }>(
            (resolve, reject) => {
              const img = new window.Image()
              img.crossOrigin = 'anonymous'
              img.onload = () => resolve({ id: obj.id, img })
              img.onerror = () => {
                reject(
                  new Error(`Failed to load object image: ${obj.data?.title}`)
                )
              }
              img.src = obj.data.file_url
            }
          )
        })

        try {
          const loadedImages = await Promise.allSettled(imagePromises)
          const newImages = { ...images }

          loadedImages.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              newImages[result.value.id] = result.value.img
            }
          })

          setImages(newImages)
        } catch (error) {
          console.error('Error loading object images:', error)
        }
      }

      loadObjectImages()
    }
  }, [objects, images])

  const [isDragOver, setIsDragOver] = useState(false)

  const handleMouseDown = (e: any) => {
    // Focus the canvas container when clicked
    if (canvasContainerRef.current) {
      canvasContainerRef.current.focus()
    }

    if (mode === 'view') return

    // Cancel text editing if clicking elsewhere
    if (editingTextId) {
      finishTextEditing()
      return
    }

    const stage = e.target.getStage()
    const pos = stage?.getPointerPosition()

    if (!pos) return

    const realPos = {
      x: (pos.x - panX) / zoom,
      y: (pos.y - panY) / zoom,
    }

    // Detect frame hover during drawing
    if (activeTool !== 'select' && activeTool !== 'hand') {
      detectFrameHover(realPos)
    }

    if (activeTool === 'select') {
      // Deselect if clicking on empty space
      if (e.target === stage) {
        selectObject(null)
      }
    } else if (activeTool === 'hand') {
      setIsDrawing(true)
      setDragPos({ x: pos.x, y: pos.y })
    } else {
      // Drawing tools
      setIsDrawing(true)
      setStartPoint(realPos)
      setEndPoint(realPos)
    }
  }

  const handleMouseMove = (e: any) => {
    if (mode === 'view') return

    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return

    // Detectar hover sobre frames durante drag
    const stagePos = {
      x: (pos.x - panX) / zoom,
      y: (pos.y - panY) / zoom,
    }

    if (activeTool === 'select') {
      detectFrameHover(stagePos)
    }

    if (activeTool === 'hand' && isDrawing) {
      const newPos = {
        x: pos.x - dragPos.x,
        y: pos.y - dragPos.y,
      }
      setPan(newPos.x, newPos.y)
    } else if (activeTool !== 'select' && isDrawing) {
      setEndPoint(stagePos)
    }
  }

  const detectFrameHover = (pos: { x: number; y: number }) => {
    const frames = objects.filter((obj) => obj.type === 'frame')
    let hoveredFrame = null

    for (const frame of frames) {
      if (
        pos.x >= frame.x &&
        pos.x <= frame.x + frame.width &&
        pos.y >= frame.y + 30 && // Header do frame
        pos.y <= frame.y + frame.height
      ) {
        hoveredFrame = frame.id
        break
      }
    }

    setHoveredFrameId(hoveredFrame)
  }

  const handleMouseUp = () => {
    if (mode === 'view') return

    if (isDrawing && activeTool !== 'hand' && activeTool !== 'select') {
      createObject()
    }

    setIsDrawing(false)
    resetDrawing()
  }

  // Text editing functions
  const startTextEditing = (textObject: CanvasObject) => {
    if (mode === 'view') return

    setEditingTextId(textObject.id)
    setTextEditValue(textObject.data?.text || '')

    // Calculate position for text input
    const stage = stageRef.current
    if (stage) {
      const stageRect = stage.container().getBoundingClientRect()
      const x = stageRect.left + textObject.x * zoom + panX
      const y = stageRect.top + textObject.y * zoom + panY

      setTextEditPosition({ x, y })
    }
  }

  const finishTextEditing = () => {
    if (editingTextId && textEditValue.trim()) {
      updateObject(editingTextId, {
        data: {
          ...objects.find((obj) => obj.id === editingTextId)?.data,
          text: textEditValue,
        },
      })
    }
    setEditingTextId(null)
    setTextEditValue('')
  }

  const cancelTextEditing = () => {
    setEditingTextId(null)
    setTextEditValue('')
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    // Focus the canvas after drop
    if (canvasContainerRef.current) {
      canvasContainerRef.current.focus()
    }

    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (!dataStr) return

      const data = JSON.parse(dataStr)
      console.log('Drop data:', data)

      if (data.type === 'asset') {
        // Get drop position relative to stage
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Convert to stage coordinates
        const stageX = (x - panX) / zoom
        const stageY = (y - panY) / zoom

        console.log('Drop position:', { x: stageX, y: stageY })

        // Create new object asset on canvas
        const newObject: CanvasObject = {
          id: `asset-${Date.now()}`,
          type: 'asset',
          x: stageX,
          y: stageY,
          width: 200,
          height: 150,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            id: data.id,
            title: data.title,
            file_url: data.file_url,
            mime_type: data.mime_type,
            width: data.width,
            height: data.height,
          },
        }

        console.log('Adding new object:', newObject)
        addObject(newObject)
      } else if (data.type === 'canvas-object') {
        // Handle moving existing canvas objects
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Convert to stage coordinates
        const stageX = (x - panX) / zoom
        const stageY = (y - panY) / zoom

        updateObject(data.id, { x: stageX, y: stageY })
      }
    } catch (error) {
      console.error('Error parsing drop data:', error)
    }
  }

  const createObject = () => {
    if (activeTool === 'select' || activeTool === 'hand') return
    if (!startPoint || !endPoint) return

    const width = Math.abs(endPoint.x - startPoint.x)
    const height = Math.abs(endPoint.y - startPoint.y)

    // Minimum size check
    if (width < 10 || height < 10) return

    const x = Math.min(startPoint.x, endPoint.x)
    const y = Math.min(startPoint.y, endPoint.y)

    let newObject: CanvasObject

    switch (activeTool) {
      case 'rectangle':
        newObject = {
          id: `rect-${Date.now()}`,
          type: 'shape',
          shape: 'rectangle',
          x,
          y,
          width,
          height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            fill: toolSettings.fill || '#f3f4f6',
            stroke: toolSettings.stroke || '#6b7280',
            strokeWidth: toolSettings.strokeWidth || 2,
          },
        }
        break

      case 'circle':
        newObject = {
          id: `circle-${Date.now()}`,
          type: 'shape',
          shape: 'circle',
          x,
          y,
          width,
          height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            fill: toolSettings.fill || '#f3f4f6',
            stroke: toolSettings.stroke || '#6b7280',
            strokeWidth: toolSettings.strokeWidth || 2,
          },
        }
        break

      case 'line':
        newObject = {
          id: `line-${Date.now()}`,
          type: 'shape',
          shape: 'line',
          x: startPoint.x,
          y: startPoint.y,
          width: endPoint.x - startPoint.x,
          height: endPoint.y - startPoint.y,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            stroke: toolSettings.stroke || '#6b7280',
            strokeWidth: toolSettings.strokeWidth || 2,
            points: [
              0,
              0,
              endPoint.x - startPoint.x,
              endPoint.y - startPoint.y,
            ],
          },
        }
        break

      case 'text':
        newObject = {
          id: `text-${Date.now()}`,
          type: 'text',
          x,
          y,
          width: Math.max(width, 100),
          height: Math.max(height, 20),
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            text: 'Sample Text',
            fontSize: toolSettings.fontSize || 16,
            fontFamily: toolSettings.fontFamily || 'Arial',
            fill: toolSettings.fill || '#000000',
            align: 'left',
          },
        }
        break

      case 'frame':
        newObject = {
          id: `frame-${Date.now()}`,
          type: 'frame',
          x,
          y,
          width: Math.max(width, 400),
          height: Math.max(height, 300),
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          data: {
            name: 'New Frame',
            backgroundColor: '#ffffff',
            stroke: '#e5e7eb',
            strokeWidth: 2,
            children: [], // Array to store child object IDs
            clipContent: false, // Whether to clip content to frame bounds
            layoutDirection: 'row', // 'row' | 'column'
            layoutWrap: true, // Whether to wrap items
            layoutGap: 12, // Gap between items
            layoutPadding: 16, // Padding inside frame
          },
        }
        break

      default:
        return
    }

    addObject(newObject)
  }

  const handleObjectDragEnd = (
    id: string,
    newPos: { x: number; y: number }
  ) => {
    // newPos já está em coordenadas do stage, não precisa conversão
    updateObject(id, {
      x: newPos.x,
      y: newPos.y,
    })

    // Verificar se o objeto foi dropado dentro de um frame
    checkFrameDropZone(id, newPos)
  }

  const checkFrameDropZone = (
    draggedId: string,
    pos: { x: number; y: number }
  ) => {
    const draggedObj = objects.find((obj) => obj.id === draggedId)
    if (!draggedObj) return

    // Remover objeto de qualquer frame atual
    removeObjectFromAllFrames(draggedId)

    // Encontrar frames que podem aceitar o objeto
    const frames = objects.filter(
      (obj) => obj.type === 'frame' && obj.id !== draggedId
    )

    let droppedInFrame = false
    for (const frame of frames) {
      // Verificar se o objeto está dentro das boundaries do frame (com margem para header)
      if (
        pos.x >= frame.x &&
        pos.x <= frame.x + frame.width &&
        pos.y >= frame.y + 30 && // 30px para header do frame
        pos.y <= frame.y + frame.height
      ) {
        // Adicionar objeto ao frame e aplicar autolayout
        addObjectToFrame(draggedId, frame.id)
        droppedInFrame = true
        break
      }
    }

    // Reset hover state
    setHoveredFrameId(null)
  }

  const removeObjectFromAllFrames = (objectId: string) => {
    objects.forEach((obj) => {
      if (obj.type === 'frame' && obj.data?.children?.includes(objectId)) {
        const newChildren = obj.data.children.filter(
          (id: string) => id !== objectId
        )
        updateObject(obj.id, {
          data: {
            ...obj.data,
            children: newChildren,
          },
        })
      }
    })
  }

  const addObjectToFrame = (objectId: string, frameId: string) => {
    const frame = objects.find((obj) => obj.id === frameId)
    const obj = objects.find((obj) => obj.id === objectId)

    if (!frame || !obj) return

    // Atualizar frame para incluir o objeto como filho
    const currentChildren = frame.data?.children || []
    if (!currentChildren.includes(objectId)) {
      updateObject(frameId, {
        data: {
          ...frame.data,
          children: [...currentChildren, objectId],
        },
      })

      // Aplicar autolayout
      applyAutoLayout(frameId)
    }
  }

  const applyAutoLayout = (frameId: string) => {
    const frame = objects.find((obj) => obj.id === frameId)
    if (!frame || !frame.data?.children) return

    const children: CanvasObject[] = []
    for (const childId of frame.data.children) {
      const child = objects.find((obj) => obj.id === childId)
      if (child) children.push(child)
    }

    if (children.length === 0) return

    // Configurações do autolayout do frame
    const padding = frame.data.layoutPadding || 16
    const spacing = frame.data.layoutGap || 12
    const direction = frame.data.layoutDirection || 'row'
    const wrap = frame.data.layoutWrap !== false

    const headerHeight = 30
    const availableWidth = frame.width - padding * 2
    const availableHeight = frame.height - padding * 2 - headerHeight

    if (direction === 'row') {
      // Layout horizontal
      const itemsPerRow = wrap
        ? Math.floor(availableWidth / 200) || 1
        : children.length

      children.forEach((child: CanvasObject, index: number) => {
        const row = Math.floor(index / itemsPerRow)
        const col = index % itemsPerRow

        const itemWidth =
          (availableWidth - spacing * (itemsPerRow - 1)) / itemsPerRow
        const itemHeight = Math.min(itemWidth * 0.75, 200) // Proporção 4:3

        const newX = frame.x + padding + col * (itemWidth + spacing)
        const newY =
          frame.y + headerHeight + padding + row * (itemHeight + spacing)

        updateObject(child.id, {
          x: newX,
          y: newY,
          width: itemWidth,
          height: itemHeight,
        })
      })
    } else {
      // Layout vertical
      const itemWidth = availableWidth
      const maxItemHeight =
        (availableHeight - spacing * (children.length - 1)) / children.length

      children.forEach((child: CanvasObject, index: number) => {
        const itemHeight = Math.min(maxItemHeight, 150)

        const newX = frame.x + padding
        const newY =
          frame.y + headerHeight + padding + index * (itemHeight + spacing)

        updateObject(child.id, {
          x: newX,
          y: newY,
          width: itemWidth,
          height: itemHeight,
        })
      })
    }
  }

  const renderGrid = () => {
    if (!gridVisible) return null

    const lines = []
    const stage = stageRef.current
    if (!stage) return null

    const stageWidth = stageSize.width / zoom
    const stageHeight = stageSize.height / zoom
    const startX = -panX / zoom - ((-panX / zoom) % gridSize)
    const startY = -panY / zoom - ((-panY / zoom) % gridSize)

    // Vertical lines
    for (let x = startX; x < stageWidth + -panX / zoom; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, -panY / zoom, x, stageHeight + -panY / zoom]}
          stroke="#e5e7eb"
          strokeWidth={1 / zoom}
          listening={false}
        />
      )
    }

    // Horizontal lines
    for (let y = startY; y < stageHeight + -panY / zoom; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-panX / zoom, y, stageWidth + -panX / zoom, y]}
          stroke="#e5e7eb"
          strokeWidth={1 / zoom}
          listening={false}
        />
      )
    }

    return lines
  }

  const renderObject = (obj: CanvasObject) => {
    const isSelected = obj.id === selectedId

    // Verificar se o objeto está dentro de um frame
    const parentFrame = objects.find(
      (frame) =>
        frame.type === 'frame' && frame.data?.children?.includes(obj.id)
    )

    const commonProps = {
      x: obj.x,
      y: obj.y,
      rotation: obj.rotation,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      visible: obj.visible,
      draggable: mode === 'edit' && activeTool === 'select',
      onClick: () => {
        if (mode === 'edit') {
          selectObject(obj.id)
        }
      },
      onDragEnd: (e: any) => {
        const newPos = e.target.position()
        handleObjectDragEnd(obj.id, newPos)
      },
    }

    if (obj.type === 'shape') {
      switch (obj.shape) {
        case 'rectangle':
          return (
            <Group key={obj.id}>
              <Rect
                {...commonProps}
                width={obj.width}
                height={obj.height}
                fill={obj.data.fill}
                stroke={obj.data.stroke}
                strokeWidth={obj.data.strokeWidth}
              />
              {/* Frame membership indicator */}
              {parentFrame && (
                <Rect
                  x={obj.x - 2}
                  y={obj.y - 2}
                  width={obj.width + 4}
                  height={obj.height + 4}
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  opacity={0.5}
                  listening={false}
                  dash={[3, 3]}
                />
              )}

              {isSelected && (
                <Rect
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  stroke="#3b82f6"
                  strokeWidth={2 / zoom}
                  listening={false}
                  dash={[5 / zoom, 5 / zoom]}
                />
              )}
            </Group>
          )

        case 'circle':
          return (
            <Group key={obj.id}>
              <Circle
                {...commonProps}
                x={obj.x + obj.width / 2}
                y={obj.y + obj.height / 2}
                radius={Math.min(obj.width, obj.height) / 2}
                fill={obj.data.fill}
                stroke={obj.data.stroke}
                strokeWidth={obj.data.strokeWidth}
              />

              {/* Frame membership indicator */}
              {parentFrame && (
                <Circle
                  x={obj.x + obj.width / 2}
                  y={obj.y + obj.height / 2}
                  radius={Math.min(obj.width, obj.height) / 2 + 3}
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  opacity={0.5}
                  listening={false}
                  dash={[3, 3]}
                />
              )}

              {isSelected && (
                <Circle
                  x={obj.x + obj.width / 2}
                  y={obj.y + obj.height / 2}
                  radius={Math.min(obj.width, obj.height) / 2}
                  stroke="#3b82f6"
                  strokeWidth={2 / zoom}
                  listening={false}
                  dash={[5 / zoom, 5 / zoom]}
                />
              )}
            </Group>
          )

        case 'line':
          return (
            <Group key={obj.id}>
              <Line
                {...commonProps}
                points={obj.data.points}
                stroke={obj.data.stroke}
                strokeWidth={obj.data.strokeWidth}
              />
              {isSelected && (
                <Line
                  x={obj.x}
                  y={obj.y}
                  points={obj.data.points}
                  stroke="#3b82f6"
                  strokeWidth={2 / zoom}
                  listening={false}
                  dash={[5 / zoom, 5 / zoom]}
                />
              )}
            </Group>
          )
      }
    }

    if (obj.type === 'text') {
      return (
        <Group key={obj.id}>
          <Text
            {...commonProps}
            text={obj.data.text}
            fontSize={obj.data.fontSize}
            fontFamily={obj.data.fontFamily}
            fill={obj.data.fill}
            align={obj.data.align}
            width={obj.width}
            height={obj.height}
            visible={editingTextId !== obj.id}
            onDblClick={() => {
              if (mode === 'edit') {
                startTextEditing(obj)
              }
            }}
          />

          {/* Frame membership indicator */}
          {parentFrame && (
            <Rect
              x={obj.x - 2}
              y={obj.y - 2}
              width={obj.width + 4}
              height={obj.height + 4}
              stroke="#8b5cf6"
              strokeWidth={1}
              opacity={0.5}
              listening={false}
              dash={[3, 3]}
            />
          )}

          {isSelected && (
            <Rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              stroke="#3b82f6"
              strokeWidth={2 / zoom}
              listening={false}
              dash={[5 / zoom, 5 / zoom]}
            />
          )}
        </Group>
      )
    }

    if (obj.type === 'frame') {
      const isHovered = hoveredFrameId === obj.id
      const childrenCount = obj.data?.children?.length || 0

      return (
        <Group key={obj.id}>
          {/* Frame background */}
          <Rect
            {...commonProps}
            width={obj.width}
            height={obj.height}
            fill={obj.data?.backgroundColor || '#ffffff'}
            stroke={isHovered ? '#3b82f6' : obj.data?.stroke || '#e5e7eb'}
            strokeWidth={isHovered ? 3 : obj.data?.strokeWidth || 1}
            strokeDashArray={isHovered ? [8, 4] : undefined}
          />

          {/* Frame header */}
          <Rect
            x={obj.x}
            y={obj.y}
            width={obj.width}
            height={30}
            fill="#f8fafc"
            stroke={isHovered ? '#3b82f6' : '#e5e7eb'}
            strokeWidth={isHovered ? 3 : 1}
            listening={false}
          />

          {/* Frame label */}
          <Text
            x={obj.x + 8}
            y={obj.y + 8}
            text={`${obj.data?.name || 'Frame'} (${childrenCount})`}
            fontSize={12 / zoom}
            fill="#374151"
            fontWeight="500"
            listening={false}
          />

          {/* Drop zone indicator when hovered */}
          {isHovered && (
            <Rect
              x={obj.x + 4}
              y={obj.y + 34}
              width={obj.width - 8}
              height={obj.height - 38}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDashArray={[4, 4]}
              listening={false}
            />
          )}

          {/* Selection indicator */}
          {isSelected && (
            <Rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              stroke="#8b5cf6"
              strokeWidth={3 / zoom}
              listening={false}
              dash={[8 / zoom, 4 / zoom]}
            />
          )}
        </Group>
      )
    }

    if (obj.type === 'asset') {
      const isVideo =
        obj.data?.mime_type?.startsWith('video/') ||
        (obj.data?.file_url && obj.data.file_url.match(/\.(mp4|webm|ogg)$/i))

      if (isVideo) {
        return (
          <Group key={obj.id}>
            <Rect
              {...commonProps}
              width={obj.width}
              height={obj.height}
              fill="#000"
              stroke="#3b82f6"
              strokeWidth={isSelected ? 2 / zoom : 1}
            />
            <foreignObject
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
            >
              <video
                src={obj.data.file_url}
                width={obj.width}
                height={obj.height}
                controls
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </foreignObject>
            <Text
              x={obj.x}
              y={obj.y + obj.height + 5}
              text={obj.data?.title || 'Video'}
              fontSize={12 / zoom}
              fill="#374151"
              listening={false}
            />
            {isSelected && (
              <Rect
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                stroke="#3b82f6"
                strokeWidth={2 / zoom}
                listening={false}
                dash={[5 / zoom, 5 / zoom]}
              />
            )}
          </Group>
        )
      }
      const image = images[obj.id] || images[obj.data?.id]

      if (image) {
        return (
          <Group key={obj.id}>
            <Image
              {...commonProps}
              image={image}
              width={obj.width}
              height={obj.height}
            />
            {/* Asset name label */}
            <Text
              x={obj.x}
              y={obj.y + obj.height + 5}
              text={obj.data?.title || 'Asset'}
              fontSize={12 / zoom}
              fill="#374151"
              listening={false}
            />
            {isSelected && (
              <Rect
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                stroke="#3b82f6"
                strokeWidth={2 / zoom}
                listening={false}
                dash={[5 / zoom, 5 / zoom]}
              />
            )}
          </Group>
        )
      } else {
        // Loading placeholder
        return (
          <Group key={obj.id}>
            <Rect
              {...commonProps}
              width={obj.width}
              height={obj.height}
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth={1}
            />
            <Text
              x={obj.x + obj.width / 2}
              y={obj.y + obj.height / 2}
              text="Loading..."
              fontSize={14}
              fill="#6b7280"
              align="center"
              offsetX={35}
              offsetY={7}
              listening={false}
            />
            {/* Asset name label */}
            <Text
              x={obj.x}
              y={obj.y + obj.height + 5}
              text={obj.data?.title || 'Asset'}
              fontSize={12 / zoom}
              fill="#374151"
              listening={false}
            />
            {isSelected && (
              <Rect
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                stroke="#3b82f6"
                strokeWidth={2 / zoom}
                listening={false}
                dash={[5 / zoom, 5 / zoom]}
              />
            )}
          </Group>
        )
      }
    }

    return null
  }

  const renderDrawingPreview = () => {
    if (!isDrawing || activeTool === 'select' || activeTool === 'hand')
      return null
    if (!startPoint || !endPoint) return null

    const x = Math.min(startPoint.x, endPoint.x)
    const y = Math.min(startPoint.y, endPoint.y)
    const width = Math.abs(endPoint.x - startPoint.x)
    const height = Math.abs(endPoint.y - startPoint.y)

    switch (activeTool) {
      case 'rectangle':
        return (
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={toolSettings.fill || '#f3f4f6'}
            stroke={toolSettings.stroke || '#6b7280'}
            strokeWidth={toolSettings.strokeWidth || 2}
            opacity={0.7}
            listening={false}
          />
        )

      case 'circle':
        return (
          <Circle
            x={x + width / 2}
            y={y + height / 2}
            radius={Math.min(width, height) / 2}
            fill={toolSettings.fill || '#f3f4f6'}
            stroke={toolSettings.stroke || '#6b7280'}
            strokeWidth={toolSettings.strokeWidth || 2}
            opacity={0.7}
            listening={false}
          />
        )

      case 'line':
        return (
          <Line
            points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
            stroke={toolSettings.stroke || '#6b7280'}
            strokeWidth={toolSettings.strokeWidth || 2}
            opacity={0.7}
            listening={false}
          />
        )

      case 'frame':
        return (
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(255, 255, 255, 0.8)"
            stroke="#e5e7eb"
            strokeWidth={1}
            opacity={0.7}
            listening={false}
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={canvasContainerRef}
      tabIndex={0}
      className={`
        w-full h-full bg-gray-100 overflow-hidden transition-all duration-200 outline-none relative
        ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg border border-blue-200">
            <p className="text-blue-600 font-medium">
              Drop here to add to canvas
            </p>
          </div>
        </div>
      )}

      {/* Text editing input */}
      {editingTextId && (
        <div
          className="absolute z-20"
          style={{
            left: textEditPosition.x,
            top: textEditPosition.y,
          }}
        >
          <textarea
            value={textEditValue}
            onChange={(e) => setTextEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                finishTextEditing()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                cancelTextEditing()
              }
            }}
            onBlur={finishTextEditing}
            autoFocus
            className="px-2 py-1 border border-purple-500 rounded text-sm font-inherit resize-none shadow-lg"
            style={{
              minWidth: '150px',
              backgroundColor: 'white',
              fontSize: `${
                (objects.find((obj) => obj.id === editingTextId)?.data
                  ?.fontSize || 16) * zoom
              }px`,
              fontFamily:
                objects.find((obj) => obj.id === editingTextId)?.data
                  ?.fontFamily || 'Arial',
            }}
            rows={1}
          />
          <div className="text-xs text-gray-500 mt-1">
            Enter para salvar • Esc para cancelar
          </div>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor:
            activeTool === 'hand'
              ? isDrawing
                ? 'grabbing'
                : 'grab'
              : activeTool === 'select'
              ? 'default'
              : 'crosshair',
        }}
      >
        <Layer>
          {/* Grid */}
          {renderGrid()}

          {/* Objects */}
          {objects.map(renderObject)}

          {/* Drawing preview */}
          {renderDrawingPreview()}
        </Layer>
      </Stage>
    </div>
  )
}
