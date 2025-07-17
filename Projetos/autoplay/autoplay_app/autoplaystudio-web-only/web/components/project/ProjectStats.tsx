import { useAssets } from '../../hooks/use-assets'

interface ProjectStatsProps {
  foldersCount: number
  assetsCount?: number
  projectId?: string
  clientId?: string
}

export function ProjectStats({
  foldersCount,
  assetsCount,
  projectId,
  clientId,
}: ProjectStatsProps) {
  // Se temos projectId e clientId, buscar dados reais
  const { assets } = useAssets(projectId, clientId)

  // Usar dados reais se disponíveis, senão usar prop
  const realAssetsCount =
    projectId && clientId ? assets.length : assetsCount || 0

  return (
    <div className="mb-8">
      <p className="text-[#A5A5A5] text-sm">
        {foldersCount} Folders {realAssetsCount} Assets
      </p>
    </div>
  )
}
