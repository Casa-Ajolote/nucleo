'use server'

import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processItemPipeline } from '@/lib/ai/pipeline'
import { getFolders, createFolder } from '@/features/organize/services/organizeActions'
import type { Folder } from '@/features/organize/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentType = 'link' | 'text' | 'markdown' | 'command'

interface CreateItemForImportData {
  content: string
  contentType: ContentType
  url?: string
  folderId?: string | null
}

// ---------------------------------------------------------------------------
// createItemForImport
// ---------------------------------------------------------------------------

/**
 * Inserts a single item with processing_status 'pending' and fires the AI
 * pipeline via `after()` so it runs after the response is sent.
 *
 * Intentionally does NOT reuse createItem() from itemActions to avoid
 * cross-Server-Action import issues in Next.js 16 and to retain full control
 * over the import-specific insert shape.
 */
export async function createItemForImport(
  workspaceId: string,
  data: CreateItemForImportData
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado' }
  }

  const { content, contentType, url, folderId } = data

  // For link type, prefer the explicit url field; fall back to content
  const originalUrl =
    contentType === 'link' ? (url?.trim() || content.trim()) : (url?.trim() ?? null)

  const { data: inserted, error: insertError } = await supabase
    .from('items')
    .insert({
      workspace_id: workspaceId,
      original_content: content,
      original_url: originalUrl,
      content_type: contentType,
      folder_id: folderId ?? null,
      processing_status: 'pending',
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[createItemForImport] Supabase insert error:', insertError)
    return { error: 'Error al guardar el elemento' }
  }

  const itemId = inserted.id as string

  // Fire AI pipeline after response is sent — non-blocking
  after(async () => {
    const pipelineClient = await createClient()
    await processItemPipeline(
      pipelineClient,
      itemId,
      content,
      contentType,
      originalUrl
    )
  })

  return { id: itemId }
}

// ---------------------------------------------------------------------------
// getOrCreateFolderByPath
// ---------------------------------------------------------------------------

/**
 * Resolves a slash-separated folder path to a folder_id, creating missing
 * folders along the way. Returns null if folderPath is empty.
 *
 * Max depth enforced: paths with more than 3 segments are truncated to 3.
 * (Nucleo supports depth 0, 1, 2 → max 3 levels)
 */
export async function getOrCreateFolderByPath(
  workspaceId: string,
  folderPath: string
): Promise<string | null> {
  const trimmed = folderPath.trim()
  if (!trimmed) return null

  // Split and truncate to max 3 levels
  const MAX_LEVELS = 3
  const segments = trimmed
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_LEVELS)

  if (segments.length === 0) return null

  // Fetch all existing folders for the workspace once (avoids N+1)
  const existingFolders = await getFolders(workspaceId)

  // Build a lookup: parentId (null|string) → name → Folder
  function buildLookup(folders: Folder[]): Map<string, Map<string, Folder>> {
    const map = new Map<string, Map<string, Folder>>()
    for (const folder of folders) {
      const parentKey = folder.parent_id ?? '__root__'
      if (!map.has(parentKey)) {
        map.set(parentKey, new Map())
      }
      map.get(parentKey)!.set(folder.name.toLowerCase(), folder)
    }
    return map
  }

  // We may add new folders during traversal — maintain a mutable list
  const allFolders: Folder[] = [...existingFolders]
  let lookup = buildLookup(allFolders)

  let parentId: string | null = null

  for (const segment of segments) {
    const parentKey: string = parentId ?? '__root__'
    const existing: Folder | undefined = lookup.get(parentKey)?.get(segment.toLowerCase())

    if (existing) {
      parentId = existing.id
      continue
    }

    // Create the folder
    const { folder, error } = await createFolder(workspaceId, segment, parentId)

    if (error || !folder) {
      console.error(
        `[getOrCreateFolderByPath] Failed to create folder '${segment}' (parent: ${parentId ?? 'root'}):`,
        error
      )
      // Return the last successfully resolved id rather than failing completely
      return parentId
    }

    // Update local state so next segments resolve correctly
    allFolders.push(folder)
    lookup = buildLookup(allFolders)
    parentId = folder.id
  }

  return parentId
}
