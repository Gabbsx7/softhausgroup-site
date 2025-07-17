import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronDown,
  Folder,
  Plus,
  CheckCircle,
  Clock,
  Circle,
  Palette,
} from 'lucide-react'
import { useProjectDetails } from '../../hooks/use-project-data'
import { supabase } from '@/lib/supabase/client'

interface ProjectSidebarProps {
  onOpenViewAsset: (asset: any) => void
}

export function ProjectSidebar({ onOpenViewAsset }: ProjectSidebarProps) {
  const params = useParams()
  const projectId = params?.projectId as string
  const clientId = params?.clientId as string
  const router = useRouter()
  const [assetsExpanded, setAssetsExpanded] = useState(true)
  const { project, milestones, assets, loading } = useProjectDetails(projectId)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null
  )

  const STATUS_OPTIONS = [
    {
      value: 'draft',
      label: 'Draft',
      color: 'bg-gray-400',
      text: 'text-gray-700',
    },
    {
      value: 'planning',
      label: 'Planning',
      color: 'bg-blue-300',
      text: 'text-blue-800',
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      color: 'bg-blue-500',
      text: 'text-blue-700',
    },
    {
      value: 'review',
      label: 'Review',
      color: 'bg-yellow-400',
      text: 'text-yellow-800',
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'bg-green-500',
      text: 'text-green-700',
    },
    {
      value: 'on_hold',
      label: 'On Hold',
      color: 'bg-orange-400',
      text: 'text-orange-800',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      color: 'bg-red-500',
      text: 'text-red-700',
    },
  ]
  const [statusNew, setStatusNew] = useState(project?.status_new || 'draft')
  const [statusLoading, setStatusLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (project?.status_new) setStatusNew(project.status_new)
  }, [project?.status_new])

  const statusObj =
    STATUS_OPTIONS.find((s) => s.value === statusNew) || STATUS_OPTIONS[0]

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true)
    setDropdownOpen(false)
    setStatusNew(newStatus)
    await supabase
      .from('projects')
      .update({ status_new: newStatus })
      .eq('id', projectId)
    setStatusLoading(false)
  }

  // Função para navegar para milestone
  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId)
    router.push(
      `/dashboard/client/${clientId}/project/${projectId}/milestone/${milestoneId}`
    )
  }

  // Função para pegar ícone do tipo de asset
  function getAssetIcon(type: string) {
    // Sempre retorna o SVG customizado fornecido
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.45831 5.45831C1.45831 3.24917 3.24917 1.45831 5.45831 1.45831H8.54165C10.7508 1.45831 12.5416 3.24917 12.5416 5.45831V8.54165C12.5416 10.7508 10.7508 12.5416 8.54165 12.5416H5.45831C3.24917 12.5416 1.45831 10.7508 1.45831 8.54165V5.45831Z"
          stroke="#CC00FF"
        />
        <path
          d="M1.45831 8.45828L2.68048 7.23614C3.56281 6.35384 5.02877 6.48602 5.73904 7.51193L5.76642 7.55146C6.4311 8.51153 7.77347 8.70037 8.67724 7.96095L8.80747 7.85439C9.60272 7.20376 10.7616 7.26156 11.4881 7.98811L12.5416 9.04162"
          stroke="#CC00FF"
        />
        <circle cx="9.625" cy="4.375" r="0.875" fill="#CC00FF" />
      </svg>
    )
  }

  // Função para pegar ícone e cor do status do milestone
  function getMilestoneIcon(status: string) {
    if (status === 'completed')
      return <CheckCircle className="w-[18px] h-[18px] text-[#64C039]" />
    if (status === 'in_progress')
      return <Clock className="w-[18px] h-[18px] text-[#7CCDF5]" />
    return <Circle className="w-[18px] h-[18px] text-[#E0E0E0]" />
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <aside className="w-[265px] bg-white border-r border-[#E3E3E3] flex flex-col h-[calc(100vh-56px)] sticky top-[15px] z-20">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[265px] bg-white border-r border-[#E3E3E3] flex flex-col h-[calc(100vh-56px)] sticky top-[15px] z-20">
      {/* Navigator Header */}
      <div className="flex items-center h-[45px] border-b border-[#E3E3E3] flex-shrink-0">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center w-[45px] h-[45px] border-r border-[#ECECEC] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-[22px] h-[22px] text-[#222222]" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[12px] font-medium text-black opacity-25">
            Projects
          </span>
        </div>
        <div className="flex items-center gap-2 px-[10px]">
          <button className="opacity-20 hover:opacity-40 transition-opacity">
            <ChevronDown className="w-[15px] h-[14px] text-[#222222]" />
          </button>
          <button className="flex flex-col gap-[3px] hover:opacity-60 transition-opacity">
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
            <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Navigator Content com scroll interno */}
      <div className="flex flex-col gap-[10px] p-[10px] flex-1 overflow-y-auto">
        {/* Project Card */}
        <div className="bg-[#FDFBF3] rounded-[8px] p-[4px]">
          <div className="bg-[#E6EFFF] rounded-[8px] flex items-center w-full h-[34px]">
            <div className="flex items-center justify-center w-[34px] h-full">
              <Folder className="w-[18px] h-[18px] text-[#222222]" />
            </div>
            <div className="flex items-center justify-center flex-1 h-full">
              <span className="text-[12px] font-medium text-black">
                {project?.name}
              </span>
            </div>
          </div>

          {/* Project Details */}
          <div className="w-full px-[6px] py-[4px]">
            <div className="flex flex-col gap-[5px] px-[5px]">
              <p className="text-[10px] font-normal text-[#898989] leading-[1.21]">
                {project?.description}
              </p>

              {/* Details Row */}
              <div className="flex gap-[10px] pb-[5px]">
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Category
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {project?.category}
                  </span>
                </div>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Deadline
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {project?.deadline
                      ? new Date(project.deadline).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-[2px] flex-1">
                  <span className="text-[8px] font-normal text-[#E3E3E3]">
                    Budget
                  </span>
                  <span className="text-[10px] font-medium text-black">
                    {project?.budget
                      ? `$${Number(project.budget).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Team and Status */}
            <div className="flex items-center px-[5px]">
              <div className="flex items-center gap-[4px]">
                <button className="w-[25px] h-[25px] flex items-center justify-center bg-[#F4F4F4] rounded-full border border-[#DAE2E8] hover:bg-gray-200 transition-colors">
                  <Plus className="w-[12px] h-[12px] text-[#222222]" />
                </button>
              </div>
              <div className="flex-1"></div>
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border ${statusObj.text} ${statusObj.color} bg-opacity-10 border-opacity-0 hover:border-gray-200 transition`}
                  onClick={() => setDropdownOpen((v) => !v)}
                  disabled={statusLoading}
                  type="button"
                >
                  {statusObj.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow z-10">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-gray-100 ${
                          opt.value === statusNew ? 'font-bold' : ''
                        } ${opt.text}`}
                        style={{
                          backgroundColor:
                            opt.value === statusNew ? '#f3f4f6' : 'transparent',
                        }}
                        onClick={() => handleStatusChange(opt.value)}
                        disabled={statusLoading}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${opt.color}`}
                        ></span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Design Room Button */}
            <div className="px-[5px] pt-[8px]">
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/client/${clientId}/project/${projectId}/design-room-ui`
                  )
                }
                className="w-full flex items-center gap-[8px] px-[12px] py-[8px] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-[6px] hover:from-purple-600 hover:to-blue-600 transition-all text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Palette className="w-[14px] h-[14px]" />
                <span>Design Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="flex flex-col">
          <button
            onClick={() => setAssetsExpanded(!assetsExpanded)}
            className="flex items-center gap-[8px] px-[5px] py-[8px] hover:bg-gray-50 transition-colors rounded-[4px]"
          >
            <ChevronDown
              className={`w-[14px] h-[14px] text-[#222222] transition-transform ${
                assetsExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <span className="text-[12px] font-medium text-black flex-1 text-left">
              Assets
            </span>
          </button>
          {assetsExpanded && (
            <div className="flex flex-col gap-[4px] px-[5px]">
              {/* Lista de assets reais */}
              {assets && assets.length > 0 ? (
                assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center rounded-[8px] h-[34px] hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOpenViewAsset(asset)}
                  >
                    <div className="flex items-center justify-center w-[34px] h-full">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="flex items-center justify-center flex-1 h-full">
                      <span className="text-[12px] font-medium text-black truncate max-w-[140px]">
                        {asset.name}
                      </span>
                    </div>
                    {/* Status bolinha */}
                    <div className="flex items-center justify-center w-[24px] h-full">
                      {asset.status === 'approved' && (
                        <CheckCircle className="w-4 h-4 text-[#64C039]" />
                      )}
                      {asset.status === 'pending' && (
                        <Clock className="w-4 h-4 text-[#7CCDF5]" />
                      )}
                      {asset.status === 'rejected' && (
                        <Circle className="w-4 h-4 text-[#E0E0E0]" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 px-2">Nenhum asset</span>
              )}
            </div>
          )}
        </div>
        {/* Milestones sempre visíveis abaixo do bloco de assets */}
        <div className="flex flex-col gap-[4px] px-[5px] mt-2">
          {milestones && milestones.length > 0 ? (
            milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-center rounded-[8px] h-[34px] hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedMilestoneId === milestone.id
                    ? 'bg-[#FFF9D7]'
                    : 'bg-[#F5F5F5]'
                }`}
                onClick={() => handleMilestoneClick(milestone.id)}
                style={{
                  backgroundColor:
                    selectedMilestoneId === milestone.id
                      ? '#FFF9D7'
                      : '#F5F5F5',
                }}
              >
                <div className="flex items-center justify-center w-[34px] h-full">
                  {getMilestoneIcon(milestone.status)}
                </div>
                <div className="flex items-center justify-center flex-1 h-full">
                  <span className="text-[12px] font-medium text-black">
                    {milestone.title}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 px-2">Nenhum milestone</span>
          )}
        </div>
      </div>
    </aside>
  )
}
