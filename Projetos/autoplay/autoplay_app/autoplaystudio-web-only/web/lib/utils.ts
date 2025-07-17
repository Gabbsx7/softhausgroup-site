import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '-'
  // Garante que datas UTC/timestampz sejam convertidas corretamente
  const d =
    typeof date === 'string'
      ? new Date(date)
      : date instanceof Date
      ? date
      : null
  if (!d || isNaN(d.getTime())) return '-'
  // Usa toLocaleString para garantir consistência e fuso local
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return formatDate(date)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatBudget(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? Number(value) : value
  if (isNaN(num)) return '-'
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0 })
}

export async function deleteAsset(
  supabase: any,
  assetId: string,
  assetUrl?: string
) {
  try {
    // 1. Remover da tabela project_media
    await supabase.from('project_media').delete().eq('media_id', assetId)

    // 2. Remover da tabela folder_media
    await supabase.from('folder_media').delete().eq('media_id', assetId)

    // 3. Remover do storage se necessário
    if (assetUrl) {
      // Extract bucket and path from URL
      const urlParts = assetUrl.split('/storage/v1/object/public/')
      if (urlParts.length > 1) {
        const [bucket, ...pathParts] = urlParts[1].split('/')
        const filePath = pathParts.join('/')
        await supabase.storage.from(bucket).remove([filePath])
      }
    }

    // 4. Remover da tabela media
    await supabase.from('media').delete().eq('id', assetId)

    return { success: true }
  } catch (error) {
    console.error('Error deleting asset:', error)
    return { success: false, error }
  }
}
