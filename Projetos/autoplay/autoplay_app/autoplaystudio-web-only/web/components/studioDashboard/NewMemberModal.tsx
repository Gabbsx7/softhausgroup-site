'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAllClients } from '@/hooks/use-all-clients'
import { usePermissions } from '@/components/role-based/permissions'

interface Role {
  id: string
  name: string
  description?: string
}

interface NewMemberModalProps {
  open: boolean
  onClose: () => void
  type: 'studio' | 'client'
  clientId?: string // novo
  studioId?: string // novo
  onMemberCreated?: () => void
}

export default function NewMemberModal({
  open,
  onClose,
  type,
  clientId, // novo
  studioId, // novo
  onMemberCreated,
}: NewMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    clientId: '',
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [error, setError] = useState('')

  const { clients, loading: loadingClients } = useAllClients()
  const { role: currentUserRole, loading: loadingPermissions } =
    usePermissions()

  // Buscar roles disponíveis
  useEffect(() => {
    async function fetchRoles() {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('id, name, description')
          .order('name')

        if (error) throw error
        setRoles(data || [])
      } catch (err) {
        console.error('Error fetching roles:', err)
      } finally {
        setLoadingRoles(false)
      }
    }

    if (open) {
      fetchRoles()
    }
  }, [open])

  // Função simples para filtrar roles
  const getFilteredRoles = () => {
    if (!currentUserRole) {
      return []
    }

    // Se é studio admin, pode ver TODAS as roles
    if (currentUserRole === 'studio_admin') {
      if (type === 'studio') {
        // Studio admin pode atribuir QUALQUER role quando adiciona membro do studio
        return roles
      } else {
        // Para client, só roles de client
        const filtered = roles.filter(
          (r) => r.name.includes('client') || r.name === 'guest'
        )

        return filtered
      }
    }

    // Se é client admin, só pode roles de client
    if (currentUserRole === 'client_admin') {
      if (type === 'client') {
        const filtered = roles.filter(
          (r) => r.name.includes('client') || r.name === 'guest'
        )

        return filtered
      } else {
        return []
      }
    }

    // Para outros casos, retorna vazio
    return []
  }

  const filteredRoles = getFilteredRoles()

  // Detectar se a role selecionada é do tipo client
  const selectedRoleObj = roles.find((r) => r.id === formData.roleId)
  const isClientRole =
    selectedRoleObj?.name?.startsWith('client_') ||
    selectedRoleObj?.name === 'guest'

  if (!open) return null

  // Loading state
  if (loadingRoles || loadingPermissions || !currentUserRole) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-700 text-lg font-medium mb-4">Loading...</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // No roles available
  if (filteredRoles.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-500 text-lg font-medium mb-4">
            No roles available for your permission level.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.roleId) {
      setError('Please fill in all required fields')
      return false
    }
    // Se for client role e não tiver clientId de contexto, exige seleção
    if (isClientRole && !clientId && !formData.clientId) {
      setError('Please select a client')
      return false
    }
    // Se for studio role e não houver studioId
    if (!isClientRole && !studioId) {
      setError(
        'Studio ID not found. Please reload the page or check your permissions.'
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    setLoading(true)
    try {
      // Buscar o nome da role
      const selectedRole = roles.find((role) => role.id === formData.roleId)
      if (!selectedRole) {
        throw new Error('Selected role not found')
      }
      // Preparar dados para o convite
      const inviteData: any = {
        email: formData.email,
        metadata: {
          name: formData.name,
        },
        role: selectedRole.name,
      }
      // Adicionar client_id se for do tipo client
      if (isClientRole) {
        inviteData.client_id = clientId || formData.clientId
      }
      // Adicionar studio_id se for do tipo studio
      if (!isClientRole) {
        inviteData.studio_id = studioId
      }
      // Chamar a função de convite apropriada
      if (!isClientRole) {
        await inviteStudioMember(inviteData)
      } else {
        await inviteClientMember(inviteData)
      }
      // Reset form
      setFormData({
        name: '',
        email: '',
        roleId: '',
        clientId: '',
      })
      onMemberCreated?.()
      onClose()
    } catch (err: any) {
      console.error('Error creating member:', err)
      setError(err.message || 'Failed to create member')
    } finally {
      setLoading(false)
    }
  }

  const inviteStudioMember = async (data: any) => {
    // Usar apenas o studioId passado por prop
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        metadata: data.metadata,
        role: data.role,
        studio_id: data.studio_id, // já vem do prop
        type: 'studio',
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create studio member')
    }
    return result
  }

  const inviteClientMember = async (data: any) => {
    // Usar apenas os dados do form
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        metadata: data.metadata,
        role: data.role,
        client_id: data.client_id,
        type: 'client',
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create client member')
    }
    return result
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Add {type === 'studio' ? 'Studio' : 'Client'} Member
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              <option value="">Select a role</option>
              {filteredRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Client Selection (apenas para client role e sem clientId fixo) */}
          {isClientRole && !clientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
                disabled={loadingClients}
              >
                <option value="">
                  {loadingClients ? 'Loading clients...' : 'Select a client'}
                </option>
                {clients?.map((client) => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.client_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
