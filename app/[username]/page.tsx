import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CardDisplay from '@/components/CardDisplay'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !card) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <CardDisplay card={card} baseUrl={baseUrl} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('cards')
    .select('name, username')
    .eq('username', username)
    .single()

  if (!card) {
    return {
      title: 'Profile Not Found - SterlingCards',
    }
  }

  return {
    title: `${card.name} - SterlingCards`,
    description: `View ${card.name}'s digital card on SterlingCards`,
  }
}

