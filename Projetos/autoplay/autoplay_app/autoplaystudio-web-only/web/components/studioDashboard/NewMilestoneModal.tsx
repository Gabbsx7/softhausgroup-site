import React, { useState } from 'react'

interface NewMilestoneModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: {
    title: string
    description: string
    due_date: string
  }) => void
  projectId: string
}

export default function NewMilestoneModal({
  open,
  onClose,
  onCreate,
  projectId,
}: NewMilestoneModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async () => {
    if (!title) {
      setError('Milestone name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onCreate({ title, description, due_date: dueDate })
      setTitle('')
      setDescription('')
      setDueDate('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
        <div className="text-sm font-medium mb-1">New Milestone</div>
        <input
          className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs"
          placeholder="Milestone name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs min-h-[48px]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button
            className="bg-gray-100 rounded px-3 py-1 text-xs"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-black text-white rounded px-3 py-1 text-xs"
            onClick={handleSubmit}
            type="button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
