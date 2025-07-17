import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, Circle, MoreHorizontal } from 'lucide-react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="bg-gray-100 min-h-[60px] rounded animate-pulse" />
})

interface Task {
  id: string
  name: string
  description?: string
  status: 'todo' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  due_date?: string
  created_at: string
  milestone_id: string
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: string) => void
  onDescriptionChange?: (taskId: string, description: string) => void
  members?: { id: string; name: string }[]
}

export default function TaskCard({
  task,
  onStatusChange,
  onDescriptionChange,
  members = [],
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [description, setDescription] = useState(task.description || '')

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-[24px] h-[24px] text-[#7FD767]" />
      case 'in_progress':
        return <Clock className="w-[24px] h-[24px] text-[#C8C8C8]" />
      case 'pending':
        return <Circle className="w-[24px] h-[24px] text-yellow-400" />
      case 'todo':
        return <Circle className="w-[24px] h-[24px] text-[#C8C8C8]" />
      case 'cancelled':
        return <Circle className="w-[24px] h-[24px] text-red-400" />
      default:
        return <Circle className="w-[24px] h-[24px] text-[#C8C8C8]" />
    }
  }

  const handleDescriptionSave = () => {
    if (onDescriptionChange) {
      onDescriptionChange(task.id, description)
    }
    setEditingDescription(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleDescriptionSave()
    }
    if (e.key === 'Escape') {
      setDescription(task.description || '')
      setEditingDescription(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-[#FEFDF7] rounded-[6px] flex flex-col">
      {/* Header sempre visível */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Status Icon */}
        <div className="flex items-center justify-center w-[45px] h-full">
          {getStatusIcon()}
        </div>

        {/* Task Name */}
        <div className="flex-1 flex items-center justify-center px-[10px] py-[15px]">
          <span className="text-[11px] font-medium text-black leading-[1.21]">
            {task.name}
          </span>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col items-center justify-center gap-[3px] px-[8px] py-[8px]">
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
          <div className="w-[2px] h-[2px] bg-[#676767] rounded-full"></div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-[10px] pb-[15px]">
          <div className="flex flex-col gap-[10px] px-[5px]">
            {/* Description */}
            <div className="flex flex-col gap-[5px]">
              {editingDescription ? (
                <div>
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    onBlur={handleDescriptionSave}
                    className="bg-white min-h-[60px] rounded border border-dashed border-gray-300 text-[10px]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean'],
                      ],
                    }}
                  />
                </div>
              ) : (
                <div
                  className="min-h-[24px] cursor-text"
                  onClick={() => setEditingDescription(true)}
                >
                  {description ? (
                    <div
                      className="text-[10px] font-normal text-[#606060] leading-[1.4] whitespace-pre-wrap"
                      style={{
                        paddingLeft: 0,
                      }}
                      // Adiciona estilos para listas
                      // Tailwind não estiliza HTML dinâmico, então usamos style e um bloco <style> inline
                    >
                      <style>{`
                        .task-desc-list ol { list-style-type: decimal; margin-left: 1.25rem; padding-left: 1.25rem; }
                        .task-desc-list ul { list-style-type: disc; margin-left: 1.25rem; padding-left: 1.25rem; }
                        .task-desc-list li { margin-bottom: 0.25rem; }
                      `}</style>
                      <div
                        className="task-desc-list"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] font-normal text-[#A9A9A9] leading-[1.4] italic">
                      Click to add description...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Due Date and Assigned To */}
            <div className="flex justify-between items-center pt-[5px]">
              <span className="text-[10px] font-medium text-[#A9A9A9]">
                Due {formatDate(task.due_date)}
              </span>
              <span className="text-[10px] font-medium text-[#76BC77] text-right">
                Assigned to{' '}
                {members.find((m) => m.id === task.assigned_to)?.name ||
                  'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
