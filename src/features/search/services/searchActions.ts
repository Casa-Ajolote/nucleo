'use server'

import { createClient } from '@/lib/supabase/server'
import type { NucleoItem } from '@/features/dashboard/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapDbItem(row: Record<string, unknown>): NucleoItem {
  const tags = Array.isArray(row.item_tags)
    ? (row.item_tags as Array<{ tags: { name: string } }>)
        .map((t) => t.tags?.name)
        .filter(Boolean)
    : []

  return {
    id: row.id as string,
    title: (row.title as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    content: row.original_content as string,
    content_type: row.content_type as NucleoItem['content_type'],
    status: row.processing_status as NucleoItem['status'],
    tags,
    category: (row.category_id as string | null) ?? null,
    folder_id: (row.folder_id as string | null) ?? null,
    thumbnail_url: (row.thumbnail_url as string | null) ?? null,
    url: (row.original_url as string | null) ?? null,
    workspace_id: row.workspace_id as string,
    created_at: row.created_at as string,
  }
}

// ---------------------------------------------------------------------------
// searchItems
// ---------------------------------------------------------------------------

export async function searchItems(
  workspaceId: string,
  query: string
): Promise<NucleoItem[]> {
  if (!query.trim()) return []

  const supabase = await createClient()

  // Step 1: RPC to get ranked IDs via full-text / similarity search
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_items', {
    p_workspace_id: workspaceId,
    p_query: query.trim(),
    p_limit: 20,
  })

  if (rpcError) {
    console.error('[searchItems] RPC error:', rpcError)
    return []
  }

  const ids = (rpcData ?? []).map((r: { id: string }) => r.id)
  if (ids.length === 0) return []

  // Step 2: Fetch full item rows with tags
  const { data: itemData, error: itemError } = await supabase
    .from('items')
    .select(`
      id, title, original_content, original_url, content_type,
      processing_status, summary, thumbnail_url, folder_id,
      category_id, workspace_id, created_at,
      item_tags ( tags ( name ) )
    `)
    .in('id', ids)

  if (itemError) {
    console.error('[searchItems] items fetch error:', itemError)
    return []
  }

  // Step 3: Reorder results to match similarity ranking from RPC
  const itemMap = new Map(
    (itemData ?? []).map((row) => [
      row.id,
      mapDbItem(row as unknown as Record<string, unknown>),
    ])
  )

  return ids
    .map((id: string) => itemMap.get(id))
    .filter((item: NucleoItem | undefined): item is NucleoItem => item !== undefined)
}
