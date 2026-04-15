import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .order('position')
    .limit(1)
    .single()

  redirect(ws ? `/w/${ws.id}` : '/login')
}
