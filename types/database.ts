export interface Profile {
  id: string
  username: string
  full_name: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  user_id: string
  name: string
  username: string
  profile_picture_url: string | null
  position: string[] | null // Change to array of strings
  background_type: 'color' | 'image' | 'gradient' | null // New field: type of background
  background_value: string | null // New field: color hex, image URL, or gradient string
  dark_mode: boolean // New field: dark mode toggle
  emails: string[] | null
  phone_numbers: string[] | null
  whatsapp: string | null
  location: string | null
  instagram: string | null
  images: string[] | null
  created_at: string
  updated_at: string
}

export interface CardFormData {
  name: string
  username: string
  profile_picture_url: string | null
  position: string[] // Change to array of strings
  background_type: 'color' | 'image' | 'gradient' // New field: type of background
  background_value: string // New field: color hex, image URL, or gradient string
  dark_mode: boolean // New field: dark mode toggle
  emails: string[]
  phone_numbers: string[]
  whatsapp: string
  location: string
  instagram: string
  images: string[]
}

