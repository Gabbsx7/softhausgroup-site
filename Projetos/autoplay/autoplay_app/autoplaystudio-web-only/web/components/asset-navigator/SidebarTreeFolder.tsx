import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Image,
  Video,
  MoreHorizontal,
  Plus,
  Target,
  CheckCircle,
  Clock,
  Circle,
  ChevronUp,
  Home,
  ArrowLeft,
} from 'lucide-react'
import { useRouter, useParams, usePathname } from 'next/navigation'

// Tipos para o contexto
export type NavigationContext = 'dashboard' | 'project' | 'milestone' | 'asset'

interface SidebarTreeFolderProps {
  className?: string
  style?: React.CSSProperties
  onItemSelect?: (item: any) => void
  // Novos props para contextualização
  context?: NavigationContext
  contextData?: {
    clientId: string
    projectId?: string
    milestoneId?: string
    assetId?: string
  }
  // Dados dinâmicos (substituirá o mock)
  treeData?: any[]
  loading?: boolean
}

const SidebarTreeFolder = ({
  className,
  style,
  onItemSelect,
  context,
  contextData,
  treeData: externalTreeData,
  loading = false,
}: SidebarTreeFolderProps) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()

  // Auto-detectar contexto se não foi passado
  const detectedContext = context || detectContextFromPath(pathname)
  const detectedContextData = contextData || {
    clientId: params.clientId as string,
    projectId: params.projectId as string,
    milestoneId: params.milestoneId as string,
    assetId: params.assetId as string,
  }

  // Inicializar com folders principais expandidos
  const [expandedItems, setExpandedItems] = useState(
    new Set(['projects', 'a-collection', 'assets'])
  )

  // Usar dados externos ou fallback para mock
  const treeData =
    externalTreeData ||
    getContextualMockData(detectedContext, detectedContextData)

  // Função para detectar contexto da URL
  function detectContextFromPath(path: string): NavigationContext {
    if (path.includes('/asset/')) return 'asset'
    if (path.includes('/milestone/')) return 'milestone'
    if (path.includes('/project/')) return 'project'
    return 'dashboard'
  }

  // Função simples para expandir/colapsar
  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Navegação inteligente baseada no contexto
  const handleItemClick = (item: any) => {
    const { clientId, projectId, milestoneId } = detectedContextData

    // Se não tem clientId, não pode navegar
    if (!clientId) {
      return
    }

    // Para folders principais (Projects, Collections, Assets), apenas expandir/colapsar
    if (item.type === 'folder') {
      toggleExpanded(item.id)
      return
    }

    // Para projetos, expandir E navegar
    if (item.type === 'project') {
      // Primeiro expandir se tem filhos
      if (item.hasChildren) {
        toggleExpanded(item.id)
      }
      // Depois navegar
      const projectUrl = `/dashboard/client/${clientId}/project/${item.id}`
      router.push(projectUrl)
      return
    }

    // Para milestones
    if (item.type === 'milestone') {
      // Expandir se tem filhos
      if (item.hasChildren) {
        toggleExpanded(item.id)
      }
      // Navegar para milestone
      const targetProjectId =
        projectId || item.project_id || 'cool-branding-project'
      const milestoneUrl = `/dashboard/client/${clientId}/project/${targetProjectId}/milestone/${item.id}`
      router.push(milestoneUrl)
      return
    }

    // Para assets
    if (item.type === 'asset') {
      let assetUrl = ''

      if (milestoneId) {
        assetUrl = `/dashboard/client/${clientId}/project/${projectId}/milestone/${milestoneId}/asset/${item.id}`
      } else if (projectId) {
        assetUrl = `/dashboard/client/${clientId}/project/${projectId}/asset/${item.id}`
      } else {
        assetUrl = `/dashboard/client/${clientId}/asset/${item.id}`
      }

      router.push(assetUrl)
      return
    }

    // Para tasks
    if (item.type === 'task') {
      // Tasks podem abrir modais ou seções específicas
      return
    }

    // Para outros tipos
    if (['custom-folder', 'asset-folder', 'overview'].includes(item.type)) {
      if (item.hasChildren) {
        toggleExpanded(item.id)
      }
      return
    }

    // Callback para casos especiais
    if (onItemSelect) {
      onItemSelect(item)
    }
  }

  // Função para voltar ao contexto anterior
  const goBack = () => {
    const { clientId, projectId, milestoneId } = detectedContextData

    switch (detectedContext) {
      case 'asset':
        if (milestoneId) {
          router.push(
            `/dashboard/client/${clientId}/project/${projectId}/milestone/${milestoneId}`
          )
        } else if (projectId) {
          router.push(`/dashboard/client/${clientId}/project/${projectId}`)
        } else {
          router.push(`/dashboard/client/${clientId}`)
        }
        break

      case 'milestone':
        if (projectId) {
          router.push(`/dashboard/client/${clientId}/project/${projectId}`)
        } else {
          router.push(`/dashboard/client/${clientId}`)
        }
        break

      case 'project':
        router.push(`/dashboard/client/${clientId}`)
        break

      default:
        router.push(`/dashboard/client/${clientId}`)
    }
  }

  // Ir para o dashboard
  const goHome = () => {
    router.push(`/dashboard/client/${detectedContextData.clientId}`)
  }

  // Header contextual
  const getContextTitle = () => {
    switch (detectedContext) {
      case 'project':
        return 'Project View'
      case 'milestone':
        return 'Milestone View'
      case 'asset':
        return 'Asset View'
      default:
        return 'Home'
    }
  }

  const getContextIcon = () => {
    switch (detectedContext) {
      case 'project':
        return <Folder className="w-4 h-4 text-orange-500" />
      case 'milestone':
        return <Target className="w-4 h-4 text-blue-500" />
      case 'asset':
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.647 10.3535C14.3551 11.0616 15.082 13.0928 15.3401 14.0337C15.4377 14.9281 15.4756 15.4738 14.93 15.436C14.0347 15.3396 13.0929 15.0813C12.0793 14.8033 11.0615 14.3548 10.3533 13.6466C9.6451 12.9385 9.19637 11.9207 8.9183 10.9073C8.65989 9.96522 8.56233 9.06958 8.52456 8.52412C9.07014 8.5618 9.96514 8.65977 10.9069 8.91796C11.9206 9.19589 12.9387 9.64508 13.647 10.3535Z"
              stroke="#222222"
            />
            <circle cx="12" cy="12" r="8.5" stroke="#222222" />
          </svg>
        )
    }
  }

  // Funções existentes (mantidas)
  const getAllExpandableIds = (items: any[]) => {
    let ids: string[] = []
    items.forEach((item) => {
      if (item.hasChildren && item.children && item.children.length > 0) {
        ids.push(item.id)
        ids = [...ids, ...getAllExpandableIds(item.children)]
      }
    })
    return ids
  }

  const toggleAllDropdowns = () => {
    const allExpandableIds = getAllExpandableIds(treeData)
    const areAllExpanded = allExpandableIds.every((id) => expandedItems.has(id))

    if (areAllExpanded) {
      setExpandedItems(new Set())
    } else {
      setExpandedItems(new Set(allExpandableIds))
    }
  }

  // Funções de ícones (mantidas)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'pending':
        return <Circle className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'image':
        return <Image className="w-3 h-3 text-purple-500" />
      case 'video':
        return <Video className="w-3 h-3 text-red-500" />
      case 'document':
        return <FileText className="w-3 h-3 text-blue-500" />
      default:
        return <FileText className="w-3 h-3 text-gray-500" />
    }
  }

  const getIcon = (item: any, level = 0) => {
    if (item.type === 'milestone') {
      return getStatusIcon(item.status)
    }

    if (item.type === 'task') {
      return getStatusIcon(item.status)
    }

    if (item.type === 'asset') {
      return getAssetIcon(item.assetType)
    }

    // Para dropdowns principais (level 0), não mostra ícone de pasta
    if (level === 0 && ['folder', 'project'].includes(item.type)) {
      return null
    }

    // Para itens dentro dos dropdowns (level > 0), mostra ícone de pasta
    const isExpanded = expandedItems.has(item.id)
    const hasChildren =
      item.hasChildren && item.children && item.children.length > 0

    return isExpanded && hasChildren ? (
      <FolderOpen className="w-4 h-4 text-gray-600" />
    ) : (
      <Folder className="w-4 h-4 text-gray-600" />
    )
  }

  const getBgColor = (item: any) => {
    if (item.type === 'custom-folder') {
      return 'bg-sky-100'
    }
    if (item.type === 'project' && item.name === 'A cool Branding Project') {
      return 'bg-stone-50'
    }
    return ''
  }

  const renderTreeItem = (item: any, level = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren =
      item.hasChildren && item.children && item.children.length > 0
    const paddingLeft = level * 16 + 8

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-50 cursor-pointer group ${getBgColor(
            item
          )}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            handleItemClick(item)
          }}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren && (
              <button
                onClick={(e) => {
                  toggleExpanded(item.id, e)
                }}
                className="hover:bg-gray-200 rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </button>
            )}
          </div>

          {/* Item Icon */}
          {getIcon(item, level) && (
            <div className="flex-shrink-0">{getIcon(item, level)}</div>
          )}

          {/* Item Name */}
          <span
            className={`text-xs flex-1 truncate ${
              item.type === 'asset' ? 'text-gray-600' : 'text-gray-700'
            }`}
          >
            {item.name}
          </span>

          {/* Actions for non-asset items */}
          {item.type !== 'asset' && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map((child: any) =>
              renderTreeItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className={`w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
        style={style}
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500">Loading tree data...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      style={style}
    >
      {/* Header Contextual */}
      <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-white">
        <div className="flex items-center gap-2 flex-1">
          {/* Back button (except on dashboard) */}
          {detectedContext !== 'dashboard' && (
            <button
              onClick={goBack}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Ícone contextual */}
          <div className="w-6 h-6 flex items-center justify-center">
            {getContextIcon()}
          </div>

          {/* Título contextual */}
          <span className="text-xs font-medium text-black truncate">
            {getContextTitle()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Botão Home */}
          <button
            onClick={goHome}
            className="p-1 hover:bg-gray-100 rounded flex items-center justify-center"
            title="Ir para Dashboard"
          >
            <Home className="w-4 h-4 text-gray-600" />
          </button>

          {/* Botão para expandir/colapsar todos */}
          <button
            onClick={toggleAllDropdowns}
            className="p-1 hover:bg-gray-100 rounded flex items-center justify-center"
            title="Expandir/Colapsar todos"
          >
            <div className="w-4 h-4 border border-gray-400 rounded flex items-center justify-center">
              <ChevronUp className="w-2.5 h-2.5 text-gray-600" />
            </div>
          </button>

          {/* Menu de três pontos */}
          <div className="w-2.5 py-2.5 flex flex-col items-start gap-1">
            <div className="w-0.5 h-0.5 bg-stone-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-stone-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-stone-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
        {treeData.map((item) => renderTreeItem(item))}
      </div>
    </div>
  )
}

// Mock data contextual (depois substituir por Supabase)
function getContextualMockData(context: NavigationContext, contextData: any) {
  switch (context) {
    case 'dashboard':
      return [
        {
          id: 'projects',
          name: 'Projects',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'cool-branding-project',
              name: 'A cool Branding Project',
              type: 'project',
              hasChildren: true,
              children: [
                {
                  id: 'milestone-1',
                  name: 'Milestone 1',
                  type: 'milestone',
                  status: 'completed',
                  hasChildren: false,
                },
                {
                  id: 'milestone-2',
                  name: 'Milestone 2',
                  type: 'milestone',
                  status: 'in-progress',
                  hasChildren: false,
                },
                {
                  id: 'milestone-3',
                  name: 'Milestone 3',
                  type: 'milestone',
                  status: 'pending',
                  hasChildren: false,
                },
              ],
            },
            {
              id: 'another-project',
              name: 'Another Project',
              type: 'project',
              hasChildren: false,
            },
          ],
        },
        {
          id: 'a-collection',
          name: 'A Collection',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'custom-folder-1',
              name: 'Brand Assets',
              type: 'custom-folder',
              hasChildren: false,
            },
          ],
        },
        {
          id: 'assets',
          name: 'Assets',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'all-assets',
              name: 'All Assets',
              type: 'asset-folder',
              hasChildren: false,
            },
          ],
        },
      ]

    case 'project':
      return [
        {
          id: 'project-overview',
          name: 'Project Overview',
          type: 'overview',
          hasChildren: false,
        },
        {
          id: 'milestones',
          name: 'Milestones',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'milestone-1',
              name: 'Concept Development',
              type: 'milestone',
              status: 'completed',
              hasChildren: true,
              children: [
                {
                  id: 'task-1',
                  name: 'Research',
                  type: 'task',
                  status: 'completed',
                },
                {
                  id: 'task-2',
                  name: 'Concepts',
                  type: 'task',
                  status: 'completed',
                },
                {
                  id: 'asset-1',
                  name: 'Brand_Guidelines.pdf',
                  type: 'asset',
                  assetType: 'document',
                },
              ],
            },
            {
              id: 'milestone-2',
              name: 'Visual Production',
              type: 'milestone',
              status: 'in-progress',
              hasChildren: true,
              children: [
                {
                  id: 'task-3',
                  name: 'Design',
                  type: 'task',
                  status: 'in-progress',
                },
                {
                  id: 'task-4',
                  name: 'Animation',
                  type: 'task',
                  status: 'pending',
                },
                {
                  id: 'asset-2',
                  name: 'Hero_Video.mp4',
                  type: 'asset',
                  assetType: 'video',
                },
              ],
            },
            {
              id: 'milestone-3',
              name: 'Final Delivery',
              type: 'milestone',
              status: 'pending',
              hasChildren: false,
            },
          ],
        },
        {
          id: 'project-assets',
          name: 'All Project Assets',
          type: 'folder',
          hasChildren: true,
          children: [
            { id: 'project-images', name: 'Images', type: 'asset-folder' },
            { id: 'project-videos', name: 'Videos', type: 'asset-folder' },
          ],
        },
      ]

    case 'milestone':
      return [
        {
          id: 'milestone-overview',
          name: 'Milestone Overview',
          type: 'overview',
          hasChildren: false,
        },
        {
          id: 'tasks',
          name: 'Tasks',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'task-1',
              name: 'Research Phase',
              type: 'task',
              status: 'completed',
            },
            {
              id: 'task-2',
              name: 'Design Phase',
              type: 'task',
              status: 'in-progress',
            },
            {
              id: 'task-3',
              name: 'Review Phase',
              type: 'task',
              status: 'pending',
            },
          ],
        },
        {
          id: 'milestone-assets',
          name: 'Assets',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'asset-1',
              name: 'Concept_01.jpg',
              type: 'asset',
              assetType: 'image',
            },
            {
              id: 'asset-2',
              name: 'Wireframe.pdf',
              type: 'asset',
              assetType: 'document',
            },
            {
              id: 'asset-3',
              name: 'Preview.mp4',
              type: 'asset',
              assetType: 'video',
            },
          ],
        },
      ]

    case 'asset':
      return [
        {
          id: 'asset-details',
          name: 'Asset Details',
          type: 'overview',
          hasChildren: false,
        },
        {
          id: 'related-assets',
          name: 'Related Assets',
          type: 'folder',
          hasChildren: true,
          children: [
            {
              id: 'asset-r1',
              name: 'Version_01.jpg',
              type: 'asset',
              assetType: 'image',
            },
            {
              id: 'asset-r2',
              name: 'Version_02.jpg',
              type: 'asset',
              assetType: 'image',
            },
            {
              id: 'asset-r3',
              name: 'Final.jpg',
              type: 'asset',
              assetType: 'image',
            },
          ],
        },
        {
          id: 'asset-history',
          name: 'Version History',
          type: 'folder',
          hasChildren: true,
          children: [
            { id: 'version-1', name: 'v1.0 - Initial', type: 'version' },
            { id: 'version-2', name: 'v1.1 - Reviewed', type: 'version' },
            { id: 'version-3', name: 'v2.0 - Final', type: 'version' },
          ],
        },
      ]

    default:
      return []
  }
}

export default SidebarTreeFolder
export type { SidebarTreeFolderProps }
