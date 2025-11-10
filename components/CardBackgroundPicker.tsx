'use client'

import { useState, ChangeEvent, useRef } from 'react'
import Image from 'next/image'
import { uploadCardBackground } from '@/lib/supabase/storage'
import { CardFormData } from '@/types/database'

interface CardBackgroundPickerProps {
  userId: string
  formData: CardFormData
  setFormData: React.Dispatch<React.SetStateAction<CardFormData>>
  setError: (message: string) => void
}

// Predefined solid colors
const solidColors = [
  '#FFC0CB', // Pink
  '#ADD8E6', // Light Blue
  '#90EE90', // Light Green
  '#FFD700', // Gold
  '#D3D3D3', // Light Gray
  '#FFFFFF', // White
  '#000000', // Black
  '#800080', // Purple
  '#FFA500', // Orange
  '#FF4500', // OrangeRed
]

// Predefined gradients (TailwindCSS classes)
const gradients = [
  'from-blue-500 to-purple-600', // Original default
  'from-green-400 to-blue-500',
  'from-yellow-400 to-red-500',
  'from-pink-500 to-purple-500',
  'from-gray-700 to-gray-900',
  'from-teal-300 to-blue-500',
  'from-red-500 to-orange-500',
  'from-indigo-500 to-blue-500',
]

export default function CardBackgroundPicker({
  userId,
  formData,
  setFormData,
  setError,
}: CardBackgroundPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'gradient' | 'color' | 'image'>(formData.background_type || 'gradient')

  const handleBackgroundChange = (type: CardFormData['background_type'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      background_type: type,
      background_value: value,
    }))
    setError('') // Clear any previous errors
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed for background.')
      return
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setError('Background image size exceeds 5MB limit.')
      return
    }

    setIsLoading(true)
    setError('')

    const { publicUrl, error } = await uploadCardBackground(file, userId, formData.background_value)

    if (error) {
      setError(error)
      // On error, revert to a default gradient
      handleBackgroundChange('gradient', 'from-blue-500 to-purple-600')
    } else if (publicUrl) {
      handleBackgroundChange('image', publicUrl)
    }
    setIsLoading(false)
  }

  const handleImageClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  const handleDarkModeToggle = () => {
    setFormData((prev) => ({ ...prev, dark_mode: !prev.dark_mode }))
  }

  return (
    <div className="space-y-6">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
        <label htmlFor="dark-mode-toggle" className="text-lg font-medium text-gray-900">Enable Dark Mode</label>
        <button
          id="dark-mode-toggle"
          type="button"
          onClick={handleDarkModeToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${formData.dark_mode ? 'bg-blue-600' : 'bg-gray-200'}`}
          role="switch"
          aria-checked={formData.dark_mode}
        >
          <span className="sr-only">Toggle Dark Mode</span>
          <span
            aria-hidden="true"
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.dark_mode ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {/* Background Picker Tabs */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-3">Card Background</label>
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'gradient' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('gradient')}
          >
            Gradient
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'color' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('color')}
          >
            Solid Color
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'image' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('image')}
          >
            Image
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'gradient' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {gradients.map((gradient, index) => (
                <button
                  type="button"
                  key={index}
                  className={`relative h-16 w-full rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 border-2 ${formData.background_type === 'gradient' && formData.background_value === gradient ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
                  onClick={() => handleBackgroundChange('gradient', gradient)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
                </button>
              ))}
            </div>
            {/* Custom Gradient Input */}
            <div>
              <label htmlFor="custom-gradient" className="block text-sm font-medium text-gray-700 mb-1">Custom Gradient (TailwindCSS classes)</label>
              <input
                type="text"
                id="custom-gradient"
                value={formData.background_type === 'gradient' ? formData.background_value : ''}
                onChange={(e) => handleBackgroundChange('gradient', e.target.value)}
                placeholder="e.g., from-red-400 to-yellow-500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Enter TailwindCSS gradient classes (e.g., from-purple-400 to-pink-600).</p>
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-3">
              {solidColors.map((color, index) => (
                <button
                  type="button"
                  key={index}
                  className={`h-10 w-10 rounded-full shadow-md transform transition-transform hover:scale-110 border-2 ${formData.background_type === 'color' && formData.background_value === color ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleBackgroundChange('color', color)}
                ></button>
              ))}
            </div>
            {/* Custom Color Input */}
            <div className="flex items-center gap-2 mt-4">
              <label htmlFor="custom-color" className="sr-only">Custom Color</label>
              <input
                type="color"
                id="custom-color"
                value={formData.background_type === 'color' ? formData.background_value || '#ffffff' : '#ffffff'}
                onChange={(e) => handleBackgroundChange('color', e.target.value)}
                className="h-10 w-10 rounded-full border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.background_type === 'color' ? formData.background_value || '#ffffff' : ''}
                onChange={(e) => handleBackgroundChange('color', e.target.value)}
                placeholder="#RRGGBB"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
              />
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />
            <div
              className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={handleImageClick}
            >
              {formData.background_value && !isLoading && formData.background_type === 'image' ? (
                <Image
                  src={formData.background_value}
                  alt="Card Background"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-gray-500 text-center">
                  {isLoading ? 'Uploading...' : 'Click to upload image (Max 5MB)'}
                </span>
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
                <span className="text-white text-sm font-semibold">Change Background</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
