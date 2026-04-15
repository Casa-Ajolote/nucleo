import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processItemPipeline } from '@/lib/ai/pipeline'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify item belongs to user
  const { data: item } = await supabase
    .from('items')
    .select('id, original_content, content_type, original_url, workspace_id')
    .eq('id', id)
    .single()

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // Run pipeline (fire-and-forget is OK here — response returns immediately)
  processItemPipeline(
    supabase,
    item.id,
    item.original_content,
    item.content_type,
    item.original_url
  ).catch(console.error)

  return NextResponse.json({ ok: true })
}
