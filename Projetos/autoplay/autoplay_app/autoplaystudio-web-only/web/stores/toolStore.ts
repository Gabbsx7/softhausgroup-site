import { create } from 'zustand'

export type ToolType =
  | 'select'
  | 'hand'
  | 'frame'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'line'

export interface ToolSettings {
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
  fontFamily?: string
  cornerRadius?: number
  opacity?: number
}

interface ToolState {
  activeTool: ToolType
  toolSettings: ToolSettings
  isDrawing: boolean
  startPoint: { x: number; y: number } | null
  endPoint: { x: number; y: number } | null
  cursor: string
}

interface ToolActions {
  setActiveTool: (tool: ToolType) => void
  setToolSettings: (settings: Partial<ToolSettings>) => void
  setIsDrawing: (isDrawing: boolean) => void
  setStartPoint: (point: { x: number; y: number } | null) => void
  setEndPoint: (point: { x: number; y: number } | null) => void
  setCursor: (cursor: string) => void
  resetDrawing: () => void
}

type ToolStore = ToolState & ToolActions

export const useToolStore = create<ToolStore>()((set, get) => ({
  // Estado inicial
  activeTool: 'select',
  toolSettings: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: 'Arial',
    cornerRadius: 0,
    opacity: 1,
  },
  isDrawing: false,
  startPoint: null,
  endPoint: null,
  cursor: 'default',

  // Ações
  setActiveTool: (tool) => {
    set((state) => {
      // Definir cursor baseado na ferramenta
      const cursorMap: Record<ToolType, string> = {
        select: 'default',
        hand: 'grab',
        frame: 'crosshair',
        rectangle: 'crosshair',
        circle: 'crosshair',
        text: 'text',
        line: 'crosshair',
      }

      return {
        activeTool: tool,
        cursor: cursorMap[tool],
        isDrawing: false,
        startPoint: null,
        endPoint: null,
      }
    })
  },

  setToolSettings: (settings) => {
    set((state) => ({
      toolSettings: {
        ...state.toolSettings,
        ...settings,
      },
    }))
  },

  setIsDrawing: (isDrawing) => {
    set({ isDrawing })
  },

  setStartPoint: (point) => {
    set({ startPoint: point })
  },

  setEndPoint: (point) => {
    set({ endPoint: point })
  },

  setCursor: (cursor) => {
    set({ cursor })
  },

  resetDrawing: () => {
    set({
      isDrawing: false,
      startPoint: null,
      endPoint: null,
    })
  },
}))

// Hook para obter configurações da ferramenta ativa
export const useActiveToolSettings = () => {
  const { activeTool, toolSettings } = useToolStore()

  return {
    activeTool,
    ...toolSettings,
  }
}

// Hook para obter configurações de uma ferramenta específica
export const useToolConfig = (tool: ToolType) => {
  const { toolSettings } = useToolStore()

  // Configurações padrão para cada ferramenta
  const defaultConfigs: Record<ToolType, Partial<ToolSettings>> = {
    select: {},
    hand: {},
    frame: {
      fill: 'transparent',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
    rectangle: {
      fill: '#f3f4f6',
      stroke: '#6b7280',
      strokeWidth: 2,
    },
    circle: {
      fill: '#f3f4f6',
      stroke: '#6b7280',
      strokeWidth: 2,
    },
    text: {
      fill: '#1f2937',
      fontSize: 16,
      fontFamily: 'Arial',
    },
    line: {
      stroke: '#6b7280',
      strokeWidth: 2,
    },
  }

  return {
    ...defaultConfigs[tool],
    ...toolSettings,
  }
}
