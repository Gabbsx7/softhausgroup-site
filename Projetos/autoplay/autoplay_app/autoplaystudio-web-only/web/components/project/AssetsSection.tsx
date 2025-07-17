import { Plus, Search } from 'lucide-react'
import AssetCardWrapper from './AssetCardWrapper'
import { useAssets, AssetWithUsers } from '../../hooks/use-assets'

interface AssetsSectionProps {
  projectId?: string
  clientId?: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onUploadAsset?: () => void
  onAssetClick?: (asset: AssetWithUsers) => void
}

export function AssetsSection({
  projectId,
  clientId,
  searchQuery,
  onSearchChange,
  onUploadAsset,
  onAssetClick,
}: AssetsSectionProps) {
  const { assets, loading, error, approveAsset, downloadAsset } = useAssets(
    projectId,
    clientId
  )

  // Filter assets based on search
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApprove = async (assetId: string) => {
    try {
      await approveAsset(assetId)
    } catch (error) {
      console.error('Error approving asset:', error)
    }
  }

  const handleDownload = async (asset: AssetWithUsers) => {
    try {
      await downloadAsset(asset)
    } catch (error) {
      console.error('Error downloading asset:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading assets: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
        <button
          onClick={onUploadAsset}
          className="flex items-center gap-2 px-3 py-2 bg-white text-xs text-black rounded-3xl hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Upload Asset
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search assets and files"
          className="w-96 pl-10 pr-4 py-3 border border-gray-300 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredAssets.map((asset) => (
          <AssetCardWrapper
            key={asset.id}
            asset={asset}
            onClick={() => onAssetClick?.(asset)}
            onDownload={() => handleDownload(asset)}
            onApprove={() => handleApprove(asset.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assets found
          </h3>
          <p className="text-gray-600">
            Try searching with different terms or clear the search filter.
          </p>
        </div>
      )}

      {/* Empty State - No Assets */}
      {assets.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assets found
          </h3>
          <p className="text-gray-600 mb-4">
            Upload your first asset to get started.
          </p>
        </div>
      )}
    </div>
  )
}
