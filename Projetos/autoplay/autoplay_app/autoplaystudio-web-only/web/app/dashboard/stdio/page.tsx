'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { TopBar } from '@/components/common/TopBar'
import {
  WelcomeBanner,
  SectionHeader,
  ClientCard,
  AddCardClient,
  ProjectCard,
  AddCardProject,
  MemberCard,
  AssetCard,
  AddCardTeam,
} from '@/components/studioDashboard'
import {
  useStudioDashboard,
  StudioDashboardClient,
  StudioDashboardProject,
} from '../../../hooks/use-studio-dashboard'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useAssetsRealtime } from '../../../hooks/use-assets'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import NewAssetModal from '@/components/studioDashboard/NewAssetModal'
import NewMemberModal from '@/components/studioDashboard/NewMemberModal'
import { usePermissions } from '@/components/role-based/permissions'
import AssetsHeader from '@/components/common/AssetsHeader'
import ViewAsset from '@/components/project/ViewAsset'
import CollectionCard from '@/components/dashboard/CollectionCard'

function formatDeadline(dateStr?: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return format(date, 'd MMMM, yyyy', { locale: enUS })
}

function formatBudget(budget?: string) {
  if (!budget) return '-'
  // Remove non-numeric chars, parse, format with dot as thousands separator
  const num = Number(budget.toString().replace(/[^\d]/g, ''))
  if (isNaN(num)) return '-'
  return `$${num.toLocaleString('en-US').replace(/,/g, '.')}`
}

export default function StudioPage() {
  const { clients, projects, loading, error, refetch } = useStudioDashboard()
  const { studioId } = usePermissions()

  // Assets realtime hook (studio)
  const {
    assets: assetsAll,
    loading: assetsLoading,
    error: assetsError,
  } = useAssetsRealtime()

  // Local state para permitir remoção otimista
  const [localAssets, setLocalAssets] = React.useState<any[]>([])

  React.useEffect(() => {
    setLocalAssets(assetsAll)
  }, [assetsAll])

  const handleClientCreated = () => {
    refetch()
  }

  const handleDeleteAsset = async (id: string) => {
    const supabase = createClientComponentClient()
    const asset = localAssets.find((a) => a.id === id)
    if (!asset) return

    try {
      // 1. Deletar da tabela project_media
      await supabase.from('project_media').delete().eq('media_id', id)

      // 2. Deletar da tabela folder_media
      await supabase.from('folder_media').delete().eq('media_id', id)

      // 3. Deletar do storage
      if (asset.file_url) {
        const urlParts = asset.file_url.split('/object/')[1]?.split('/')
        const bucket = urlParts?.[0]
        const filePath = urlParts?.slice(1).join('/')
        if (bucket && filePath) {
          await supabase.storage.from(bucket).remove([filePath])
        }
      }

      // 4. Deletar da tabela media
      await supabase.from('media').delete().eq('id', id)

      // 5. Remover do estado local
      setLocalAssets((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const [assetModalOpen, setAssetModalOpen] = React.useState(false)
  const [viewAssetOpen, setViewAssetOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)

  // Estados para filtros e busca de assets
  const [assetSearchQuery, setAssetSearchQuery] = useState('')
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('All')

  // Handler para abrir modal ao clicar no botão '+ Create new asset'
  const handleAssetModalOpen = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      // Garante que é o botão correto pelo texto
      if (
        target &&
        (target.textContent === '+ Create new asset' ||
          target.innerText === '+ Create new asset')
      ) {
        setAssetModalOpen(true)
      }
    },
    []
  )

  const handleOpenViewAsset = (asset: any) => {
    setSelectedAsset(asset)
    setViewAssetOpen(true)
  }
  const handleCloseViewAsset = () => {
    setViewAssetOpen(false)
    setSelectedAsset(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar sticky */}
      <div className="sticky top-0 h-screen z-10 overflow-y-auto">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <TopBar />
        {/* Main Content */}
        <div className="pt-12 ml-0 lg:ml-0">
          <div className="p-8">
            {/* Quick Selection */}
            <WelcomeBanner />

            {/* Clients Section */}
            <div className="mb-8">
              <SectionHeader title="Clients" count={clients.length} />
              <div className="grid grid-cols-3 gap-6">
                {loading && (
                  <div className="col-span-3 text-center py-8 text-gray-400">
                    Loading clients...
                  </div>
                )}
                {error && (
                  <div className="col-span-3 text-center py-8 text-red-500">
                    {error}
                  </div>
                )}
                {!loading &&
                  !error &&
                  clients.map((client: StudioDashboardClient) => (
                    <ClientCard
                      key={client.client_id}
                      client_id={client.client_id}
                      name={client.client_name}
                      description={client.client_description}
                      isActive={client.is_active}
                    />
                  ))}
                <AddCardClient onClientCreated={handleClientCreated} />
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <SectionHeader title="Projects" count={projects.length} />
              <div className="grid grid-cols-3 gap-6">
                {loading && (
                  <div className="col-span-3 text-center py-8 text-gray-400">
                    Loading projects...
                  </div>
                )}
                {error && (
                  <div className="col-span-3 text-center py-8 text-red-500">
                    {error}
                  </div>
                )}
                {!loading &&
                  !error &&
                  projects.map((project: StudioDashboardProject) => (
                    <ProjectCard
                      key={project.project_id}
                      project_id={project.project_id}
                      title={project.project_name}
                      client={project.client_name}
                      category={project.category || '-'}
                      deadline={formatDeadline(project.deadline)}
                      budget={formatBudget(project.budget)}
                      status={project.status || 'draft'}
                      description={project.project_description}
                      client_id={project.client_id}
                    />
                  ))}
                <AddCardProject />
              </div>
            </div>

            {/* Members Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Members" count={8} />
                <button
                  className="flex items-center gap-2 px-[15px] py-[6px] bg-white text-black rounded-full text-[12px] font-normal shadow-sm border border-gray-200"
                  onClick={() => setShowNewMemberModal(true)}
                >
                  <span className="text-lg leading-none">+</span> Add Member
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MemberCard
                  name="Gabriel H"
                  role="Creative Director"
                  email="gabriel@autoplay.studio"
                  status="active"
                />
                <MemberCard
                  name="Sarah Johnson"
                  role="Video Editor"
                  email="sarah@autoplay.studio"
                  status="active"
                />
                <MemberCard
                  name="Mike Chen"
                  role="3D Artist"
                  email="mike@autoplay.studio"
                  status="inactive"
                />
                {/* Adicione mais MemberCards conforme necessário */}
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-8">
              <SectionHeader title="Team" count={3} />
              <div className="grid grid-cols-3 gap-6">
                <MemberCard
                  name="Production Team"
                  role="Video Production"
                  email="6 members"
                  status="active"
                />
                <MemberCard
                  name="Design Team"
                  role="Brand & Identity"
                  email="4 members"
                  status="active"
                />
                <MemberCard
                  name="Strategy Team"
                  role="Creative Strategy"
                  email="3 members"
                  status="active"
                />
                <AddCardTeam />
              </div>
            </div>

            {/* Templates Section */}
            <div className="mb-8">
              <SectionHeader title="Templates" count={0} />
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-lg text-gray-400 font-semibold">
                      Coming Soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collections Section */}
            <div className="mb-8">
              <SectionHeader title="Collections" count={0} />
              <CollectionsSection />
            </div>

            {/* Assets Section */}
            <div className="mb-8 flex flex-col gap-2.5 px-[35px] py-5">
              <AssetsHeader
                assetsCount={assetsLoading ? 0 : localAssets.length}
                searchQuery={assetSearchQuery}
                onSearchChange={setAssetSearchQuery}
                onCreateAsset={() => setAssetModalOpen(true)}
                selectedFilter={selectedAssetFilter}
                onFilterChange={setSelectedAssetFilter}
              />

              {(() => {
                if (assetsLoading) {
                  return (
                    <div className="col-span-4 flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">
                          Loading assets...
                        </p>
                      </div>
                    </div>
                  )
                }
                if (assetsError) {
                  return (
                    <div className="col-span-4 flex items-center justify-center h-32">
                      <div className="text-center">
                        <p className="text-sm text-red-500 mb-2">
                          Error loading assets
                        </p>
                        <p className="text-xs text-gray-400">{assetsError}</p>
                      </div>
                    </div>
                  )
                }
                if (localAssets.length === 0) {
                  return (
                    <div className="col-span-4 flex items-center justify-center h-32">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          No assets found
                        </p>
                        <p className="text-xs text-gray-400">
                          Upload some media to get started
                        </p>
                      </div>
                    </div>
                  )
                }
                return (
                  <div className="grid grid-cols-4 gap-x-1 gap-y-2 items-start">
                    {localAssets
                      .filter((asset: any) =>
                        (
                          asset.title ||
                          asset.file_url?.split('/').pop() ||
                          'Unnamed Asset'
                        )
                          .toLowerCase()
                          .includes(assetSearchQuery.toLowerCase())
                      )
                      .map((asset: any) => {
                        // Normalização igual ao AssetCardWrapper
                        function getAssetType(asset: any) {
                          if (asset.mime_type) {
                            if (asset.mime_type.startsWith('image/'))
                              return 'image'
                            if (asset.mime_type.startsWith('video/'))
                              return 'video'
                            if (asset.mime_type === 'application/pdf')
                              return 'pdf'
                            if (
                              asset.mime_type ===
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            )
                              return 'docx'
                          }
                          const url = (asset.file_url || '').toLowerCase()
                          if (
                            url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)
                          )
                            return 'image'
                          if (
                            url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/)
                          )
                            return 'video'
                          if (url.match(/\.pdf$/)) return 'pdf'
                          if (url.match(/\.docx$/)) return 'docx'
                          return 'document'
                        }
                        const type = getAssetType(asset)
                        const transformedAsset = {
                          id: asset.id?.toString() || '',
                          name:
                            asset.title ||
                            asset.file_url?.split('/').pop() ||
                            'Unnamed Asset',
                          url: asset.file_url || '',
                          thumbnail:
                            type === 'image' ? asset.file_url : undefined,
                          status: (asset.status || 'pending') as
                            | 'approved'
                            | 'pending'
                            | 'rejected',
                          projectMembers: [] as any[],
                          type,
                          mime_type: asset.mime_type || '',
                        }
                        console.log('[STDIO AssetCard] asset:', asset)
                        console.log(
                          '[STDIO AssetCard] transformed:',
                          transformedAsset
                        )
                        return (
                          <AssetCard
                            key={transformedAsset.id}
                            asset={transformedAsset}
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
                                const assetToDownload = localAssets.find(
                                  (a: any) => a.id?.toString() === id
                                )
                                if (assetToDownload?.file_url) {
                                  window.open(
                                    assetToDownload.file_url,
                                    '_blank'
                                  )
                                }
                              } catch (error) {
                                console.error('Error downloading asset:', error)
                              }
                            }}
                            onReject={async (id) => {
                              try {
                                // TODO: Implementar rejeição
                                console.log('Reject asset:', id)
                              } catch (error) {
                                console.error('Error rejecting asset:', error)
                              }
                            }}
                            onDelete={handleDeleteAsset}
                            onViewAsset={() =>
                              handleOpenViewAsset(transformedAsset)
                            }
                            onClick={() =>
                              handleOpenViewAsset(transformedAsset)
                            }
                          />
                        )
                      })}
                  </div>
                )
              })()}
              <NewAssetModal
                open={assetModalOpen}
                onClose={() => setAssetModalOpen(false)}
                onSuccess={() => setAssetModalOpen(false)}
              />
              <ViewAsset
                open={viewAssetOpen}
                onClose={handleCloseViewAsset}
                asset={selectedAsset || { url: '' }}
              />
              <NewMemberModal
                open={showNewMemberModal}
                onClose={() => setShowNewMemberModal(false)}
                type="studio"
                studioId={studioId || undefined}
                onMemberCreated={() => {
                  setShowNewMemberModal(false)
                  refetch() // Atualizar dados do dashboard
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- NOVO COMPONENTE PARA BUSCAR E EXIBIR AS COLLECTIONS ---
function CollectionsSection() {
  const [collections, setCollections] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchCollections() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClientComponentClient()
        // Busca todas as collections reais da tabela 'collections'
        const { data, error } = await supabase
          .from('collections')
          .select('id, name, description, client_id')
          .order('created_at', { ascending: false })
        if (error) throw error
        setCollections(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-gray-400 font-semibold">
          Loading collections...
        </span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-red-500 font-semibold">{error}</span>
      </div>
    )
  }
  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <span className="text-lg text-gray-400 font-semibold">
          No collections found
        </span>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {collections.map((col) => (
        <CollectionCard
          key={col.id}
          id={col.id}
          title={col.name}
          description={col.description || ''}
          onViewFolder={() => {
            window.location.href = `/dashboard/collection/${col.id}`
          }}
          onNewItem={() => {
            alert('New Folder (em breve)')
          }}
        />
      ))}
    </div>
  )
}
