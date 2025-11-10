'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { uploadProfilePicture } from '@/lib/supabase/storage'

interface ProfilePictureUploaderProps {
  userId: string
  currentImageUrl: string | null
  onUploadSuccess: (url: string) => void
  onUploadError: (error: string) => void
}

export default function ProfilePictureUploader({
  userId,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
}: ProfilePictureUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onUploadError('Only image files are allowed.')
      return
    }

    // Check file size (e.g., max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      onUploadError('File size exceeds 5MB limit.')
      return
    }

    setIsLoading(true)
    setPreviewUrl(URL.createObjectURL(file))

    const { publicUrl, error } = await uploadProfilePicture(file, userId, currentImageUrl)

    if (error) {
      onUploadError(error)
      setPreviewUrl(currentImageUrl) // Revert preview on error
    } else if (publicUrl) {
      onUploadSuccess(publicUrl)
    }
    setIsLoading(false)
  }

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading}
      />
      <div
        className="relative w-32 h-32 rounded-full border-4 border-blue-400 cursor-pointer overflow-hidden shadow-lg group"
        onClick={handleClick}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile Picture"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm text-center p-2 rounded-full">
            Click to upload
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-semibold">Change Photo</span>
        </div>
      </div>
      <p className="text-sm text-gray-500">Max 5MB (JPG, PNG)</p>
    </div>
  )
}
