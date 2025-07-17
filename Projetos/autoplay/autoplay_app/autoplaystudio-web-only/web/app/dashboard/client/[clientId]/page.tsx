'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// Import layout components específicos da página
import QuickSelection from '@/components/layout/QuickSelection'
import SectionHeader from '@/components/layout/SectionHeader'
import { ProjectCard } from '@/components/studioDashboard/ProjectCard'
import NewProjectModal from '@/components/studioDashboard/NewProjectModal'
import AddCardProject from '@/components/studioDashboard/AddCardProject'
import { NewAssetModal } from '@/components/studioDashboard'
import { usePermissions } from '@/components/role-based/permissions'
import Link from 'next/link'
import AssetsHeader from '@/components/common/AssetsHeader'
import { MemberCard } from '@/components/studioDashboard/MemberCard'
import { supabase } from '@/lib/supabase/client'

// Import mock data
import { useAssetsForClient } from '../../../../hooks/use-assets'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AssetCardWrapper } from '@/components/project'
import { useClientData } from '@/hooks/use-client-data'
import { NewMemberModal } from '@/components/studioDashboard'

export default function ClientDashboardPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const supabase = createClientComponentClient()

  // Detecta se é studio
  const { isStudioMember } = usePermissions()
  console.log('isStudioMember:', isStudioMember)

  // Buscar assets reais do Supabase
  const {
    assets: realAssets,
    loading: assetsLoading,
    error: assetsError,
  } = useAssetsForClient(clientId)

  // Buscar projetos reais do Supabase
  const [projects, setProjects] = useState<any[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [clientName, setClientName] = useState<string>('')

  // Função para recarregar projetos
  const fetchProjects = async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      setProjectsError(err.message)
    } finally {
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    const fetchClientName = async () => {
      if (!clientId) return
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single()
      if (!error && data?.name) setClientName(data.name)
    }
    if (clientId) fetchClientName()
  }, [clientId])

  // Estado do modal de novo projeto
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  // Estado do modal de novo asset
  const [newAssetModalOpen, setNewAssetModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)

  // Estados para filtros e busca de assets
  const [assetSearchQuery, setAssetSearchQuery] = useState('')
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All')

  const handleOpenViewAsset = (asset: any) => {
    setSelectedAsset(asset)
  }
  const handleCloseViewAsset = () => {
    setSelectedAsset(null)
  }

  const { role } = usePermissions()
  const {
    teamMembers,
    loading: loadingClientData,
    error: errorClientData,
  } = useClientData()
  console.log('[DEBUG] teamMembers', teamMembers)

  // Handler para deletar membro
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    const { error } = await supabase
      .from('client_users')
      .delete()
      .eq('id', memberId)
    if (error) {
      alert('Error deleting member: ' + error.message)
    } else {
      // Atualizar lista local (reload ou refetch do hook)
      window.location.reload()
    }
  }

  const [showNewMemberModal, setShowNewMemberModal] = useState(false)

  return (
    <div className="flex flex-col gap-2.5 h-full">
      {/* Aviso para studio - forçado para debug */}
      {true && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 px-4 py-2 rounded-md mb-4 mt-2 mx-8 shadow-sm justify-between">
          <span className="text-xs">
            You are viewing the client dashboard as a Studio member.
          </span>
          <Link
            href="/dashboard/stdio"
            className="ml-3 px-2.5 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
          >
            Back to Studio Dashboard
          </Link>
        </div>
      )}
      {/* Quick Selection */}
      <div className="px-[35px] py-5">
        <QuickSelection />
      </div>

      {/* Projects Section */}
      <section className="flex flex-col gap-2.5 px-[35px] py-5">
        {/* Header Figma */}
        <div className="flex items-end justify-between w-full">
          <div className="flex items-end gap-2.5">
            <div className="flex items-center justify-center gap-2.5 py-2.5">
              <span className="text-xl font-medium leading-[24.2px] text-black">
                Projects
              </span>
            </div>
            <div className="flex items-center justify-center gap-2.5 pb-7.5">
              <span className="text-[10px] font-medium leading-[12.1px] text-[#AAAAAA]">
                {projectsLoading ? '...' : projects.length}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 h-full">
            <button
              className="flex items-center justify-center gap-2.5 px-6 py-1.5 bg-white rounded-[50px] hover:bg-gray-50 transition-colors"
              type="button"
              onClick={() => setNewProjectModalOpen(true)}
            >
              <span className="text-xs font-normal leading-[14.52px] text-black">
                + New Project
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {/* Project Cards reais do Supabase */}
          {projectsLoading ? (
            <div className="col-span-3 flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
          ) : projectsError ? (
            <div className="col-span-3 flex items-center justify-center h-full w-full">
              <span className="text-sm text-red-500">{projectsError}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-3 flex items-center justify-center h-full w-full">
              <span className="text-sm text-gray-400">No projects found</span>
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project_id={project.id}
                  title={project.name}
                  client={clientName}
                  category={project.category || '-'}
                  deadline={project.deadline}
                  budget={project.budget}
                  status={project.status_new || 'draft'}
                  description={project.description || '-'}
                />
              ))}
              <AddCardProject onProjectCreated={fetchProjects} />
            </>
          )}
        </div>
      </section>

      {/* Members Section (para client_admin e studio_admin) */}
      {(role === 'client_admin' || role === 'studio_admin') && (
        <section className="flex flex-col gap-2.5 px-[35px] py-5 mt-8">
          <div className="flex items-center justify-between">
            <SectionHeader title="Members" count={teamMembers.length} />
            <button
              className="flex items-center justify-center gap-2.5 px-6 py-1.5 min-w-[150px] bg-white rounded-[50px] hover:bg-gray-50 transition-colors"
              type="button"
              onClick={() => setShowNewMemberModal(true)}
            >
              <span className="text-xs font-normal leading-[14.52px] text-black">
                + Add Member
              </span>
            </button>
          </div>
          {loadingClientData ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
          ) : errorClientData ? (
            <div className="flex items-center justify-center h-24 text-red-500">
              {errorClientData}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400">
              No members found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => {
                const roleLabels: Record<string, string> = {
                  client_admin: 'Client Admin',
                  studio_admin: 'Studio Admin',
                  member: 'Member',
                  client_user: 'Client User',
                  studio_user: 'Studio User',
                }
                const roleLabel =
                  member.role_name && roleLabels[member.role_name]
                    ? roleLabels[member.role_name]
                    : member.role_name || 'Member'
                return (
                  <MemberCard
                    key={member.id || member.email}
                    name={member.name || member.email || 'Unknown'}
                    role={roleLabel}
                    email={member.email || ''}
                    status={member.is_primary ? 'active' : 'inactive'}
                    avatar={member.avatar_url}
                    onViewMember={() =>
                      alert(`View Member: ${member.name || member.email}`)
                    }
                    onDeleteMember={() => handleDeleteMember(member.id)}
                    onDirectChat={() =>
                      alert(`Direct Chat with: ${member.email}`)
                    }
                  />
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Modal de novo projeto */}
      <NewProjectModal
        open={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onCreate={() => setNewProjectModalOpen(false)}
      />

      {/* Modal de novo asset */}
      <NewAssetModal
        open={newAssetModalOpen}
        onClose={() => setNewAssetModalOpen(false)}
        onSuccess={() => {
          setNewAssetModalOpen(false)
          // Recarregar assets se necessário
        }}
      />

      {/* Modal de novo membro */}
      <NewMemberModal
        open={showNewMemberModal}
        onClose={() => setShowNewMemberModal(false)}
        type="client"
        clientId={clientId}
        onMemberCreated={() => {
          setShowNewMemberModal(false)
          // Pode adicionar refetch dos membros se necessário
        }}
      />

      {/* A Collection Section */}
      <section className="flex flex-col gap-2.5 px-[35px] py-5 mt-8">
        <SectionHeader
          title="A Collection"
          count="0"
          buttonText="+ New Collection"
          onButtonClick={() => console.log('New Collection')}
        />
        <div className="flex flex-col h-[200px] items-center justify-center">
          <span className="text-lg text-gray-400 font-semibold">
            Coming Soon
          </span>
        </div>
      </section>

      {/* B Collection Section */}
      <section className="flex flex-col gap-2.5 px-[35px] py-5 mt-8">
        <SectionHeader
          title="B Collection"
          count="0"
          buttonText="+ New Folder"
          onButtonClick={() => console.log('New Folder')}
        />
        <div className="flex flex-col h-[100px] items-center justify-center">
          <span className="text-lg text-gray-400 font-semibold">
            Coming Soon
          </span>
        </div>
      </section>

      {/* Assets Section - Agora com dados reais do Supabase */}
      <section className="flex flex-col gap-2.5 px-[35px] py-5">
        <AssetsHeader
          assetsCount={assetsLoading ? 0 : realAssets.length}
          searchQuery={assetSearchQuery}
          onSearchChange={setAssetSearchQuery}
          onCreateAsset={() => setNewAssetModalOpen(true)}
          selectedFilter={selectedAssetFilter}
          onFilterChange={setSelectedAssetFilter}
        />

        {/* Assets Grid */}
        <div className="grid grid-cols-4 gap-6 items-start">
          {assetsLoading ? (
            // Loading state
            <div className="col-span-4 flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading assets...</p>
              </div>
            </div>
          ) : assetsError ? (
            // Error state
            <div className="col-span-4 flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-sm text-red-500 mb-2">
                  Error loading assets
                </p>
                <p className="text-xs text-gray-400">{assetsError}</p>
              </div>
            </div>
          ) : realAssets.length === 0 ? (
            // Empty state
            <div className="col-span-4 flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">No assets found</p>
                <p className="text-xs text-gray-400">
                  Upload some media to get started
                </p>
              </div>
            </div>
          ) : (
            // Assets from Supabase - with search filter
            realAssets
              .filter((asset: any) =>
                asset.name
                  .toLowerCase()
                  .includes(assetSearchQuery.toLowerCase())
              )
              .map((asset: any) => (
                <AssetCardWrapper
                  key={asset.id}
                  asset={{
                    id: asset.id,
                    name: asset.name,
                    url: asset.originalData?.file_url || asset.url || '',
                    thumbnail:
                      asset.previewImage ||
                      asset.originalData?.file_url ||
                      asset.url ||
                      '',
                    status: (asset.status || 'pending') as
                      | 'approved'
                      | 'pending'
                      | 'rejected',
                    projectMembers: asset.projectMembers || [],
                  }}
                  onApprove={async (id) => {
                    try {
                      // TODO: Implementar aprovação
                      console.log('Approve asset:', id)
                    } catch (error) {
                      console.error('Error approving asset:', error)
                    }
                  }}
                  onDownload={async (id) => {
                    try {
                      const assetToDownload = realAssets.find(
                        (a: any) => a.id === id
                      )
                      if (assetToDownload?.originalData?.file_url) {
                        window.open(
                          assetToDownload.originalData.file_url,
                          '_blank'
                        )
                      }
                    } catch (error) {
                      console.error('Error downloading asset:', error)
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      const assetToDelete = realAssets.find(
                        (a: any) => a.id === id
                      )
                      if (!assetToDelete) throw new Error('Asset not found')
                      const { supabase } = await import('@/lib/supabase/client')

                      // 1. Remover da tabela project_media
                      await supabase
                        .from('project_media')
                        .delete()
                        .eq('media_id', id)

                      // 2. Remover da tabela folder_media
                      await supabase
                        .from('folder_media')
                        .delete()
                        .eq('media_id', id)

                      // 3. Remover do storage se necessário
                      const fileUrl =
                        assetToDelete.originalData?.file_url ||
                        assetToDelete.url
                      if (fileUrl) {
                        const urlParts = fileUrl.split(
                          '/storage/v1/object/public/'
                        )
                        if (urlParts.length > 1) {
                          const [bucket, ...pathParts] = urlParts[1].split('/')
                          const filePath = pathParts.join('/')
                          await supabase.storage.from(bucket).remove([filePath])
                        }
                      }

                      // 4. Remover da tabela media
                      await supabase.from('media').delete().eq('id', id)

                      // Refresh assets
                      window.location.reload()
                    } catch (error: any) {
                      console.error('Error deleting asset:', error)
                      alert(
                        'Error deleting asset: ' +
                          (error?.message || String(error))
                      )
                    }
                  }}
                  onViewAsset={() => handleOpenViewAsset(asset)}
                  onClick={() => handleOpenViewAsset(asset)}
                />
              ))
          )}
        </div>
      </section>

      {/* View Asset Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              View Asset: {selectedAsset.name}
            </h3>
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={selectedAsset.url || selectedAsset.originalData?.file_url}
                alt={selectedAsset.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseViewAsset}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
