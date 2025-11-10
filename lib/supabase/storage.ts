'use client'

import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface FileUploadResult {
  publicUrl: string | null
  error: string | null
}

export async function uploadProfilePicture(
  file: File,
  userId: string,
  currentPhotoPath?: string | null
): Promise<FileUploadResult> {
  const supabase = createClient()
  const bucketName = 'profile-pictures'

  if (!file) {
    return { publicUrl: null, error: 'No file selected' }
  }

  // Generate a unique file path within the user's folder
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${uuidv4()}.${fileExt}`

  try {
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Do not overwrite by default, generate new UUID
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { publicUrl: null, error: error.message }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)
    
    if (!publicUrlData.publicUrl) {
      return { publicUrl: null, error: 'Could not get public URL after upload' }
    }

    // Optional: Delete the old profile picture if it exists and is different
    if (currentPhotoPath) {
      const oldFilePathMatch = currentPhotoPath.match(/profile-pictures\/(.*)$/)
      const oldFilePath = oldFilePathMatch ? oldFilePathMatch[1] : null

      if (oldFilePath && oldFilePath !== filePath) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFilePath])
        if (deleteError) {
          console.warn('Could not delete old profile picture:', deleteError.message)
        }
      }
    }

    return { publicUrl: publicUrlData.publicUrl, error: null }
  } catch (error: any) {
    console.error('Unexpected upload error:', error)
    return { publicUrl: null, error: error.message || 'An unexpected error occurred during upload' }
  }
}

export async function uploadCardBackground(
  file: File,
  userId: string,
  currentPhotoPath?: string | null
): Promise<FileUploadResult> {
  const supabase = createClient()
  const bucketName = 'card-backgrounds'

  if (!file) {
    return { publicUrl: null, error: 'No file selected' }
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${uuidv4()}.${fileExt}`

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase background upload error:', error)
      return { publicUrl: null, error: error.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!publicUrlData.publicUrl) {
      return { publicUrl: null, error: 'Could not get public URL after background upload' }
    }

    // Optional: Delete the old background image if it exists and is different
    if (currentPhotoPath) {
      // Extract path relative to bucket root
      const oldFilePathMatch = currentPhotoPath.match(/card-backgrounds\/(.*)$/)
      const oldFilePath = oldFilePathMatch ? oldFilePathMatch[1] : null

      if (oldFilePath && oldFilePath !== filePath) {
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFilePath])
        if (deleteError) {
          console.warn('Could not delete old background image:', deleteError.message)
        }
      }
    }

    return { publicUrl: publicUrlData.publicUrl, error: null }
  } catch (error: any) {
    console.error('Unexpected background upload error:', error)
    return { publicUrl: null, error: error.message || 'An unexpected error occurred during background upload' }
  }
}
