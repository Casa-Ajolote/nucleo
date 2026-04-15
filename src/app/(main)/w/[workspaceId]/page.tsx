import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceDashboard } from '@/features/dashboard/components/WorkspaceDashboard'
import { getItems } from '@/features/capture/services/itemActions'

interface Props {
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug, icon')
    .eq('id', workspaceId)
    .single()

  if (!workspace) redirect('/dashboard')

  const initialItems = await getItems(workspaceId)

  return <WorkspaceDashboard workspace={workspace} initialItems={initialItems} />
}
