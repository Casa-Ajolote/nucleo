'use server'

import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processItemPipeline } from '@/lib/ai/pipeline'
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
// createItem
// ---------------------------------------------------------------------------

export async function createItem(
  workspaceId: string,
  content: string,
  contentType: NucleoItem['content_type'],
  folderId?: string | null
): Promise<{ item?: NucleoItem; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('items')
    .insert({
      workspace_id: workspaceId,
      original_content: content,
      original_url: contentType === 'link' ? content.trim() : null,
      content_type: contentType,
      folder_id: folderId ?? null,
      processing_status: 'pending',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  const item = mapDbItem(data as Record<string, unknown>)

  // Disparar AI pipeline después de devolver la respuesta al cliente
  after(async () => {
    const pipelineClient = await createClient()
    await processItemPipeline(
      pipelineClient,
      item.id,
      item.content,
      item.content_type,
      item.url
    )
  })

  return { item }
}

// ---------------------------------------------------------------------------
// deleteItem
// ---------------------------------------------------------------------------

export async function deleteItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('items').delete().eq('id', id)

  if (error) return { error: error.message }
  return {}
}

// ---------------------------------------------------------------------------
// updateItem
// ---------------------------------------------------------------------------

export async function updateItem(
  id: string,
  data: { title?: string; category_id?: string | null; folder_id?: string | null; tags?: string[] }
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { tags, ...fields } = data

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase.from('items').update(fields).eq('id', id)
    if (error) return { error: error.message }
  }

  if (tags !== undefined) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Get workspace_id from item
    const { data: item } = await supabase
      .from('items')
      .select('workspace_id')
      .eq('id', id)
      .single()

    if (!item) return { error: 'Item no encontrado' }

    // Upsert tags into the workspace
    const tagRows = await Promise.all(
      tags.map(async (name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-')
        const { data: tag } = await supabase
          .from('tags')
          .upsert({ workspace_id: item.workspace_id, name, slug }, { onConflict: 'workspace_id,slug' })
          .select('id')
          .single()
        return tag?.id
      })
    )

    const validTagIds = tagRows.filter(Boolean) as string[]

    // Replace item_tags
    await supabase.from('item_tags').delete().eq('item_id', id)

    if (validTagIds.length > 0) {
      await supabase.from('item_tags').insert(
        validTagIds.map((tag_id) => ({ item_id: id, tag_id }))
      )
    }
  }

  return {}
}

// ---------------------------------------------------------------------------
// getItems
// ---------------------------------------------------------------------------

export async function getItems(
  workspaceId: string,
  limit = 20,
  offset = 0
): Promise<NucleoItem[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('items')
    .select(`
      id, title, original_content, original_url, content_type,
      processing_status, summary, thumbnail_url, folder_id,
      category_id, workspace_id, created_at, is_pinned,
      item_tags ( tags ( name ) )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return (data ?? []).map((row) => mapDbItem(row as unknown as Record<string, unknown>))
}

// ---------------------------------------------------------------------------
// checkDuplicate
// ---------------------------------------------------------------------------

export async function checkDuplicate(
  workspaceId: string,
  url: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('items')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('original_url', url.trim())
    .maybeSingle()

  return data !== null
}
