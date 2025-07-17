import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface CanvasObject {
  id: string
  type: 'shape' | 'text' | 'asset' | 'frame'
  shape?: 'rectangle' | 'circle' | 'line'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  visible: boolean
  locked?: boolean
  data?: any // Flexible data property for storing type-specific data
  // Legacy properties for backwards compatibility
  radius?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  name?: string
  assetId?: string
  imageUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

interface CanvasState {
  objects: CanvasObject[]
  selectedId: string | null
  zoom: number
  panX: number
  panY: number
  history: CanvasObject[][]
  historyIndex: number
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
}

interface CanvasActions {
  addObject: (object: CanvasObject) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  deleteObject: (id: string) => void
  selectObject: (id: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setObjects: (objects: CanvasObject[]) => void
  clearCanvas: () => void
  undo: () => void
  redo: () => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  duplicateObject: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
}

type CanvasStore = CanvasState & CanvasActions

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => ({
    // Initial state
    objects: [],
    selectedId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    history: [[]],
    historyIndex: 0,
    gridVisible: true,
    snapToGrid: false,
    gridSize: 20,

    // Actions
    addObject: (object) =>
      set((state) => {
        const newObject = {
          ...object,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        state.objects.push(newObject)
        state.selectedId = newObject.id

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push([...state.objects])
        state.history = newHistory
        state.historyIndex = newHistory.length - 1
      }),

    updateObject: (id, updates) =>
      set((state) => {
        const objectIndex = state.objects.findIndex((obj) => obj.id === id)
        if (objectIndex !== -1) {
          state.objects[objectIndex] = {
            ...state.objects[objectIndex],
            ...updates,
            updatedAt: new Date(),
          }

          // Add to history
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push([...state.objects])
          state.history = newHistory
          state.historyIndex = newHistory.length - 1
        }
      }),

    deleteObject: (id) =>
      set((state) => {
        state.objects = state.objects.filter((obj) => obj.id !== id)
        if (state.selectedId === id) {
          state.selectedId = null
        }

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push([...state.objects])
        state.history = newHistory
        state.historyIndex = newHistory.length - 1
      }),

    selectObject: (id) =>
      set((state) => {
        state.selectedId = id
      }),

    setZoom: (zoom) =>
      set((state) => {
        state.zoom = Math.max(0.1, Math.min(5, zoom))
      }),

    setPan: (x, y) =>
      set((state) => {
        state.panX = x
        state.panY = y
      }),

    setObjects: (objects) =>
      set((state) => {
        state.objects = objects
        state.selectedId = null

        // Reset history
        state.history = [objects]
        state.historyIndex = 0
      }),

    clearCanvas: () =>
      set((state) => {
        state.objects = []
        state.selectedId = null

        // Reset history
        state.history = [[]]
        state.historyIndex = 0
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          state.objects = [...state.history[state.historyIndex]]
          state.selectedId = null
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          state.objects = [...state.history[state.historyIndex]]
          state.selectedId = null
        }
      }),

    toggleGrid: () =>
      set((state) => {
        state.gridVisible = !state.gridVisible
      }),

    toggleSnapToGrid: () =>
      set((state) => {
        state.snapToGrid = !state.snapToGrid
      }),

    setGridSize: (size) =>
      set((state) => {
        state.gridSize = Math.max(5, Math.min(100, size))
      }),

    duplicateObject: (id) =>
      set((state) => {
        const object = state.objects.find((obj) => obj.id === id)
        if (object) {
          const newObject = {
            ...object,
            id: `${object.type}-${Date.now()}`,
            x: object.x + 20,
            y: object.y + 20,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          state.objects.push(newObject)
          state.selectedId = newObject.id

          // Add to history
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push([...state.objects])
          state.history = newHistory
          state.historyIndex = newHistory.length - 1
        }
      }),

    bringToFront: (id) =>
      set((state) => {
        const objectIndex = state.objects.findIndex((obj) => obj.id === id)
        if (objectIndex !== -1) {
          const object = state.objects.splice(objectIndex, 1)[0]
          state.objects.push(object)
        }
      }),

    sendToBack: (id) =>
      set((state) => {
        const objectIndex = state.objects.findIndex((obj) => obj.id === id)
        if (objectIndex !== -1) {
          const object = state.objects.splice(objectIndex, 1)[0]
          state.objects.unshift(object)
        }
      }),
  }))
)
