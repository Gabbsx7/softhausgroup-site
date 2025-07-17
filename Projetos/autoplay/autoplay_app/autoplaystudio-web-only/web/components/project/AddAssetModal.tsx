import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from '@/lib/utils'

interface AddAssetModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  milestoneId: string
}

interface Asset {
  id: string
  title: string
  file_url: string
  mime_type: string
}

export default function AddAssetModal({
  open,
  onClose,
  onSuccess,
  projectId,
  milestoneId,
}: AddAssetModalProps) {
  const supabase = createClientComponentClient()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && projectId) {
      fetchAssets()
    }
    if (!open) {
      setSelected(new Set())
    }
  }, [open, projectId])

  async function fetchAssets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('media')
      .select('id, title, file_url, mime_type')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setAssets(data || [])
    setLoading(false)
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDone() {
    if (selected.size === 0) return
    setSaving(true)
    const inserts = Array.from(selected).map((media_id) => ({
      media_id,
      milestone_id: milestoneId,
    }))
    const { error } = await supabase.from('milestone_media').insert(inserts)
    setSaving(false)
    if (!error) {
      onSuccess()
      onClose()
    } else {
      alert('Error adding assets to milestone')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[480px] p-0 mx-2 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E3E3] px-6 py-3">
          <span className="text-[14px] font-medium text-black">Add Asset</span>
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
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No assets found for this project.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={cn(
                    'border rounded-lg p-1 flex flex-col items-center justify-center transition focus:outline-none',
                    selected.has(asset.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  )}
                  onClick={() => toggleSelect(asset.id)}
                >
                  {asset.mime_type.startsWith('image/') ? (
                    <img
                      src={asset.file_url}
                      alt={asset.title}
                      className="w-16 h-16 object-cover rounded mb-1"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded mb-1 text-xs text-gray-500">
                      {asset.mime_type.split('/')[0]}
                    </div>
                  )}
                  <span className="text-[10px] text-black truncate w-full text-center">
                    {asset.title}
                  </span>
                </button>
              ))}
            </div>
          )}
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
            onClick={handleDone}
            className="px-4 py-2 rounded-lg text-[12px] bg-black text-white hover:bg-gray-900 disabled:opacity-60"
            disabled={saving || selected.size === 0}
          >
            {saving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
