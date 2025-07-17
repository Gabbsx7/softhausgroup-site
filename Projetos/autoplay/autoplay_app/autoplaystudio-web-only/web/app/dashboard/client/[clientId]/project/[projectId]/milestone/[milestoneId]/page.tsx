'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Clock, Circle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import TaskCard from '@/components/project/TaskCard'
import ViewAsset from '@/components/project/ViewAsset'
import AssetCardWrapper from '@/components/project/AssetCardWrapper'
import AssetsHeader from '@/components/common/AssetsHeader'
import { NewAssetModal } from '@/components/studioDashboard'
import { MilestoneSidebar } from '@/components/project'
import { useProjectDetails } from '../../../../../../../../hooks/use-project-data'
import AddAssetModal from '@/components/project/AddAssetModal'
import NewTaskModal from '@/components/project/NewTaskModal'

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

interface Milestone {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  project_id: string
  created_at: string
}

export default function MilestonePage() {
  const params = useParams()
  const router = useRouter()
  const { clientId, projectId, milestoneId } = params

  // States
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assetsCount, setAssetsCount] = useState(0)
  const [foldersCount, setFoldersCount] = useState(0)
  const [viewAssetOpen, setViewAssetOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)

  // Estados para assets
  const [assets, setAssets] = useState<any[]>([])
  const [assetSearchQuery, setAssetSearchQuery] = useState('')
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All')
  const [openNewAssetModal, setOpenNewAssetModal] = useState(false)

  // Estado para AddAssetModal
  const [openAddAssetModal, setOpenAddAssetModal] = useState(false)

  // Estado para NewTaskModal
  const [openNewTaskModal, setOpenNewTaskModal] = useState(false)
  const [members, setMembers] = useState<{ id: string; name: string }[]>([])

  // Buscar milestones do projeto
  const { milestones: allMilestones } = useProjectDetails(projectId as string)

  // Navegação entre milestones
  function handleSelectMilestone(id: string) {
    if (id !== milestoneId) {
      router.push(
        `/dashboard/client/${clientId}/project/${projectId}/milestone/${id}`
      )
    }
  }

  // Fetch milestone and tasks data
  useEffect(() => {
    async function fetchMilestoneData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch milestone data
        const { data: milestoneData, error: milestoneError } = await supabase
          .from('milestones')
          .select('*')
          .eq('id', milestoneId)
          .single()

        if (milestoneError) {
          throw new Error(`Error fetching milestone: ${milestoneError.message}`)
        }

        setMilestone(milestoneData)

        // Buscar projeto para obter client_id
        const { data: projectData } = await supabase
          .from('projects')
          .select('client_id')
          .eq('id', milestoneData.project_id)
          .single()

        // Buscar membros do projeto (client_users)
        if (projectData?.client_id) {
          const { data: clientUsers } = await supabase
            .from('client_users')
            .select('user:users(id,name)')
            .eq('client_id', projectData.client_id)
          setMembers(
            (clientUsers || []).map((cu: any) => ({
              id: cu.user?.id,
              name: cu.user?.name || 'Sem nome',
            }))
          )
        }

        // Fetch milestone tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('milestone_tasks')
          .select('*')
          .eq('milestone_id', milestoneId)
          .order('created_at', { ascending: true })

        if (tasksError) {
          console.warn('Error fetching tasks:', tasksError.message)
        } else {
          setTasks(tasksData || [])
        }

        // Fetch milestone assets via milestone_media (join com media)
        const { data: milestoneMedia, error: mmError } = await supabase
          .from('milestone_media')
          .select('media:media_id(*)')
          .eq('milestone_id', milestoneId)

        if (mmError) {
          console.warn('Error fetching milestone_media:', mmError.message)
        } else {
          const milestoneAssets = (milestoneMedia || [])
            .map((mm: any) => mm.media)
            .filter(Boolean)
          setAssetsCount(milestoneAssets.length)
          setAssets(
            milestoneAssets.map((asset) => ({
              id: asset.id.toString(),
              name: asset.title || 'Unnamed Asset',
              url: asset.file_url || '',
              thumbnail: asset.mime_type?.startsWith('image/')
                ? asset.file_url
                : undefined,
              status: (asset.status || 'pending') as
                | 'approved'
                | 'pending'
                | 'rejected',
              projectMembers: [],
            }))
          )
        }

        // Mock data for folders for now
        setFoldersCount(4)
      } catch (error) {
        console.error('Error fetching milestone data:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (milestoneId) {
      fetchMilestoneData()
    }
  }, [milestoneId])

  const handleDescriptionChange = async (
    taskId: string,
    description: string
  ) => {
    try {
      const { error } = await supabase
        .from('milestone_tasks')
        .update({ description })
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task description:', error)
        return
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, description } : task
        )
      )
    } catch (error) {
      console.error('Error updating task description:', error)
    }
  }

  const handleOpenViewAsset = (asset: any) => {
    setSelectedAsset(asset)
    setViewAssetOpen(true)
  }
  const handleCloseViewAsset = () => {
    setViewAssetOpen(false)
    setSelectedAsset(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading milestone...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading milestone
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // No milestone found
  if (!milestone) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Milestone not found
          </h2>
          <p className="text-gray-600 mb-4">
            The milestone you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAFAFA] pt-16">
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
      {/* Sidebar Milestone Context */}
      <MilestoneSidebar
        milestone={{
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          category: 'CGI',
          deadline: milestone.due_date || '14 April, 2025',
          budget: (milestone as any).budget || '$45,000',
          status: milestone.status,
          members: [
            { id: '1', name: 'Alice' },
            { id: '2', name: 'Bob' },
            { id: '3', name: 'Carol' },
          ],
        }}
        milestones={(
          allMilestones as { id: string; title: string; status: string }[]
        ).map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status as
            | 'pending'
            | 'in_progress'
            | 'completed'
            | 'cancelled',
        }))}
        onSelectMilestone={handleSelectMilestone}
        tasks={tasks.map((task) => ({
          id: task.id,
          name: task.name,
          status: task.status,
        }))}
        assets={assets}
        onAddTask={() => setOpenNewTaskModal(true)}
      />

      {/* Main Content */}
      <div className="ml-[265px] min-h-screen">
        {/* Header Section - Figma Faithful */}
        <div className="mb-8 px-[35px] pt-[40px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col gap-[10px]">
              <span className="text-[24px] font-medium text-black leading-[1.21]">
                {milestone.title}
              </span>
              <div className="flex flex-row items-center gap-[10px]">
                <div className="flex flex-row gap-[10px]">
                  <span className="text-[10px] font-medium text-[#A5A5A5]">
                    {foldersCount} Folders
                  </span>
                </div>
                <div className="flex flex-row gap-[10px] opacity-50">
                  <span className="text-[10px] font-medium text-[#A5A5A5]">
                    {assetsCount} Assets
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tasks Section - Figma Faithful */}
        <div className="mb-8 px-[35px] py-[20px] bg-[#F8F8F8]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-end justify-between">
              <div className="flex items-end">
                <div className="flex items-center gap-[10px] py-[10px]">
                  <span className="text-[14px] font-medium text-black">
                    Tasks
                  </span>
                </div>
                <div className="flex items-center gap-[10px] pb-[30px]">
                  <span className="text-[10px] font-medium text-[#AAAAAA]">
                    {tasks.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setOpenNewTaskModal(true)}
                  className="flex items-center gap-[10px] px-[24px] py-[6px] bg-white rounded-[50px] text-[12px] font-normal text-black hover:bg-gray-50 transition-colors mb-4"
                >
                  + Add Task
                </button>
              </div>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                Create the first task to start organizing the milestone.
              </p>
              <button
                onClick={() => setOpenNewTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          ) : (
            <div className="flex justify-stretch items-stretch gap-[10px]">
              {/* Coluna 1 */}
              <div className="flex flex-col gap-[10px] flex-1">
                {tasks
                  .filter((_, idx) => idx % 2 === 0)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={() => {}}
                      onDescriptionChange={handleDescriptionChange}
                      members={members}
                    />
                  ))}
              </div>
              {/* Coluna 2 */}
              <div className="flex flex-col gap-[10px] flex-1">
                {tasks
                  .filter((_, idx) => idx % 2 === 1)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={() => {}}
                      onDescriptionChange={handleDescriptionChange}
                      members={members}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Assets Section */}
        <div className="mb-8 px-[35px]">
          <AssetsHeader
            assetsCount={assets.length}
            searchQuery={assetSearchQuery}
            onSearchChange={setAssetSearchQuery}
            onCreateAsset={() => setOpenAddAssetModal(true)} // Troca para Add Asset
            selectedFilter={selectedAssetFilter}
            onFilterChange={setSelectedAssetFilter}
          />
          {/* Assets Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {assets.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">No assets found</p>
                  <p className="text-xs text-gray-400">
                    Upload some media for this milestone
                  </p>
                </div>
              </div>
            ) : (
              assets
                .filter((asset) =>
                  asset.name
                    .toLowerCase()
                    .includes(assetSearchQuery.toLowerCase())
                )
                .map((asset) => (
                  <AssetCardWrapper
                    key={asset.id}
                    asset={asset}
                    onApprove={async (id) => {
                      try {
                        await supabase
                          .from('media')
                          .update({ status: 'approved' })
                          .eq('id', id)
                        // Refresh assets
                        window.location.reload()
                      } catch (error) {
                        console.error('Error approving asset:', error)
                      }
                    }}
                    onDownload={async (id) => {
                      try {
                        const asset = assets.find((a) => a.id === id)
                        if (asset?.url) {
                          window.open(asset.url, '_blank')
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
                        // Refresh assets
                        window.location.reload()
                      } catch (error) {
                        console.error('Error rejecting asset:', error)
                      }
                    }}
                    onDelete={async (id) => {
                      try {
                        const asset = assets.find((a) => a.id === id)
                        if (asset) {
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
                          if (asset.url) {
                            // Extract bucket and path from URL
                            const urlParts = asset.url.split(
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
                          await supabase.from('media').delete().eq('id', id)

                          // Refresh assets
                          window.location.reload()
                        }
                      } catch (error) {
                        console.error('Error deleting asset:', error)
                      }
                    }}
                    onViewAsset={() => handleOpenViewAsset(asset)}
                    onClick={() => handleOpenViewAsset(asset)}
                  />
                ))
            )}
          </div>
        </div>
        {/* Modals */}
        <NewAssetModal
          open={openNewAssetModal}
          onClose={() => setOpenNewAssetModal(false)}
          onSuccess={() => {
            setOpenNewAssetModal(false)
            // Refresh assets
            window.location.reload()
          }}
        />
        <AddAssetModal
          open={openAddAssetModal}
          onClose={() => setOpenAddAssetModal(false)}
          onSuccess={() => {
            setOpenAddAssetModal(false)
            // Refresh assets
            window.location.reload()
          }}
          projectId={projectId as string}
          milestoneId={milestoneId as string}
        />
        <NewTaskModal
          open={openNewTaskModal}
          onClose={() => setOpenNewTaskModal(false)}
          onSuccess={async () => {
            setOpenNewTaskModal(false)
            // Refetch tasks
            // (poderia ser mais eficiente, mas para garantir, recarrega a página)
            window.location.reload()
          }}
          milestoneId={milestoneId as string}
          projectId={projectId as string}
        />
        <ViewAsset
          open={viewAssetOpen}
          onClose={handleCloseViewAsset}
          asset={
            selectedAsset || {
              id: '',
              url: '',
              name: '',
              type: 'image' as const,
            }
          }
        />
      </div>
    </div>
  )
}
