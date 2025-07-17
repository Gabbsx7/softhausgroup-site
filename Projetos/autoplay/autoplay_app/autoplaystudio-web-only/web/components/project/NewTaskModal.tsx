import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Member {
  id: string
  name: string
  avatarUrl?: string
}

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  milestoneId: string
  projectId: string
}

export default function NewTaskModal({
  open,
  onClose,
  onSuccess,
  milestoneId,
  projectId,
}: NewTaskModalProps) {
  const supabase = createClientComponentClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (open && projectId) {
      fetchMembers()
    }
    if (!open) {
      setName('')
      setDescription('')
      setAssignedTo('')
      setDueDate('')
      setError('')
    }
  }, [open, projectId])

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('project_members')
      .select('user_id, users(name, avatar_url)')
      .eq('project_id', projectId)
    if (error) {
      setMembers([])
    } else {
      setMembers(
        (data || []).map((pm: any) => ({
          id: pm.user_id,
          name: pm.users?.name || 'No Name',
          avatarUrl: pm.users?.avatar_url || undefined,
        }))
      )
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!name || !description) {
      setError('Please fill all required fields.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('milestone_tasks').insert({
      name,
      description, // HTML
      assigned_to: assignedTo || null,
      milestone_id: milestoneId,
      status: 'todo',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })
    setSaving(false)
    if (!error) {
      onSuccess()
      onClose()
    } else {
      setError('Error creating task.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[420px] p-0 mx-2 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E3E3] px-6 py-3">
          <span className="text-[14px] font-medium text-black">New Task</span>
          <button
            onClick={onClose}
            className="opacity-20 hover:opacity-60 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Name *</label>
            <input
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Task name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Description *</label>
            <textarea
              className="bg-white min-h-[100px] rounded border border-[#D3D3D3]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Assigned To</label>
            <select
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Due Date</label>
            <input
              type="date"
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#E3E3E3] px-6 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-[12px] bg-black text-white hover:bg-gray-900 disabled:opacity-60"
            disabled={saving || !name || !description}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
