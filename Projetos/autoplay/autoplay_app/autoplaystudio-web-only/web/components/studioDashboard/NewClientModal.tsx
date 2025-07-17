import React, { useState } from 'react'
import { useCreateClient } from '../../hooks/use-create-client'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const NewClientModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  // Apenas estados necessários para um passo
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const { createClientOnly, loading, error: createError } = useCreateClient()

  const handleDone = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Client Name and Description are required')
      return
    }
    setError('')
    try {
      const result = await createClientOnly(
        {
          name,
          website,
          description,
        },
        logoFile || undefined,
        logoUrl || undefined
      )
      if (result.success) {
        onSuccess?.()
        alert('Client created successfully!')
        onClose()
        setName('')
        setWebsite('')
        setDescription('')
        setLogoUrl('')
        setLogoFile(null)
        setError('')
      } else {
        setError(result.error || 'Failed to create client')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-[12px] w-full max-w-md p-0 shadow-lg relative mx-2 min-h-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E3E3] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-gray-200 rounded mr-2" />
            <span className="text-[12px] font-medium text-black">
              New client
            </span>
          </div>
          <button
            onClick={onClose}
            className="opacity-20 hover:opacity-60 transition"
            disabled={loading}
          >
            <span className="inline-block w-6 h-6 bg-gray-300 rounded-full" />
          </button>
        </div>
        {/* Título e subtítulo acima do upload */}
        <div className="px-4 pt-6 pb-2 flex flex-col items-center">
          <div className="mb-2 text-center">
            <div className="text-[15px] font-medium text-black mb-0.5">
              Create a new client
            </div>
            <div className="text-[11px] text-[#898989]">
              Fill in the client details below
            </div>
          </div>
        </div>
        {/* Logo Preview e Upload abaixo do título */}
        <div className="flex flex-col items-center pb-2">
          <label className="block mb-1 text-[11px] text-black font-medium">
            Client Logo
          </label>
          <div className="w-16 h-16 bg-[#F3F3F3] border border-[#D3D3D3] rounded-lg flex items-center justify-center overflow-hidden mb-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="object-contain w-full h-full"
              />
            ) : logoFile ? (
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Logo preview"
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-gray-300 text-3xl">+</span>
            )}
          </div>
          <input
            id="client-logo-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setLogoFile(e.target.files[0])
                setLogoUrl('')
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            className="px-3 py-1 text-[12px] rounded bg-[#F3F3F3] text-black border border-[#D3D3D3] hover:bg-gray-200 transition mb-1 disabled:opacity-50"
            onClick={() => document.getElementById('client-logo-file')?.click()}
            disabled={loading}
          >
            Choose file
          </button>
          <span className="text-[11px] text-gray-500 mb-1">
            {logoFile ? logoFile.name : 'No file chosen'}
          </span>
          <input
            type="text"
            placeholder="Or paste image URL"
            className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-2 py-1 text-[11px] placeholder-[#D4D4D4] outline-none w-full"
            value={logoUrl}
            onChange={(e) => {
              setLogoUrl(e.target.value)
              setLogoFile(null)
            }}
            disabled={loading}
          />
        </div>
        {/* Formulário principal */}
        <div className="px-4 py-4">
          <div className="space-y-2">
            {/* Client Name */}
            <div>
              <div className="text-[10px] text-black mb-0.5">Client Name</div>
              <input
                className="w-full bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-4 py-2 text-[12px] placeholder-[#D4D4D4] outline-none"
                placeholder="Enter client name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              {error && !name.trim() && (
                <div className="text-[10px] text-[#8D0F0B] mt-0.5">
                  Client Name is required
                </div>
              )}
            </div>
            {/* Client Website */}
            <div>
              <div className="text-[10px] text-black mb-0.5">
                Client Website
              </div>
              <input
                className="w-full bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-4 py-2 text-[12px] placeholder-[#D4D4D4] outline-none"
                placeholder="Enter client website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={loading}
              />
            </div>
            {/* Description */}
            <div>
              <div className="text-[10px] text-black mb-0.5">Description</div>
              <textarea
                className="w-full bg-[#F3F3F3] border border-[#D3D3D3] rounded-[14px] px-4 py-2 text-[12px] placeholder-[#D4D4D4] outline-none resize-none"
                placeholder="A little bit about the company and what you do for them"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={loading}
              />
              {error && !description.trim() && (
                <div className="text-[10px] text-[#8D0F0B] mt-0.5">
                  Client description is required
                </div>
              )}
            </div>
            {error && (
              <div className="text-[10px] text-[#8D0F0B] mt-0.5">{error}</div>
            )}
            <button
              className="w-full mt-4 bg-black text-white rounded-full py-2 text-[13px] font-medium disabled:opacity-60"
              onClick={handleDone}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewClientModal
