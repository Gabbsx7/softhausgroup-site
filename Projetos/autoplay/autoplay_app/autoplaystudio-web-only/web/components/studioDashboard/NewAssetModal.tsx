import React, { useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider'
import { useParams } from 'next/navigation'
import { usePermissions } from '@/components/role-based/permissions'
import { uploadToStorage, getBucketForFileType } from '@/lib/storage-utils'

interface NewAssetModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

// Função utilitária para garantir que apenas strings sejam renderizadas
function safeString(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value === null || value === undefined) return ''
  if (typeof value === 'object' && value.toString) return value.toString()
  return ''
}

export default function NewAssetModal({
  open,
  onClose,
  onSuccess,
}: NewAssetModalProps) {
  const params = useParams()
  const clientId = params?.clientId as string | undefined
  const projectId = params?.projectId as string | undefined
  const milestoneId = params?.milestoneId as string | undefined
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { isStudioMember } = usePermissions()

  // States with proper initialization
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMilestone, setSelectedMilestone] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [finalizing, setFinalizing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Data states with proper initialization
  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Error boundary for React errors
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('React error in NewAssetModal:', error)
      setError('An unexpected error occurred. Please try again.')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Context detection
  const isStudioDashboard = !clientId && !projectId && !milestoneId
  const isClientDashboard = clientId && !projectId && !milestoneId
  const isProjectPage = clientId && projectId && !milestoneId
  const isMilestonePage = clientId && projectId && milestoneId

  // Check if user is studio member (not client)
  const isStudioView = isStudioMember

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função utilitária para gerar o path do arquivo com pasta do cliente
  function getUploadPath(fileName: string) {
    // Buscar nome do cliente de forma robusta
    let clientName = ''
    if (isStudioDashboard && selectedClient) {
      const clientObj = clients.find((c) => c.id === selectedClient)
      clientName = clientObj?.name || ''
    } else if (isClientDashboard) {
      const clientObj = clients.find((c) => c.id === clientId)
      clientName = clientObj?.name || ''
    }
    // Fallback para projectId se não encontrar nome
    if (!clientName && selectedProject) {
      clientName = selectedProject
    }
    // Garantir que nunca será vazio
    const safeClient = clientName
      ? clientName.replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'unknown_client'
    const path = `${safeClient}/${fileName}`
    console.log('[UPLOAD] Path gerado:', path)
    return path
  }

  // Fetch projects and collections when modal opens
  React.useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, clientId, selectedClient])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch clients (only for studio dashboard)
      if (isStudioDashboard && isStudioView) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .order('name')
        setClients(clientsData || [])
      }

      // Fetch projects (quando projectId não está definido)
      if (!projectId) {
        let projectsQuery = supabase.from('projects').select('*')

        if (isClientDashboard) {
          // Client dashboard - apenas projetos do cliente
          projectsQuery = projectsQuery.eq('client_id', clientId)
        } else if (isStudioDashboard && selectedClient) {
          // Studio dashboard com cliente selecionado
          projectsQuery = projectsQuery.eq('client_id', selectedClient)
        }

        const { data: projectsData } = await projectsQuery.order('name')
        setProjects(projectsData || [])
      }

      // Fetch milestones (quando milestoneId não está definido)
      if (!milestoneId) {
        let milestonesQuery = supabase.from('milestones').select('*')

        if (isProjectPage) {
          // Project page - apenas milestones do projeto
          milestonesQuery = milestonesQuery.eq('project_id', projectId)
        } else if (selectedProject) {
          // Quando projeto está selecionado no dropdown
          milestonesQuery = milestonesQuery.eq('project_id', selectedProject)
        }

        const { data: milestonesData } = await milestonesQuery.order('title')
        setMilestones(milestonesData || [])
      }

      // Fetch collections (folders)
      let collectionsQuery = supabase.from('folders').select('*')

      if (isClientDashboard || isProjectPage || isMilestonePage) {
        // Client context - apenas folders do cliente
        collectionsQuery = collectionsQuery.eq('client_id', clientId)
      } else if (isStudioDashboard && selectedClient) {
        // Studio com cliente selecionado
        collectionsQuery = collectionsQuery.eq('client_id', selectedClient)
      }

      const { data: collectionsData } = await collectionsQuery.order('name')
      setCollections(collectionsData || [])
    } catch (err: any) {
      console.error('Error fetching data:', err)
      const errorMessage =
        typeof err === 'string' ? err : err?.message || 'Failed to load data'
      setError(errorMessage)
    } finally {
      setLoadingData(false)
    }
  }

  // Refetch when dependencies change
  React.useEffect(() => {
    if (selectedClient && open) {
      fetchData()
    }
  }, [selectedClient])

  React.useEffect(() => {
    if (selectedProject && open) {
      fetchData()
    }
  }, [selectedProject])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setName(selectedFile.name.split('.')[0])

    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else if (selectedFile.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(selectedFile)
      setPreview(videoUrl)
    } else {
      setPreview(null)
    }

    // Upload automatically
    await handleUpload(selectedFile)
  }

  const handleUpload = async (fileToUpload?: File) => {
    const uploadFile = fileToUpload || file
    if (!uploadFile) return

    setUploading(true)
    setError('')

    try {
      const bucket = getBucketForFileType(uploadFile.type)
      const fileName = `${Date.now()}_${uploadFile.name}`
      const filePath = getUploadPath(fileName)
      console.log('[UPLOAD] Bucket:', bucket, 'Path:', filePath)

      const { data, error, url } = await uploadToStorage(
        uploadFile,
        bucket,
        filePath
      )

      if (error) {
        const errorMessage =
          typeof error === 'string' ? error : error?.message || 'Unknown error'
        setError(`Upload failed: ${errorMessage}`)
        return
      }

      if (url) {
        setUploadedUrl(url)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage =
        typeof err === 'string' ? err : err?.message || 'Upload failed'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDone = async () => {
    if (!file || !uploadedUrl || !name) {
      setError('Please fill all required fields and upload a file')
      return
    }
    setFinalizing(true)
    setError('')
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get file dimensions for images/videos
      let width = null
      let height = null

      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.src = preview!
        await new Promise((resolve) => {
          img.onload = () => {
            width = img.naturalWidth
            height = img.naturalHeight
            resolve(null)
          }
        })
      }

      // Determine IDs baseado no contexto
      const finalClientId = (() => {
        if (isMilestonePage || isProjectPage || isClientDashboard) {
          return clientId // Usar clientId da URL
        }
        if (isStudioDashboard) {
          return selectedClient || null // Usar cliente selecionado no dropdown
        }
        return null
      })()

      const finalProjectId = (() => {
        if (isMilestonePage || isProjectPage) {
          return projectId // Usar projectId da URL
        }
        if (isClientDashboard || isStudioDashboard) {
          return selectedProject || null // Usar projeto selecionado no dropdown
        }
        return null
      })()

      const finalMilestoneId = (() => {
        if (isMilestonePage) {
          return milestoneId // Usar milestoneId da URL
        }
        if (isProjectPage || isClientDashboard || isStudioDashboard) {
          return selectedMilestone || null // Usar milestone selecionado no dropdown
        }
        return null
      })()

      // Buscar se já existe media com o mesmo file_url
      let mediaId: string | null = null
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('file_url', uploadedUrl)
        .maybeSingle()

      if (existingMedia && existingMedia.id) {
        // Update media
        const { error: updateError } = await supabase
          .from('media')
          .update({
            title: name,
            file_size: file.size,
            mime_type: file.type,
            width,
            height,
            description: description || null,
            uploaded_by: user.id,
            client_id: finalClientId,
            project_id: finalProjectId,
            status: 'pending',
          })
          .eq('id', existingMedia.id)
        if (updateError) throw updateError
        mediaId = existingMedia.id
      } else {
        // Insert media
        const mediaData = {
          title: name,
          file_url: uploadedUrl,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
          description: description || null,
          uploaded_by: user.id,
          client_id: finalClientId,
          project_id: finalProjectId,
          status: 'pending',
        }
        const { data: insertedMedia, error } = await supabase
          .from('media')
          .insert([mediaData])
          .select('id')
          .single()
        if (error) throw error
        mediaId = insertedMedia.id
      }

      // Se uma collection foi selecionada, criar relacionamento em folder_media (busca + insert manual)
      if (selectedCollection && mediaId) {
        // Verificar se já existe o relacionamento
        const { data: existingFolderMedia } = await supabase
          .from('folder_media')
          .select('id')
          .eq('folder_id', selectedCollection)
          .eq('media_id', mediaId)
          .maybeSingle()
        if (!existingFolderMedia) {
          const { error: folderMediaError } = await supabase
            .from('folder_media')
            .insert([{ folder_id: selectedCollection, media_id: mediaId }])
          if (folderMediaError) throw folderMediaError
        }
      }

      // Se tem projectId, criar ou atualizar relacionamento em project_media
      if (finalProjectId && mediaId) {
        // Verificar se já existe o relacionamento
        const { data: existing, error: checkError } = await supabase
          .from('project_media')
          .select('id')
          .eq('project_id', finalProjectId)
          .eq('media_id', mediaId)
          .maybeSingle()

        if (existing && existing.id) {
          // Update se necessário (remover folder_id)
          await supabase
            .from('project_media')
            .update({
              created_by: user.id,
            })
            .eq('id', existing.id)
        } else {
          const { error: projectMediaError } = await supabase
            .from('project_media')
            .insert([
              {
                project_id: finalProjectId,
                media_id: mediaId,
                created_by: user.id,
              },
            ])
          if (projectMediaError) throw projectMediaError
        }
      }

      // Se tem milestoneId, criar relacionamento em milestone_media (ignorar erro de duplicidade)
      if (finalMilestoneId && mediaId) {
        const { error: milestoneMediaError } = await supabase
          .from('milestone_media')
          .upsert(
            [
              {
                milestone_id: finalMilestoneId,
                media_id: mediaId,
              },
            ],
            { onConflict: 'milestone_id,media_id' }
          )
        if (milestoneMediaError && milestoneMediaError.code !== '23505')
          throw milestoneMediaError
      }

      onSuccess()
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        handleClose()
      }, 1200)
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string' ? err : err?.message || 'Failed to save asset'
      setError(errorMessage)
    } finally {
      setFinalizing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setName('')
    setDescription('')
    setSelectedProject('')
    setSelectedMilestone('')
    setSelectedCollection('')
    setSelectedClient('')
    setUploadedUrl(null)
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[480px] p-0 mx-2 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3E3E3] px-6 py-3">
          <span className="text-[14px] font-medium text-black">New Asset</span>
          <button
            onClick={handleClose}
            className="opacity-20 hover:opacity-60 transition"
            disabled={finalizing}
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
          {/* Mensagem de sucesso */}
          {success && (
            <div className="flex items-center justify-center py-4">
              <span className="text-green-600 font-semibold text-sm">
                ✓ Asset sent successfully!
              </span>
            </div>
          )}
          {/* Indicador de carregamento ao finalizar */}
          {finalizing && !success && (
            <div className="flex items-center justify-center py-4">
              <span className="text-gray-500 text-sm animate-pulse">
                Finalizing...
              </span>
            </div>
          )}
          {/* Upload Area */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Upload File</label>
            <div
              className="border-2 border-dashed border-[#D3D3D3] rounded-2xl p-6 text-center cursor-pointer hover:border-[#999] transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="space-y-2">
                  {file?.type.startsWith('image/') ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded"
                    />
                  ) : file?.type.startsWith('video/') ? (
                    <video
                      src={preview}
                      className="max-h-32 mx-auto rounded"
                      controls
                    />
                  ) : (
                    <div className="text-gray-500">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="text-sm">{safeString(file?.name)}</div>
                    </div>
                  )}
                  {uploading && (
                    <div className="text-xs text-gray-500">Uploading...</div>
                  )}
                  {uploadedUrl && (
                    <div className="text-xs text-green-600">
                      ✓ Uploaded successfully
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-sm">Click to select file</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Name *</label>
            <input
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Asset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Description</label>
            <textarea
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-2xl px-5 py-3 text-[12px] min-h-[60px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Asset description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Client (apenas no Studio Dashboard) */}
          {isStudioDashboard && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-black">Client *</label>
              <select
                className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={loadingData}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {safeString(client.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Project (quando projectId não está definido) */}
          {!projectId && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-black">
                Project {isClientDashboard || isStudioDashboard ? '*' : ''}
              </label>
              <select
                className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={loadingData || (isStudioDashboard && !selectedClient)}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {safeString(project.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Milestone (quando milestoneId não está definido) */}
          {!milestoneId && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-black">Milestone</label>
              <select
                className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
                disabled={loadingData || (!projectId && !selectedProject)}
              >
                <option value="">Select a milestone (optional)</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {safeString(milestone.title)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Collection */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-black">Collection</label>
            <select
              className="bg-[#F3F3F3] border border-[#D3D3D3] rounded-full px-5 py-3 text-[12px] shadow-sm focus:ring-2 focus:ring-black outline-none transition"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              disabled={
                loadingData || (isStudioView && !selectedClient && !clientId)
              }
            >
              <option value="">Select a collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {safeString(collection.name)}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-[10px] text-red-500 font-semibold">
              {safeString(error)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E3E3E3] px-6 py-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-[12px] font-medium text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={
              !uploadedUrl ||
              !name ||
              (isStudioDashboard && !selectedClient) ||
              ((isClientDashboard || isStudioDashboard) && !selectedProject)
            }
            className="px-6 py-2 bg-black text-white text-[12px] font-medium rounded-full hover:bg-gray-800 transition disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
