'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useProjectDetails } from '../../../../../../hooks/use-project-data'
import {
  CheckRingIcon,
  TimeProgressIcon,
  PendingIcon,
} from '@/components/icons/sidebar-icons'
import { MilestonesSection, ProjectSidebar } from '@/components/project'
import NewMilestoneModal from '@/components/studioDashboard/NewMilestoneModal'
import { supabase } from '@/lib/supabase/client'
import AssetCardWrapper from '@/components/project/AssetCardWrapper'
import NewAssetModal from '@/components/studioDashboard/NewAssetModal'
import React, { useContext } from 'react'
import { ViewAssetContext } from '@/contexts/ViewAssetContext'
import AssetsHeader from '@/components/common/AssetsHeader'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { projectId, clientId } = params

  // States
  const [openNewMilestoneModal, setOpenNewMilestoneModal] = useState(false)
  const [openNewAssetModal, setOpenNewAssetModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Estados para filtros de assets
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  // Fetch project data
  const {
    project,
    milestones,
    loading: projectLoading,
    error,
    assets,
  } = useProjectDetails(projectId as string)

  const { handleOpenViewAsset } = useContext(ViewAssetContext)

  // Handlers
  const handleCreateMilestone = () => {
    setOpenNewMilestoneModal(true)
  }

  const handleSaveMilestone = async (data: {
    title: string
    description: string
    due_date: string
  }) => {
    if (!projectId) return
    try {
      setLoading(true)
      const { error } = await supabase.from('milestones').insert([
        {
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          project_id: projectId,
          status: 'pending',
        },
      ])
      if (error) throw error
      setOpenNewMilestoneModal(false)
      // Atualizar milestones (reload)
      router.refresh()
    } catch (err) {
      alert('Erro ao criar milestone')
    } finally {
      setLoading(false)
    }
  }

  const handleMilestoneClick = (milestone: any) => {
    router.push(
      `/dashboard/client/${clientId}/project/${projectId}/milestone/${milestone.id}`
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading project
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // No project found
  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Project not found
          </h2>
          <p className="text-gray-600">
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  // Mock data - replace with real data later
  const assetsCount = assets.length
  const foldersCount =
    typeof (project as any).foldersCount === 'number'
      ? (project as any).foldersCount
      : 0

  return (
    <>
      <div className="flex h-screen bg-[#FAFAFA] overflow-y-auto">
        {/* Project Sidebar */}
        <ProjectSidebar onOpenViewAsset={handleOpenViewAsset} />
        {/* Main Content */}
        <div className="flex flex-col flex-1 h-full">
          <div className="flex-1">
            {/* Header Section Figma */}
            <div className="flex flex-row items-start w-full gap-[10px] px-[35px] pt-[40px]">
              <div className="flex flex-col gap-[10px]">
                <span className="text-[24px] font-medium text-black leading-[1.21]">
                  {project.name}
                </span>
                <div className="flex flex-row gap-8 mt-2">
                  <div className="flex flex-col items-start">
                    <span className="text-[16px] font-semibold text-[#222] leading-none">
                      {assetsCount}
                    </span>
                    <span className="text-[10px] font-medium text-[#A5A5A5]">
                      Assets
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[16px] font-semibold text-[#222] leading-none">
                      {foldersCount}
                    </span>
                    <span className="text-[10px] font-medium text-[#A5A5A5]">
                      Folders
                    </span>
                  </div>
                </div>
              </div>
              {/* Botões ou ações à direita podem ficar aqui, se necessário */}
            </div>
            {/* Scrollable Content */}
            <div className="w-full max-w-[1400px] mx-auto">
              <NewMilestoneModal
                open={openNewMilestoneModal}
                onClose={() => setOpenNewMilestoneModal(false)}
                onCreate={handleSaveMilestone}
                projectId={projectId as string}
              />
              <NewAssetModal
                open={openNewAssetModal}
                onClose={() => setOpenNewAssetModal(false)}
                onSuccess={() => setOpenNewAssetModal(false)}
              />
              {/* Milestones Section */}
              <div className="px-[35px] py-[20px]">
                <MilestonesSection
                  milestones={milestones}
                  onCreateMilestone={handleCreateMilestone}
                  onMilestoneClick={handleMilestoneClick}
                />
              </div>

              {/* Assets Section */}
              <div className="px-[35px] py-[20px] bg-[#F8F8F8] min-h-[600px]">
                <div className="flex flex-col gap-6 h-full">
                  <AssetsHeader
                    assetsCount={assets.length}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onCreateAsset={() => setOpenNewAssetModal(true)}
                    selectedFilter={selectedAssetFilter}
                    onFilterChange={setSelectedAssetFilter}
                  />
                  <div className="flex-1">
                    <div className="grid grid-cols-4 gap-6">
                      {assets
                        .filter((asset) =>
                          asset.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((asset) => (
                          <AssetCardWrapper
                            key={asset.id}
                            asset={{
                              id: asset.id,
                              name: asset.name,
                              url: asset.url,
                              thumbnail: asset.thumbnail,
                              status: asset.status,
                              projectMembers:
                                (asset as any).projectMembers || [],
                            }}
                            onApprove={async (id) => {
                              try {
                                await supabase
                                  .from('media')
                                  .update({ status: 'approved' })
                                  .eq('id', id)
                                // Refresh data
                                window.location.reload()
                              } catch (error) {
                                console.error('Error approving asset:', error)
                              }
                            }}
                            onDownload={async (id) => {
                              try {
                                const file = assets.find((a) => a.id === id)
                                if (file?.url) {
                                  // Gerar URL assinada para download
                                  const { data } = await supabase.storage
                                    .from('assets')
                                    .createSignedUrl(file.url, 60)
                                  if (data?.signedUrl) {
                                    window.open(data.signedUrl, '_blank')
                                  } else {
                                    // Fallback para URL direta
                                    window.open(file.url, '_blank')
                                  }
                                }
                              } catch (error) {
                                console.error('Error downloading asset:', error)
                              }
                            }}
                            onReject={async (id) => {
                              try {
                                await supabase
                                  .from('media')
                                  .update({ status: 'rejected' })
                                  .eq('id', id)
                                // Refresh data
                                window.location.reload()
                              } catch (error) {
                                console.error('Error rejecting asset:', error)
                              }
                            }}
                            onDelete={async (id) => {
                              try {
                                const file = assets.find((a) => a.id === id)
                                if (file) {
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
                                  if (file.url) {
                                    // Extract bucket and path from URL
                                    const urlParts = file.url.split(
                                      '/storage/v1/object/public/'
                                    )
                                    if (urlParts.length > 1) {
                                      const [bucket, ...pathParts] =
                                        urlParts[1].split('/')
                                      const filePath = pathParts.join('/')
                                      await supabase.storage
                                        .from(bucket)
                                        .remove([filePath])
                                    }
                                  }

                                  // 4. Remover da tabela media
                                  await supabase
                                    .from('media')
                                    .delete()
                                    .eq('id', id)

                                  // Refresh data
                                  window.location.reload()
                                }
                              } catch (error) {
                                console.error('Error deleting asset:', error)
                              }
                            }}
                            onViewAsset={() => handleOpenViewAsset(asset)}
                            onClick={() => handleOpenViewAsset(asset)}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Botão fixo para asset view */}
      <button
        onClick={() =>
          router.push(
            `/dashboard/client/${clientId}/project/${projectId}/asset`
          )
        }
        style={{
          position: 'fixed',
          top: 80,
          right: 40,
          zIndex: 20,
          background: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '4px 14px',
          fontWeight: 500,
          fontSize: 13,
          minHeight: 28,
          boxShadow: '0 2px 8px rgba(124,58,237,0.10)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#6D28D9')}
        onMouseOut={(e) => (e.currentTarget.style.background = '#7C3AED')}
      >
        Go to asset view
      </button>
    </>
  )
}
