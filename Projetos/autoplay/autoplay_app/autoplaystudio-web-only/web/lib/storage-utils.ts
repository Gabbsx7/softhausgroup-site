import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function getBucketForFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'images'
  if (mimeType.startsWith('video/')) return 'Video'
  return 'uploads'
}

export async function uploadToStorage(
  file: File,
  bucket: string,
  path: string
): Promise<{ data: any; error: any; url?: string }> {
  const supabase = createClientComponentClient()

  try {
    console.log('Uploading to:', {
      bucket,
      path,
      fileName: file.name,
      fileType: file.type,
    })

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) {
      console.error('Storage upload error:', {
        message: error.message,
        bucket,
        path,
        fileType: file.type,
        fileName: file.name,
        error: error,
      })
      return { data: null, error }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    console.log('Upload successful:', {
      bucket,
      path,
      publicUrl: urlData.publicUrl,
    })

    return {
      data,
      error: null,
      url: urlData.publicUrl,
    }
  } catch (err) {
    console.error('Upload error:', err)
    return {
      data: null,
      error: err,
      url: undefined,
    }
  }
}
