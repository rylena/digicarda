'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardFormData } from '@/types/database'
import CardDisplay from './CardDisplay'
import ProfilePictureUploader from './ProfilePictureUploader' // Import the new component
import CardBackgroundPicker from './CardBackgroundPicker' // Import the new component

interface DashboardContentProps {
  user: any
  card: Card | null
}

export default function DashboardContent({ user, card: initialCard }: DashboardContentProps) {
  const [card, setCard] = useState<Card | null>(initialCard)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<CardFormData>({
    name: initialCard?.name || '',
    username: initialCard?.username || '',
    profile_picture_url: initialCard?.profile_picture_url || null,
    position: initialCard?.position || [], // Initialize as empty array
    emails: initialCard?.emails || [],
    phone_numbers: initialCard?.phone_numbers || [],
    whatsapp: initialCard?.whatsapp || '',
    location: initialCard?.location || '',
    instagram: initialCard?.instagram || '',
    images: initialCard?.images || [],
    background_type: initialCard?.background_type || 'gradient', // Default background type
    background_value: initialCard?.background_value || 'from-blue-500 to-purple-600', // Default gradient
    dark_mode: initialCard?.dark_mode || false, // Initialize dark mode
  })
  const router = useRouter()
  const supabase = createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  useEffect(() => {
    if (initialCard) {
      setFormData({
        name: initialCard.name || '',
        username: initialCard.username || '',
        profile_picture_url: initialCard.profile_picture_url || null,
        position: initialCard.position || [],
        emails: initialCard.emails || [],
        phone_numbers: initialCard.phone_numbers || [],
        whatsapp: initialCard.whatsapp || '',
        location: initialCard.location || '',
        instagram: initialCard.instagram || '',
        images: initialCard.images || [],
        background_type: initialCard.background_type || 'gradient',
        background_value: initialCard.background_value || 'from-blue-500 to-purple-600',
        dark_mode: initialCard.dark_mode || false,
      })
    } else {
      // If no card exists, try to create one automatically
      const createInitialCard = async () => {
        try {
          // Get user profile to get username
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single()

          if (profile) {
            const { data: newCard, error: createError } = await supabase
              .from('cards')
              .insert({
                user_id: user.id,
                name: profile.full_name || profile.username,
                username: profile.username,
                position: [], // Default empty array
                background_type: 'gradient', // Default background type
                background_value: 'from-blue-500 to-purple-600', // Default gradient
                dark_mode: false, // Default dark mode to false
              })
              .select()
              .single()

            if (!createError && newCard) {
              setCard(newCard)
              setFormData({
                name: newCard.name || '',
                username: newCard.username || '',
                profile_picture_url: newCard.profile_picture_url || null,
                position: newCard.position || [],
                emails: newCard.emails || [],
                phone_numbers: newCard.phone_numbers || [],
                whatsapp: newCard.whatsapp || '',
                location: newCard.location || '',
                instagram: newCard.instagram || '',
                images: newCard.images || [],
                background_type: newCard.background_type || 'gradient',
                background_value: newCard.background_value || 'from-blue-500 to-purple-600',
                dark_mode: newCard.dark_mode || false,
              })
            }
          }
        } catch (error) {
          // Silently fail - user can create card manually
          console.log('Could not auto-create card:', error)
        }
      }

      createInitialCard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCard, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!card) {
        // Create new card
        const { data, error } = await supabase
          .from('cards')
          .insert({
            user_id: user.id,
            ...formData,
          })
          .select()
          .single()

        if (error) throw error
        setCard(data)
        setSuccess('Card created successfully!')
      } else {
        // Update existing card
        const { data, error } = await supabase
          .from('cards')
          .update(formData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        setCard(data)
        setSuccess('Card updated successfully!')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const addArrayField = (field: 'emails' | 'phone_numbers' | 'images' | 'position', value: string) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value.trim()],
      })
    }
  }

  const removeArrayField = (field: 'emails' | 'phone_numbers' | 'images' | 'position', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4">
            {card && (
              <a
                href={`/${card.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Card
              </a>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Card</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">sterlingcards.com/{formData.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Picture
                </label>
                <ProfilePictureUploader
                  userId={user.id}
                  currentImageUrl={formData.profile_picture_url}
                  onUploadSuccess={(url) => setFormData({ ...formData, profile_picture_url: url })}
                  onUploadError={(err) => setError(err)}
                />
                {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emails
                </label>
                <div className="space-y-2">
                  {formData.emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...formData.emails]
                          newEmails[index] = e.target.value
                          setFormData({ ...formData, emails: newEmails })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('emails', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <input
                    type="email"
                    placeholder="Add email"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayField('emails', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Numbers
                </label>
                <div className="space-y-2">
                  {formData.phone_numbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const newPhones = [...formData.phone_numbers]
                          newPhones[index] = e.target.value
                          setFormData({ ...formData, phone_numbers: newPhones })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('phone_numbers', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <input
                    type="tel"
                    placeholder="Add phone number"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayField('phone_numbers', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace('@', '') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="username (without @)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position(s)
                </label>
                <div className="space-y-2">
                  {formData.position.map((pos, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pos}
                        onChange={(e) => {
                          const newPositions = [...formData.position]
                          newPositions[index] = e.target.value
                          setFormData({ ...formData, position: newPositions })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('position', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add position (e.g., Software Engineer)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayField('position', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (URLs)
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images]
                          newImages[index] = e.target.value
                          setFormData({ ...formData, images: newImages })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('images', index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <input
                    type="url"
                    placeholder="Add image URL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayField('images', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <CardBackgroundPicker
                userId={user.id}
                formData={formData}
                setFormData={setFormData}
                setError={setError}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : card ? 'Update Card' : 'Create Card'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>
            {formData.name && formData.username ? (
              <CardDisplay 
                card={{
                  id: card?.id || 'preview',
                  user_id: user.id,
                  name: formData.name,
                  username: formData.username,
                  profile_picture_url: formData.profile_picture_url,
                  position: formData.position, // Include position in preview
                  background_type: formData.background_type,
                  background_value: formData.background_value,
                  dark_mode: formData.dark_mode, // Include dark mode in preview
                  emails: formData.emails,
                  phone_numbers: formData.phone_numbers,
                  whatsapp: formData.whatsapp,
                  location: formData.location,
                  instagram: formData.instagram,
                  images: formData.images,
                  created_at: card?.created_at || new Date().toISOString(),
                  updated_at: card?.updated_at || new Date().toISOString(),
                }} 
                baseUrl={baseUrl} 
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Fill in your name and username to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

