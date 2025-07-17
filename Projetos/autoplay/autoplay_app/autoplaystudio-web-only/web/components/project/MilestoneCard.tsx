import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle, Clock, Circle, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
  progress?: number
  due_date?: string
}

interface MilestoneCardProps {
  milestone: Milestone
  onClick?: () => void
  className?: string
}

export function MilestoneCard({
  milestone,
  onClick,
  className,
}: MilestoneCardProps) {
  const [tasksCount, setTasksCount] = useState<number>(0)
  const [assetsCount, setAssetsCount] = useState<number>(0)

  useEffect(() => {
    async function fetchCounts() {
      // Fetch tasks
      const { count: tasks } = await supabase
        .from('milestone_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('milestone_id', milestone.id)
      setTasksCount(tasks || 0)

      // Fetch assets
      const { count: assets } = await supabase
        .from('media')
        .select('id', { count: 'exact', head: true })
        .eq('milestone_id', milestone.id)
      setAssetsCount(assets || 0)
    }
    fetchCounts()
  }, [milestone.id])

  const getStatusIcon = () => {
    switch (milestone.status) {
      case 'completed':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="7.5" stroke="#64C039" />
            <path d="M6.66683 10L9.16683 12.5L13.3335 7.5" stroke="#64C039" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg
            width="19"
            height="18"
            viewBox="0 0 19 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.12348 3.87347C2.93743 5.05952 2.19932 6.62012 2.03491 8.28937C1.8705 9.95862 2.28997 11.6332 3.22184 13.0279C4.15372 14.4225 5.54033 15.4509 7.14543 15.9378C8.75054 16.4247 10.4748 16.34 12.0245 15.6981C13.5741 15.0562 14.8532 13.8969 15.6439 12.4176C16.4346 10.9384 16.6879 9.23069 16.3607 7.5856C16.0335 5.9405 15.1459 4.45976 13.8494 3.39567C12.5528 2.33159 10.9273 1.75 9.25 1.75"
              stroke="#7CCDF5"
              strokeLinecap="round"
            />
            <path d="M9.25 9L5.5 5.25" stroke="#7CCDF5" strokeLinecap="round" />
            <path d="M9.25 1.875V3.75" stroke="#7CCDF5" strokeLinecap="round" />
            <path d="M16 9L14.5 9" stroke="#7CCDF5" strokeLinecap="round" />
            <path
              d="M9.25 14.25V15.75"
              stroke="#7CCDF5"
              strokeLinecap="round"
            />
            <path d="M4 9L2.5 9" stroke="#7CCDF5" strokeLinecap="round" />
          </svg>
        )
      default:
        return (
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10.5" cy="10" r="7.5" stroke="#E0E0E0" />
          </svg>
        )
    }
  }

  // Layout e estilos conforme Figma
  const getCardBg = () => {
    switch (milestone.status) {
      case 'completed':
        return 'border-[#64C039]'
      case 'in_progress':
        return 'border-[#7CCDF5]'
      default:
        return 'border-[#E0E0E0]'
    }
  }

  const getStatusText = () => {
    switch (milestone.status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In progress'
      default:
        return 'Pending'
    }
  }

  const getStatusTextColor = () => {
    switch (milestone.status) {
      case 'completed':
        return 'text-[#848484]'
      case 'in_progress':
        return 'text-[#848484]'
      default:
        return 'text-[#848484]'
    }
  }

  const getTasksTextColor = () => {
    switch (milestone.status) {
      case 'completed':
        return 'text-[#B1B1B1]'
      case 'in_progress':
        return 'text-[#B1B1B1]'
      default:
        return 'text-[#B1B1B1]'
    }
  }

  const getAssetsTextColor = () => {
    switch (milestone.status) {
      case 'completed':
        return 'text-[#CACACA]'
      case 'in_progress':
        return 'text-[#CACACA]'
      default:
        return 'text-[#CACACA]'
    }
  }

  return (
    <div
      className={`bg-[#FFFCEE] rounded-[12px] border ${getCardBg()} p-2 flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow ${
        className || ''
      }`}
      onClick={onClick}
      style={{ minWidth: 0, minHeight: 0, height: 'auto', maxHeight: 100 }}
    >
      {/* Header: ícone + status + menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-[8px] font-medium text-[#848484] opacity-50 leading-[1.21]">
            {getStatusText()}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 cursor-pointer">
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
        </div>
      </div>
      {/* Título */}
      <div className="flex-1 flex items-center min-h-[16px]">
        <h3 className="text-[12px] font-medium text-black leading-[1.21] truncate">
          {milestone.title}
        </h3>
      </div>
      {/* Linha de stats */}
      <div className="flex items-center gap-3 opacity-50 mt-1">
        <span className="text-[8px] font-medium text-[#B1B1B1] leading-[1.21]">
          {tasksCount} Tasks
        </span>
        <span className="text-[8px] font-medium text-[#CACACA] leading-[1.21]">
          {assetsCount} Assets
        </span>
      </div>
    </div>
  )
}
