import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's card
  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return <DashboardContent user={user} card={card} />
}

