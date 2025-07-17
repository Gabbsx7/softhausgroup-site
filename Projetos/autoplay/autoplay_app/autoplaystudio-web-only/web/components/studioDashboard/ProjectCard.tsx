'use client'

import React from 'react'
import { MoreHorizontal, Plus, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'

import { useSupabase } from '../../hooks'
import { useState } from 'react'
import { formatDate, formatBudget } from '@/lib/utils'

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

interface ProjectCardProps {
  project_id: string
  title: string
  client: string
  category: string
  deadline: string
  budget: string
  status: string
  description?: string
  client_id?: string // Adicionar client_id opcional
}

export function ProjectCard({
  project_id,
  title,
  client,
  category,
  deadline,
  budget,
  status: initialStatus,
  description,
  client_id,
}: ProjectCardProps) {
  const router = useRouter()
  const params = useParams()
  const supabase = useSupabase()
  const [status, setStatus] = useState(initialStatus || 'draft')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const statusObj = STATUS_OPTIONS.find((s) => s.value === status) || {
    color: 'bg-black',
    text: 'text-black',
    label: status,
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    setDropdownOpen(false)
    setStatus(newStatus)
    // Atualiza no banco
    await supabase
      .from('projects')
      .update({ status_new: newStatus })
      .eq('id', project_id)
    setLoading(false)
  }

  const handleCardClick = () => {
    // Determinar o client_id: usar prop client_id ou params.clientId
    const targetClientId = client_id || params.clientId

    if (targetClientId) {
      // Navegar para a página do projeto
      router.push(`/dashboard/client/${targetClientId}/project/${project_id}`)
    } else {
      console.warn('No client_id available for navigation')
    }
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    // Impedir propagação do clique para não navegar
    e.stopPropagation()
    setDropdownOpen((v) => !v)
  }

  const handleStatusOptionClick = (e: React.MouseEvent, newStatus: string) => {
    // Impedir propagação do clique para não navegar
    e.stopPropagation()
    handleStatusChange(newStatus)
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 relative cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusObj.color}`}></div>
          <h4 className="text-base font-medium text-black">{title}</h4>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>
      {/* Client */}
      <div className="mb-2">
        <span className="text-xs font-medium text-black">{client}</span>
      </div>
      {/* Description */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 line-clamp-3">
          {description || '-'}
        </p>
      </div>
      {/* Details */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-400">Category</p>
          <p className="text-xs font-medium text-black">{category}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Deadline</p>
          <p className="text-xs font-medium text-black">
            {formatDate(deadline)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Budget</p>
          <p className="text-xs font-medium text-black">
            {formatBudget(budget)}
          </p>
        </div>
      </div>
      {/* Team and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 text-gray-600" />
          </div>
          <div className="flex -space-x-1">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="sm" />
            <Avatar name="Bob Johnson" size="sm" />
          </div>
        </div>
        <div className="relative">
          <button
            className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border ${statusObj.text} ${statusObj.color} bg-opacity-10 border-opacity-0 hover:border-gray-200 transition`}
            onClick={handleDropdownClick}
            disabled={loading}
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
                    opt.value === status ? 'font-bold' : ''
                  }`}
                  onClick={(e) => handleStatusOptionClick(e, opt.value)}
                  disabled={loading || opt.value === status}
                  type="button"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${opt.color}`}
                  ></span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
