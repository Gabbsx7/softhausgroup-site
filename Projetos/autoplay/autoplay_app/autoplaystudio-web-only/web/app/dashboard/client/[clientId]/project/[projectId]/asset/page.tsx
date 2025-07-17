'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Image,
  Video,
  Flag,
} from 'lucide-react'
import TopNav from '@/components/layout/TopNav'
import { useProjectDetails } from '@/hooks/use-project-data'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Função utilitária para formatar datas no padrão dd/MM/yyyy
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}
// Função utilitária para formatar orçamento no padrão $45,000
function formatBudget(budget: string | number | null | undefined) {
  if (!budget) return '-'
  return `$${Number(budget).toLocaleString('en-US')}`
}

// Mover para o topo do arquivo:
function getAssetType(asset: any) {
  if (!asset || typeof asset !== 'object') return 'document'
  if (asset.mime_type?.startsWith('image/') || asset.type === 'image')
    return 'image'
  if (asset.mime_type?.startsWith('video/') || asset.type === 'video')
    return 'video'
  return 'document'
}

// SidebarAsset refinado
function SidebarAsset({
  selectedAssetId,
  setSelectedAssetId,
  project,
  milestones,
  projectAssets,
}: {
  selectedAssetId: string
  setSelectedAssetId: (id: string) => void
  project: any
  milestones: any[]
  projectAssets: any[]
}) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { projectId } = params as any
  const milestoneId = searchParams.get('milestoneId')

  // Estado para controlar milestones expandidas
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(
    null
  )

  const supabase = createClientComponentClient()
  const [milestoneTasks, setMilestoneTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  useEffect(() => {
    if (!expandedMilestone) {
      setMilestoneTasks([])
      return
    }
    setLoadingTasks(true)
    supabase
      .from('milestone_tasks')
      .select('*')
      .eq('milestone_id', expandedMilestone)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        setMilestoneTasks(data || [])
        setLoadingTasks(false)
      })
  }, [expandedMilestone])

  // Filtrar assets conforme milestone selecionado (usando os dados passados como props)
  // NOTA: Filtro desabilitado temporariamente pois milestone_id não existe na tabela media atual
  const filteredAssets = projectAssets // Mostrar todos os assets por enquanto

  // Mock equipe (substituir por dados reais se necessário)
  const team = [
    { name: 'Jane', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { name: 'John', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    {
      name: 'Alice',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-[285px] ml-2 fixed left-0 top-16 h-[calc(100vh-64px)] z-30 bg-white rounded-xl shadow-lg py-4 px-4 gap-4 overflow-y-auto">
      {/* Header Figma ajustado */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => router.back()}
          className="p-1 rounded hover:bg-gray-100 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="font-semibold text-base text-gray-800">
            Asset View
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-gray-100 flex items-center justify-center"
            aria-label="Options"
          >
            {/* Ícone de cortina (expand/collapse) */}
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <rect x="3" y="7" width="14" height="2" rx="1" fill="#222" />
              <rect x="3" y="11" width="14" height="2" rx="1" fill="#222" />
            </svg>
          </button>
        </div>
      </div>
      {/* Client Info Figma */}
      {project && (
        <div className="bg-[#FFF9D7] rounded-xl px-4 py-3 mb-2 flex flex-col gap-2">
          {/* Header do projeto: ícone de pasta + nome */}
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-5 h-5">
              {/* Ícone de pasta Figma */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.375 5.77476C3.375 4.93468 3.375 4.51464 3.53849 4.19377C3.6823 3.91153 3.91177 3.68206 4.19401 3.53825C4.51488 3.37476 4.93492 3.37476 5.775 3.37476H6.84737C7.22308 3.37476 7.41094 3.37476 7.58146 3.42654C7.73241 3.47239 7.87285 3.54755 7.99472 3.64773C8.13239 3.76089 8.23659 3.91721 8.44497 4.22983L8.80503 4.76998C9.01341 5.08261 9.11761 5.23892 9.25528 5.35208C9.37715 5.45226 9.51759 5.52742 9.66854 5.57327C9.83906 5.62506 10.0269 5.62506 10.4026 5.62506H12.225C13.0651 5.62506 13.4851 5.62506 13.806 5.78855C14.0882 5.93236 14.3177 6.16183 14.4615 6.44407C14.625 6.76494 14.625 7.18498 14.625 8.02506V11.4751C14.625 12.3151 14.625 12.7352 14.4615 13.056C14.3177 13.3383 14.0882 13.5678 13.806 13.7116C13.4851 13.8751 13.0651 13.8751 12.225 13.8751H5.775C4.93492 13.8751 4.51488 13.8751 4.19401 13.7116C3.91177 13.5678 3.6823 13.3383 3.53849 13.056C3.375 12.7352 3.375 12.3151 3.375 11.4751V5.77476Z"
                  stroke="#222222"
                />
              </svg>
            </span>
            <span
              className="font-semibold text-base text-gray-900 truncate"
              title={project.name}
            >
              {project.name}
            </span>
          </div>
          {/* Descrição do projeto */}
          <div className="text-[11px] text-gray-500 mb-1 truncate">
            {project.description}
          </div>
          {/* Detalhes: categoria, deadline, budget */}
          <div className="flex gap-2 mt-2">
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] text-gray-500 font-medium">
                Category
              </span>
              <span className="block text-[11px] text-gray-900 truncate">
                {project.category}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] text-gray-500 font-medium">
                Deadline
              </span>
              <span className="block text-[11px] text-gray-900 truncate">
                {project.deadline ? formatDate(project.deadline) : '-'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] text-gray-500 font-medium">
                Budget
              </span>
              <span className="block text-[11px] text-gray-900 truncate">
                {formatBudget(project.budget)}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Avatares da equipe */}
      <div className="flex items-center gap-1 mb-2 px-1">
        <span className="text-[13px] text-gray-400 mr-1">👥</span>
        <div className="flex -space-x-2">
          {team.map((member, i) => (
            <img
              key={i}
              src={member.avatar}
              alt={member.name}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
          ))}
          <button className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-white bg-gray-100 hover:bg-gray-200 ml-1">
            {/* Ícone de mais */}
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <path
                d="M10 5v10M5 10h10"
                stroke="#6497B7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Menu Assets */}
      <div className="mt-2">
        <div className="font-semibold text-xs text-gray-500 mb-1 px-1">
          Assets ({filteredAssets.length})
        </div>
        <ul className="flex flex-col gap-1">
          {filteredAssets.length === 0 && (
            <li className="text-xs text-gray-400 px-2 py-1">
              No assets found in this project.
            </li>
          )}
          {filteredAssets.map((asset) => (
            <li key={asset.id}>
              <button
                onClick={() => setSelectedAssetId(asset.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition text-left ${
                  selectedAssetId === asset.id
                    ? 'bg-violet-50'
                    : 'hover:bg-[#F3F4F6]'
                }`}
              >
                {/* Ícone do tipo de asset */}
                {getAssetType(asset) === 'image' ? (
                  <Image className="w-4 h-4 text-blue-400" />
                ) : getAssetType(asset) === 'video' ? (
                  <Video className="w-4 h-4 text-pink-400" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-900 truncate max-w-[120px]">
                  {asset?.name ?? ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Milestone List */}
      <div className="mt-4">
        <div className="font-semibold text-xs text-gray-500 mb-1 px-1">
          Milestones ({milestones.length})
        </div>
        <ul className="flex flex-col gap-2">
          {milestones.map((ms) => {
            const isExpanded = expandedMilestone === ms.id
            const isSelected = false // Desabilitado temporariamente
            return (
              <li key={ms.id} className="bg-[#F8F9FA] rounded-xl px-2 py-2">
                <button
                  className="flex items-center w-full gap-2 text-left"
                  onClick={() => {
                    setExpandedMilestone(isExpanded ? null : ms.id)
                    // Filtro por milestone desabilitado temporariamente
                    // setSelectedMilestoneId(isSelected ? null : ms.id)
                  }}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    {/* Ícone de flag preta */}
                    <Flag className="w-3 h-3 text-black" />
                  </span>
                  <span className="font-medium text-xs text-gray-900 truncate flex-1">
                    {ms.title}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {ms.status
                      ? ms.status.charAt(0).toUpperCase() + ms.status.slice(1)
                      : ''}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-2 bg-white rounded-lg p-2 shadow-inner">
                    <div className="text-[11px] text-gray-500 mb-1">
                      {ms.description}
                    </div>
                    {/* Tasks reais do milestone */}
                    <div className="font-semibold text-[11px] text-gray-700 mb-1">
                      Tasks
                    </div>
                    <ul className="flex flex-col gap-1">
                      {loadingTasks ? (
                        <li className="text-xs text-gray-400">Loading...</li>
                      ) : milestoneTasks.length > 0 ? (
                        milestoneTasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50"
                          >
                            {task.status === 'completed' ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 15L16 9L14 7L10 11L8 9L4 13L2 11L10 3L18 11L14 13L10 15Z"
                                  fill="#22C55E"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 15L16 9L14 7L10 11L8 9L4 13L2 11L10 3L18 11L14 13L10 15Z"
                                  fill="#F59E0B"
                                />
                              </svg>
                            )}
                            <span className="text-xs text-gray-800 truncate">
                              {task.name}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-gray-400">
                          No tasks found.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

// Preview refinado
function AssetPreviewFigmaFixed({ asset }: { asset: any }) {
  if (!asset) return null

  // Calcular aspect ratio do asset
  let aspectRatio = 16 / 9 // default
  if (asset?.width && asset?.height && asset.width > 0 && asset.height > 0) {
    aspectRatio = asset.width / asset.height
  }

  // Determinar se é portrait (vertical) ou landscape (horizontal)
  const isPortrait = aspectRatio < 1

  // Base size ajustado para portrait vs landscape
  const baseSize = isPortrait ? 320 : 400
  let previewW = isPortrait ? Math.round(baseSize * aspectRatio) : baseSize
  let previewH = isPortrait ? baseSize : Math.round(baseSize / aspectRatio)

  // Limites ajustados para portrait e landscape
  const MAX_W = isPortrait ? 400 : 520
  const MAX_H = isPortrait ? 600 : 380
  const MIN_W = isPortrait ? 200 : 280
  const MIN_H = isPortrait ? 280 : 200

  if (previewW > MAX_W) {
    previewW = MAX_W
    previewH = Math.round(previewW / aspectRatio)
  }
  if (previewH > MAX_H) {
    previewH = MAX_H
    previewW = Math.round(previewH * aspectRatio)
  }
  if (previewW < MIN_W) {
    previewW = MIN_W
    previewH = Math.round(previewW / aspectRatio)
  }
  if (previewH < MIN_H) {
    previewH = MIN_H
    previewW = Math.round(previewH * aspectRatio)
  }

  return (
    <div className="hidden lg:flex fixed left-[305px] right-[360px] top-16 bottom-32 z-20 justify-center items-center pointer-events-none">
      <div
        className="pointer-events-auto flex items-center justify-center"
        style={{ width: previewW, height: previewH }}
      >
        {getAssetType(asset) === 'image' ? (
          <img
            src={asset.url}
            alt={asset?.name ?? ''}
            className="object-contain rounded-xl shadow-xl border border-[#E6E6E6] bg-transparent transition-all duration-300"
            style={{ width: previewW, height: previewH }}
          />
        ) : getAssetType(asset) === 'video' ? (
          <video
            src={asset.url}
            controls
            className="object-contain rounded-xl shadow-xl border border-[#E6E6E6] bg-transparent transition-all duration-300"
            style={{ width: previewW, height: previewH }}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-xl shadow-xl border border-[#E6E6E6] bg-gray-50"
            style={{ width: previewW, height: previewH }}
          >
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <rect width="48" height="48" rx="12" fill="#E6E6E6" />
              <path
                d="M14 22h20M14 26h20"
                stroke="#6497B7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-gray-500 text-lg font-medium mt-3">
              Document Preview
            </span>
            <span className="text-gray-400 text-sm mt-1 text-center px-4">
              {asset?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// AssetSelection refinado
function AssetSelectionFigmaFixed({
  assets,
  selectedId,
  onSelect,
}: {
  assets: any[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="hidden lg:flex fixed left-[305px] right-[360px] bottom-8 z-20 justify-center">
      <div className="flex gap-3 justify-center bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/20">
        {assets.map((asset) => {
          const isSelected = selectedId === asset.id
          // Tamanho do card: imagens maiores, vídeos/docs menores
          const isImage = getAssetType(asset) === 'image'
          const cardW = isImage ? 'w-[64px]' : 'w-[40px]'
          const cardH = isImage ? 'h-[40px]' : 'h-[40px]'
          return (
            <button
              key={asset.id}
              onClick={() => onSelect(asset.id)}
              className={`relative flex items-center justify-center bg-white rounded-lg shadow-sm border transition-all duration-200 ${cardW} ${cardH} ${
                isSelected
                  ? 'border-violet-500 ring-2 ring-violet-300 scale-110'
                  : 'border-gray-200 hover:border-gray-300'
              } group`}
            >
              {/* Miniatura centralizada */}
              {isImage ? (
                <img
                  src={asset.url}
                  alt={asset?.name ?? ''}
                  className="object-cover rounded-md w-full h-full"
                />
              ) : getAssetType(asset) === 'video' ? (
                <div className="flex items-center justify-center w-full h-full bg-pink-100 rounded-md">
                  <Video className="w-5 h-5 text-pink-500" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
              )}
              {/* Ícone de tipo sobreposto apenas se selecionado */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 bg-violet-500 rounded-full p-1 shadow-md">
                  {isImage ? (
                    <Image className="w-3 h-3 text-white" />
                  ) : getAssetType(asset) === 'video' ? (
                    <Video className="w-3 h-3 text-white" />
                  ) : (
                    <FileText className="w-3 h-3 text-white" />
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Rightbar({ asset }: { asset: any }) {
  if (!asset) return null
  return (
    <aside className="hidden lg:flex w-[240px] min-w-[200px] max-w-[260px] bg-white rounded-2xl border border-gray-200 py-6 px-4 flex-col gap-4 shadow-sm fixed right-0 top-16 h-[calc(100vh-64px)] overflow-y-auto z-30 mr-2">
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          Asset Details
        </h2>
        <div className="space-y-1">
          <div>
            <span className="text-xs text-gray-500 font-semibold">Name</span>
            <div className="text-sm font-semibold text-gray-900">
              {asset?.name}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold">Type</span>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {getAssetType(asset)}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold">Size</span>
            <div className="text-sm font-semibold text-gray-900">
              {asset.size}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold">Created</span>
            <div className="text-sm font-semibold text-gray-900">
              {asset.uploadedAt}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold">Project</span>
            <div className="text-sm font-semibold text-gray-900">
              {asset.projectName || '-'}
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold">
              Milestone
            </span>
            <div className="text-sm font-semibold text-gray-900">
              {asset.milestoneName || '-'}
            </div>
          </div>
        </div>
        <button className="w-full mt-4 py-2 rounded bg-[#2563eb] text-white font-semibold flex items-center justify-center gap-2 text-sm hover:bg-[#1d4ed8] transition">
          <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
            <path
              d="M5 10h10M10 5v10"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
          </svg>
          Download
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
        <p className="text-xs text-gray-700 leading-relaxed">
          {asset.description ?? ''}
        </p>
      </div>
    </aside>
  )
}

export default function ProjectAssetsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { projectId } = params as any
  const milestoneId = searchParams.get('milestoneId')

  // Estados principais
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    milestoneId
  )
  const [viewAssetOpen, setViewAssetOpen] = useState(false)

  // Buscar dados reais do Supabase (usando apenas useProjectDetails que tem estrutura completa)
  const {
    project,
    milestones,
    assets: projectAssets,
    loading,
    error,
  } = useProjectDetails(projectId)

  // Debug - verificar os dados carregados
  console.log(
    'DEBUG - ProjectAssetsPage:',
    'Project:',
    project?.name,
    'Milestones:',
    milestones.length,
    'Assets:',
    projectAssets.length
  )

  // Filtrar assets baseado no milestone selecionado
  // NOTA: Filtro por milestone desabilitado temporariamente pois milestone_id não existe na tabela media atual
  const filteredAssets = projectAssets // Mostrar todos os assets por enquanto

  // Asset selecionado
  const selectedAsset =
    projectAssets.find((a) => a.id === selectedAssetId) || filteredAssets[0]

  // Debug - verificar filtros
  console.log(
    'DEBUG - Filtros:',
    'Total:',
    projectAssets.length,
    'Filtered:',
    filteredAssets.length,
    'Selected:',
    selectedAsset?.name
  )

  // Efeito para auto-selecionar primeiro asset quando dados carregam ou filtro muda
  useEffect(() => {
    if (filteredAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(filteredAssets[0].id)
    } else if (
      filteredAssets.length > 0 &&
      !filteredAssets.find((a) => a.id === selectedAssetId)
    ) {
      // Se o asset selecionado não está no filtro atual, selecionar o primeiro do filtro
      setSelectedAssetId(filteredAssets[0].id)
    } else if (filteredAssets.length === 0) {
      setSelectedAssetId('')
    }
  }, [filteredAssets, selectedAssetId])

  // Efeito para inicializar quando os assets carregam pela primeira vez
  useEffect(() => {
    if (projectAssets.length > 0 && !selectedAssetId) {
      const initialAsset = selectedMilestoneId
        ? projectAssets.find((a) => a.milestoneId === selectedMilestoneId) ||
          projectAssets[0]
        : projectAssets[0]
      setSelectedAssetId(initialAsset.id)
    }
  }, [projectAssets, selectedAssetId, selectedMilestoneId])

  const handleAssetClick = (asset: any) => {
    setSelectedAssetId(asset.id)
    setViewAssetOpen(true)
  }

  const handleCloseViewAsset = () => {
    setViewAssetOpen(false)
    setSelectedAssetId(projectAssets[0]?.id || '') // Reset to first asset
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-purple-500" />
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  // Mostrar loading enquanto carrega
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    )
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading project: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <TopNav />
      <div className="flex pt-14">
        {/* Sidebar refinado */}
        <SidebarAsset
          selectedAssetId={selectedAssetId}
          setSelectedAssetId={setSelectedAssetId}
          project={project}
          milestones={milestones}
          projectAssets={projectAssets}
        />
        {/* Preview + Selection + Info refinados */}
        <main className="min-h-screen px-4 py-8 lg:px-12 lg:py-12 lg:ml-[265px] lg:mr-[340px] flex flex-col items-center">
          {/* Asset Preview e Selection fixos */}
          <AssetPreviewFigmaFixed asset={selectedAsset} />
          <AssetSelectionFigmaFixed
            assets={filteredAssets}
            selectedId={selectedAssetId}
            onSelect={setSelectedAssetId}
          />
          {/* Asset Info Panel (detalhes do asset) */}
          <div className="w-full max-w-2xl mt-[560px]">
            <Rightbar asset={selectedAsset} />
          </div>
        </main>
        <Rightbar asset={selectedAsset} />
      </div>
      {/* Modal de preview do asset */}
      {/* ViewAsset component was removed from imports, so this modal is no longer available */}
    </div>
  )
}
