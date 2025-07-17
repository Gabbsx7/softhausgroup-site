import React, { useState } from 'react'
import Image from 'next/image'
import { useTemplates, Template } from '../../hooks/use-templates'
import { TemplateCard } from './index'
import { EmptyState } from '../common/EmptyState'
import { useEffect } from 'react'
import { usePermissions } from '@/components/role-based/permissions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useRef } from 'react'

// Buscar membros reais
type Member = {
  id: string
  name: string
  email: string
  role: string
  type: 'studio' | 'client'
}

const categories = [
  'Marketing',
  'Ux/UI',
  'CGI',
  'Branding',
  'Development',
  'Other',
]

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: any) => void
  clientId?: string // Adicionado para passar o client_id
}

// Utilitários para cor e ícone por status
const milestoneStyles = {
  completed: {
    bg: 'bg-[#FFF9D7]',
    border: 'border-[#FFF9D7]',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <ellipse
          cx="9"
          cy="9"
          rx="6.75"
          ry="6.75"
          stroke="#64C039"
          strokeWidth="1.5"
          fill="white"
        />
        <path
          d="M6.75 9.75L8.25 11.25L11.25 7.5"
          stroke="#64C039"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  in_progress: {
    bg: 'bg-[#F6F4E7]',
    border: 'border-[#F6F4E7]',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <ellipse
          cx="9"
          cy="9"
          rx="6.75"
          ry="6.75"
          stroke="#7CCDF5"
          strokeWidth="1.5"
          fill="white"
        />
        <path
          d="M9 3.75V9L12.75 10.5"
          stroke="#7CCDF5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  pending: {
    bg: 'bg-[#F6F4E7]',
    border: 'border-[#F6F4E7]',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <ellipse
          cx="9"
          cy="9"
          rx="7.5"
          ry="7.5"
          stroke="#E0E0E0"
          strokeWidth="1.5"
          fill="white"
        />
      </svg>
    ),
  },
}

// Utilitário para normalizar nome da pasta
function normalizeFolderName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase()
}

// Função para obter bucket por tipo
function getBucketByType(type: 'image' | 'video' | 'document') {
  if (type === 'image') return 'images'
  if (type === 'video') return 'Video'
  return 'uploads'
}

// Função para montar o path do upload
function getUploadPath(clientName: string, file: File) {
  const folder = normalizeFolderName(clientName)
  return `${folder}/${Date.now()}_${file.name}`
}

// Função utilitária para buscar dados de usuários por IDs
async function fetchUsersByIds(
  supabase: any,
  userIds: string[]
): Promise<Record<string, { name: string; email: string }>> {
  if (userIds.length === 0) return {}
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)
  if (error) return {}
  const map: Record<string, { name: string; email: string }> = {}
  for (const u of data) {
    map[u.id] = { name: u.name, email: u.email }
  }
  return map
}

export default function NewProjectModal({
  open,
  onClose,
  onCreate,
  clientId,
}: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [category, setCategory] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [typedFiles, setTypedFiles] = useState<
    { file: File; type: 'image' | 'video' | 'document' }[]
  >([])
  const [error, setError] = useState('')
  const {
    templates,
    loading: loadingTemplates,
    error: errorTemplates,
  } = useTemplates()
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(1)
  const [selectedMembers, setSelectedMembers] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [milestoneName, setMilestoneName] = useState('')
  const [milestoneDeadline, setMilestoneDeadline] = useState('')
  const [milestoneDescription, setMilestoneDescription] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { isStudioMember } = usePermissions()
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const successTimeout = useRef<NodeJS.Timeout | null>(null)

  // Buscar membros reais ao abrir o modal
  useEffect(() => {
    const fetchMembers = async () => {
      if (!open || !clientId) return
      setLoadingMembers(true)
      try {
        let studioMembers: Member[] = []
        let clientMembers: Member[] = []
        let userIds: string[] = []
        if (isStudioMember) {
          // Buscar studio_members
          const { data: studioData } = await supabase
            .from('studio_members')
            .select('user_id, role_id')
          studioMembers = (studioData || []).map((m: any) => ({
            id: m.user_id,
            name: '', // Preencher depois
            email: '',
            role: m.role_id || 'Studio',
            type: 'studio',
          }))
          userIds.push(...studioMembers.map((m) => m.id))
        }
        // Buscar client_users
        const { data: clientData } = await supabase
          .from('client_users')
          .select('user_id, role_id')
          .eq('client_id', clientId)
        clientMembers = (clientData || []).map((m: any) => ({
          id: m.user_id,
          name: '', // Preencher depois
          email: '',
          role: m.role_id || 'Client',
          type: 'client',
        }))
        userIds.push(...clientMembers.map((m) => m.id))
        // Buscar dados dos usuários
        const userMap = await fetchUsersByIds(supabase, userIds)
        // Preencher nome/email
        studioMembers = studioMembers.map((m) => ({
          ...m,
          name: userMap[m.id]?.name || '',
          email: userMap[m.id]?.email || '',
        }))
        clientMembers = clientMembers.map((m) => ({
          ...m,
          name: userMap[m.id]?.name || '',
          email: userMap[m.id]?.email || '',
        }))
        setMembers([...studioMembers, ...clientMembers])
      } catch (err) {
        setMembers([])
      } finally {
        setLoadingMembers(false)
      }
    }
    fetchMembers()
  }, [open, clientId, isStudioMember])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelectedMembers([])
      setMilestones([])
      setMilestoneDescription('')
    }
  }, [open])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setTemplateDropdownOpen(false)
      }
    }
    if (templateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [templateDropdownOpen])

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).slice(0, 10) // Limite de 10 arquivos
      setFiles(arr)
      // Detectar tipo
      const typed = arr.map((file) => {
        if (file.type.startsWith('image/'))
          return { file, type: 'image' as const }
        if (file.type.startsWith('video/'))
          return { file, type: 'video' as const }
        if (
          file.type.includes('pdf') ||
          file.type.includes('msword') ||
          file.type.includes('officedocument') ||
          file.type.includes('text')
        )
          return { file, type: 'document' as const }
        return { file, type: 'document' as const }
      })
      setTypedFiles(typed)
    }
  }

  const handleSubmit = () => {
    if (!description) {
      setError('Project description is required')
      return
    }
    // Corrigir tipos e nomes dos campos para o Supabase
    const parsedBudget = budget ? Number(budget.replace(/[^0-9]/g, '')) : null
    const parsedDeadline = endDate ? endDate : null
    onCreate({
      name,
      description,
      goal,
      start_date: startDate || null,
      deadline: parsedDeadline,
      budget: parsedBudget,
      category,
      files,
    })
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!description) {
        setError('Project description is required')
        return
      }
      if (!clientId) {
        setError(
          'Client ID not found. Please reload the page or select a client.'
        )
        console.error('Tentativa de insert sem clientId', { name, clientId })
        return
      }
      if (!projectId) {
        // Buscar se já existe projeto draft para este clientId e nome
        const { data: existing, error: findError } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', clientId)
          .eq('status_new', 'draft')
          .eq('name', name)
          .maybeSingle()
        if (
          findError &&
          findError.code !== 'PGRST116' &&
          findError.code !== 'PGRST123'
        ) {
          // Erro real (não not found, não no results)
          setError(findError.message)
          return
        }
        if (existing && existing.id) {
          // Já existe, faz update
          setProjectId(existing.id)
          const { error } = await supabase
            .from('projects')
            .update({
              name,
              description,
              goal,
              start_date: startDate ? new Date(startDate).toISOString() : null,
              deadline: endDate ? new Date(endDate).toISOString() : null,
              budget,
              category,
              status_new: 'draft',
              client_id: clientId,
            })
            .eq('id', existing.id)
          if (error) {
            setError(error.message)
            return
          }
        } else {
          // Não existe, faz insert
          console.log('Insert project', {
            name,
            clientId,
            description,
            goal,
            startDate,
            endDate,
            budget,
            category,
          })
          const { data, error } = await supabase
            .from('projects')
            .insert([
              {
                name,
                description,
                goal,
                start_date: startDate
                  ? new Date(startDate).toISOString()
                  : null,
                deadline: endDate ? new Date(endDate).toISOString() : null,
                budget,
                category,
                status_new: 'draft',
                client_id: clientId,
              },
            ])
            .select('id')
            .single()
          if (error) {
            setError(error.message)
            return
          }
          setProjectId(data.id)
        }
      } else {
        // Atualizar projeto existente
        const { error } = await supabase
          .from('projects')
          .update({
            name,
            description,
            goal,
            start_date: startDate ? new Date(startDate).toISOString() : null,
            deadline: endDate ? new Date(endDate).toISOString() : null,
            budget,
            category,
            status_new: 'draft',
            client_id: clientId,
          })
          .eq('id', projectId)
        if (error) {
          setError(error.message)
          return
        }
      }
      setStep(2)
    } else {
      // Validação: precisa ter pelo menos um milestone
      if (milestones.length === 0) {
        setError(
          'Please create the first milestone before creating the project.'
        )
        return
      }
      // Submit final
      const parsedBudget = budget ? Number(budget.replace(/[^0-9]/g, '')) : null
      const parsedDeadline = endDate ? endDate : null
      // Obter usuário autenticado para created_by
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Não foi possível obter o usuário autenticado.')
        return
      }
      // Inserir membros na tabela project_members
      if (projectId && selectedMembers.length > 0) {
        try {
          await Promise.all(
            selectedMembers.map(async (member) => {
              const { error } = await supabase.from('project_members').insert([
                {
                  project_id: projectId,
                  user_id: member.id,
                  created_by: user.id,
                },
              ])
              if (error && error.code !== '23505') {
                // 23505 = unique violation
                throw error
              }
            })
          )
        } catch (err: any) {
          setError(
            'Error adding members to project: ' +
              (err.message || err.toString())
          )
          return
        }
      }
      // Upload de arquivos e registro em media/project_media
      if (typedFiles.length > 0 && clientId && projectId) {
        try {
          for (const { file, type } of typedFiles) {
            const bucket = getBucketByType(type)
            const folder = normalizeFolderName(name || 'client')
            const path = `${folder}/${Date.now()}_${file.name}`
            // Upload para o bucket
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from(bucket)
                .upload(path, file, { upsert: false })
            if (uploadError) throw uploadError
            // Obter URL pública
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(path)
            const fileUrl = urlData?.publicUrl || ''
            // Registro em media
            const { data: mediaData, error: mediaError } = await supabase
              .from('media')
              .insert([
                {
                  title: file.name,
                  file_url: fileUrl,
                  file_size: file.size,
                  mime_type: file.type,
                  uploaded_by: user.id,
                  client_id: clientId,
                  project_id: projectId,
                  status: 'pending',
                },
              ])
              .select('id')
              .single()
            if (mediaError) throw mediaError
            // Registro em project_media
            const { error: pmError } = await supabase
              .from('project_media')
              .insert([
                {
                  project_id: projectId,
                  media_id: mediaData.id,
                  created_by: user.id,
                },
              ])
            if (pmError) throw pmError
          }
        } catch (err: any) {
          setError(
            'Erro ao fazer upload ou registrar arquivos: ' +
              (err.message || err.toString())
          )
          return
        }
      }
      onCreate({
        name,
        description,
        goal,
        start_date: startDate || null,
        deadline: parsedDeadline,
        budget: parsedBudget,
        category,
        files,
        members: selectedMembers,
        milestones,
      })
      setShowSuccess(true)
      if (successTimeout.current) clearTimeout(successTimeout.current)
      successTimeout.current = setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1200)
    }
  }

  const handlePrev = () => {
    if (step === 2) setStep(1)
  }

  const handleToggleMember = (member: any) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member]
    )
  }

  const handleAddMilestone = async () => {
    if (!milestoneName || !projectId) return
    setLoadingMembers(true) // Reutilizando loading para feedback
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert([
          {
            title: milestoneName,
            description: milestoneDescription,
            due_date: milestoneDeadline
              ? new Date(milestoneDeadline).toISOString()
              : null,
            project_id: projectId,
            status: 'pending',
          },
        ])
        .select('*')
        .single()
      if (error) throw error
      setMilestones((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.title,
          description: data.description,
          deadline: data.due_date,
          status: data.status,
        },
      ])
      setMilestoneName('')
      setMilestoneDescription('')
      setMilestoneDeadline('')
      setShowMilestoneModal(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar milestone')
    } finally {
      setLoadingMembers(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[480px] p-0 mx-2 flex flex-col max-h-[95vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E3E3] px-6 py-3">
          <span className="text-[14px] font-medium text-black">
            New Project
          </span>
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 bg-[#D7D7D7] rounded-[6px] px-4 py-1.5 hover:bg-[#e3e3e3] transition h-8 min-h-0"
                type="button"
                onClick={() => setTemplateDropdownOpen((v) => !v)}
              >
                <span className="text-[12px] font-medium text-black">
                  {selectedTemplate
                    ? 'Change Template'
                    : 'Select a Project Template'}
                </span>
                <span className="inline-flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="#222"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {templateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded shadow z-20">
                  {loadingTemplates ? (
                    <div className="p-4 text-xs text-gray-400">Loading...</div>
                  ) : errorTemplates ? (
                    <div className="p-4 text-xs text-red-400">
                      {errorTemplates}
                    </div>
                  ) : templates.length === 0 ? (
                    <EmptyState type="templates" message="No templates found" />
                  ) : (
                    templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-100 ${
                          selectedTemplate?.id === tpl.id
                            ? 'font-bold bg-gray-50'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedTemplate(tpl)
                          setTemplateDropdownOpen(false)
                        }}
                        type="button"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{tpl.name}</span>
                          {tpl.description && (
                            <span className="text-gray-400 text-xs">
                              {tpl.description}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="opacity-20 hover:opacity-60 transition"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
        </div>
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div
            className={`w-3 h-3 rounded-full ${
              step === 1 ? 'bg-black' : 'bg-gray-300'
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${
              step === 2 ? 'bg-black' : 'bg-gray-300'
            }`}
          ></div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-6 py-4">
          {step === 1 && (
            <>
              {selectedTemplate && (
                <div className="mb-2">
                  <TemplateCard
                    name={selectedTemplate.name}
                    description={selectedTemplate.description}
                    // category, previewImage, foldersCount, assetsCount podem ser passados se existirem no template
                  />
                </div>
              )}
              <div>
                <h2 className="text-[16px] font-medium text-black mb-1">
                  Start a new Project
                </h2>
                <p className="text-[12px] text-[#898989]">
                  Answer a few questions about your project
                </p>
              </div>
              {/* Project Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-black">Project Name</label>
                <input
                  className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                  placeholder="What is a good name for this project?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="text-[10px] text-[#8D0F0B]">
                  If left empty a name will be generated from the description
                </span>
              </div>
              {/* Project Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-black">
                  Project Description
                </label>
                <textarea
                  className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-2xl px-5 py-3 text-[12px] min-h-[60px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                  placeholder="A little bit about the project and what you and the client want to achieve."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {error && (
                  <span className="text-[10px] text-[#8D0F0B] font-semibold">
                    {error}
                  </span>
                )}
              </div>
              {/* Project Goal */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-black">Project Goal</label>
                <textarea
                  className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-2xl px-5 py-3 text-[12px] min-h-[60px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                  placeholder="What are the deliverables and what elements are required to make this project a success?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              {/* Dates */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] text-black">Start Date</label>
                  <input
                    type="date"
                    className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] text-black">End Date</label>
                  <input
                    type="date"
                    className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {/* Budget & Category */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] text-black">Budget</label>
                  <input
                    type="text"
                    className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                    placeholder="$"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] text-black">
                    Project Category
                  </label>
                  <select
                    className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a Category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-[16px] font-medium text-black mb-1">
                Select Project Members
              </h2>
              <p className="text-[12px] text-[#898989] mb-2">
                Choose who will participate in this project
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {loadingMembers ? (
                  <span className="text-xs text-gray-400">
                    Loading members...
                  </span>
                ) : members.length === 0 ? (
                  <span className="text-xs text-gray-400">
                    No members found
                  </span>
                ) : (
                  members.map((member) => (
                    <button
                      key={member.id}
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                        selectedMembers.some((m) => m.id === member.id)
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleToggleMember(member)}
                      type="button"
                    >
                      {member.name}
                    </button>
                  ))
                )}
              </div>
              {/* Grid de membros selecionados */}
              {selectedMembers.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium mb-1">
                    Selected Members:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <span
                        key={member.id}
                        className="bg-blue-50 text-blue-700 rounded-full px-3 py-0.5 text-[11px] font-normal"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Milestones */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium">Milestones</div>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setShowMilestoneModal(true)}
                  type="button"
                >
                  + Add Milestone
                </button>
              </div>
              {milestones.length === 0 && (
                <div className="text-xs text-gray-400 mb-2">
                  No milestones yet
                </div>
              )}
              <div className="flex flex-col gap-2 mb-2">
                {milestones.map((ms) => {
                  const status: 'completed' | 'in_progress' | 'pending' =
                    ms.status === 'completed' || ms.status === 'in_progress'
                      ? ms.status
                      : 'pending'
                  const style = milestoneStyles[status]
                  // Formatar deadline
                  let deadlineFormatted = '-'
                  if (ms.deadline) {
                    const date = new Date(ms.deadline)
                    if (!isNaN(date.getTime())) {
                      deadlineFormatted = format(date, 'd MMMM, yyyy', {
                        locale: enUS,
                      })
                    }
                  }
                  // Status com primeira maiúscula
                  const statusLabel =
                    status.charAt(0).toUpperCase() +
                    status.slice(1).replace('_', ' ')
                  return (
                    <div
                      key={ms.id}
                      className={`flex items-center gap-3 rounded px-3 py-2 border ${style.bg} ${style.border} transition hover:bg-[#f3f1e0] hover:shadow-sm`}
                      style={{ minHeight: 34 }}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7">
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {ms.name}
                        </div>
                        {ms.description && (
                          <div className="text-[10px] text-gray-500 truncate">
                            {ms.description}
                          </div>
                        )}
                        <div className="flex gap-3 mt-1">
                          <span className="text-[11px] font-semibold text-blue-900">
                            Deadline: {deadlineFormatted}
                          </span>
                          <span className="text-[11px] font-semibold text-blue-900">
                            Status: {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Mini modal para adicionar milestone */}
              {showMilestoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
                    <div className="text-sm font-medium mb-1">
                      New Milestone
                    </div>
                    <input
                      className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs"
                      placeholder="Milestone name"
                      value={milestoneName}
                      onChange={(e) => setMilestoneName(e.target.value)}
                    />
                    <textarea
                      className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs min-h-[48px]"
                      placeholder="Description"
                      value={milestoneDescription}
                      onChange={(e) => setMilestoneDescription(e.target.value)}
                    />
                    <input
                      type="date"
                      className="bg-[#F3F3F3] border border-[#D3D3D3] rounded px-3 py-2 text-xs"
                      value={milestoneDeadline}
                      onChange={(e) => setMilestoneDeadline(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-gray-100 rounded px-3 py-1 text-xs"
                        onClick={() => setShowMilestoneModal(false)}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-black text-white rounded px-3 py-1 text-xs"
                        onClick={handleAddMilestone}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Upload Files */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[10px] text-black">Upload Files</label>
                <div className="flex items-center bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 w-full">
                  <label
                    htmlFor="project-upload-files"
                    className="cursor-pointer mr-3"
                  >
                    <span className="bg-white border border-[#BDBDBD] px-2 py-1 rounded text-[12px] font-normal">
                      Choose files
                    </span>
                    <input
                      id="project-upload-files"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                      max={10}
                    />
                  </label>
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    {files.length === 0 ? (
                      <span className="text-[12px] text-black truncate">
                        No file chosen
                      </span>
                    ) : (
                      <>
                        {/* Previews */}
                        {files.slice(0, 3).map((file, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-center w-9 h-9 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                          >
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="object-cover w-full h-full"
                              />
                            ) : file.type.startsWith('video/') ? (
                              <span className="text-xs text-blue-700">🎬</span>
                            ) : (
                              <span className="text-xs text-gray-500">📄</span>
                            )}
                            <span className="text-[8px] text-gray-500 truncate w-8">
                              {file.name}
                            </span>
                          </div>
                        ))}
                        {files.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{files.length - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="text-[11px] text-gray-600 mt-1">
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-[#E3E3E3] bg-white sticky bottom-0">
          <div>
            {step === 2 && (
              <button
                className="bg-white border border-[#E3E3E3] rounded px-6 py-2 text-xs font-bold text-black hover:bg-gray-100 transition"
                onClick={handlePrev}
              >
                BACK
              </button>
            )}
          </div>
          <div>
            <button
              className="bg-black text-white rounded px-6 py-2 text-xs font-bold hover:bg-gray-900 transition"
              onClick={handleNext}
            >
              {step === 1 ? 'NEXT' : 'CREATE PROJECT'}
            </button>
          </div>
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 animate-fade-in">
          <div className="bg-white rounded-full shadow-lg flex items-center justify-center w-24 h-24">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
