'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Folder, Category, TagWithCount } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const nameSchema = z
  .string()
  .min(1, 'El nombre no puede estar vacío')
  .max(50, 'El nombre no puede superar 50 caracteres')

const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un hex válido (#RRGGBB)')
  .default('#2383E2')

// ---------------------------------------------------------------------------
// getFolders
// ---------------------------------------------------------------------------

export async function getFolders(workspaceId: string): Promise<Folder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('folders')
    .select('id, workspace_id, parent_id, name, slug, depth, position')
    .eq('workspace_id', workspaceId)
    .order('depth', { ascending: true })
    .order('position', { ascending: true })

  if (error) {
    console.error('[getFolders] Supabase error:', error)
    return []
  }

  return (data ?? []) as Folder[]
}

// ---------------------------------------------------------------------------
// createFolder
// ---------------------------------------------------------------------------

export async function createFolder(
  workspaceId: string,
  name: string,
  parentId: string | null
): Promise<{ folder?: Folder; error?: string }> {
  // 1. Validate input
  const parsed = nameSchema.safeParse(name)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Nombre inválido' }
  }

  const supabase = await createClient()

  // 2. Resolve depth
  let depth = 0
  if (parentId !== null) {
    const { data: parent, error: parentError } = await supabase
      .from('folders')
      .select('depth')
      .eq('id', parentId)
      .single()

    if (parentError || !parent) {
      return { error: 'La carpeta padre no existe' }
    }

    depth = (parent.depth as number) + 1
  }

  if (depth > 2) {
    return {
      error:
        'Máximo 3 niveles de carpetas. Reorganiza tu contenido o usa tags.',
    }
  }

  // 3. Generate slug and check for duplicates
  const slug = generateSlug(parsed.data)

  let duplicateCheck
  if (parentId === null) {
    const { data } = await supabase
      .from('folders')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .is('parent_id', null)
      .maybeSingle()
    duplicateCheck = data
  } else {
    const { data } = await supabase
      .from('folders')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .eq('parent_id', parentId)
      .maybeSingle()
    duplicateCheck = data
  }

  if (duplicateCheck) {
    return { error: 'Ya existe una carpeta con ese nombre aquí' }
  }

  // 4. Insert
  const { data, error } = await supabase
    .from('folders')
    .insert({
      workspace_id: workspaceId,
      parent_id: parentId,
      name: parsed.data,
      slug,
      depth,
    })
    .select('id, workspace_id, parent_id, name, slug, depth, position')
    .single()

  if (error) {
    console.error('[createFolder] Supabase error:', error)
    // Handle unique constraint violation (race condition)
    if (error.code === '23505') {
      return { error: 'Ya existe una carpeta con ese nombre aquí' }
    }
    return { error: 'Error al crear la carpeta' }
  }

  return { folder: data as Folder }
}

// ---------------------------------------------------------------------------
// renameFolder
// ---------------------------------------------------------------------------

export async function renameFolder(
  id: string,
  name: string
): Promise<{ error?: string }> {
  // 1. Validate input
  const parsed = nameSchema.safeParse(name)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Nombre inválido' }
  }

  const supabase = await createClient()

  // 2. Fetch current folder to get workspace_id and parent_id
  const { data: current, error: fetchError } = await supabase
    .from('folders')
    .select('workspace_id, parent_id')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Carpeta no encontrada' }
  }

  const slug = generateSlug(parsed.data)
  const parentId = current.parent_id as string | null
  const workspaceId = current.workspace_id as string

  // 3. Check duplicate in same level (excluding self)
  let duplicateCheck
  if (parentId === null) {
    const { data } = await supabase
      .from('folders')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .is('parent_id', null)
      .neq('id', id)
      .maybeSingle()
    duplicateCheck = data
  } else {
    const { data } = await supabase
      .from('folders')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .eq('parent_id', parentId)
      .neq('id', id)
      .maybeSingle()
    duplicateCheck = data
  }

  if (duplicateCheck) {
    return { error: 'Ya existe una carpeta con ese nombre aquí' }
  }

  // 4. Update
  const { error } = await supabase
    .from('folders')
    .update({ name: parsed.data, slug, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[renameFolder] Supabase error:', error)
    if (error.code === '23505') {
      return { error: 'Ya existe una carpeta con ese nombre aquí' }
    }
    return { error: 'Error al renombrar la carpeta' }
  }

  return {}
}

// ---------------------------------------------------------------------------
// deleteFolder
// ---------------------------------------------------------------------------

export async function deleteFolder(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('folders').delete().eq('id', id)

  if (error) {
    console.error('[deleteFolder] Supabase error:', error)
    return { error: 'Error al eliminar la carpeta' }
  }

  return {}
}

// ---------------------------------------------------------------------------
// getCategories
// ---------------------------------------------------------------------------

export async function getCategories(workspaceId: string): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*, items(count)')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('[getCategories] Supabase error:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const items = row.items as Array<{ count: number }> | undefined
    return {
      id: row.id as string,
      workspace_id: row.workspace_id as string,
      name: row.name as string,
      slug: row.slug as string,
      color: (row.color as string) ?? '#2383E2',
      item_count: items?.[0]?.count ?? 0,
    } satisfies Category
  })
}

// ---------------------------------------------------------------------------
// createCategory
// ---------------------------------------------------------------------------

export async function createCategory(
  workspaceId: string,
  name: string,
  color: string = '#2383E2'
): Promise<{ category?: Category; error?: string }> {
  // 1. Validate input
  const parsedName = nameSchema.safeParse(name)
  if (!parsedName.success) {
    return { error: parsedName.error.issues[0]?.message ?? 'Nombre inválido' }
  }

  const parsedColor = colorSchema.safeParse(color)
  const resolvedColor = parsedColor.success ? parsedColor.data : '#2383E2'

  const supabase = await createClient()

  // 2. Generate slug and check duplicate
  const slug = generateSlug(parsedName.data)

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return { error: 'Ya existe una categoría con ese nombre' }
  }

  // 3. Insert
  const { data, error } = await supabase
    .from('categories')
    .insert({
      workspace_id: workspaceId,
      name: parsedName.data,
      slug,
      color: resolvedColor,
    })
    .select('id, workspace_id, name, slug, color')
    .single()

  if (error) {
    console.error('[createCategory] Supabase error:', error)
    if (error.code === '23505') {
      return { error: 'Ya existe una categoría con ese nombre' }
    }
    return { error: 'Error al crear la categoría' }
  }

  return {
    category: {
      id: data.id as string,
      workspace_id: data.workspace_id as string,
      name: data.name as string,
      slug: data.slug as string,
      color: (data.color as string) ?? '#2383E2',
      item_count: 0,
    },
  }
}

// ---------------------------------------------------------------------------
// getTagsWithCount
// ---------------------------------------------------------------------------

export async function getTagsWithCount(
  workspaceId: string
): Promise<TagWithCount[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*, item_tags(count)')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('[getTagsWithCount] Supabase error:', error)
    return []
  }

  return (data ?? [])
    .map((row) => {
      const itemTags = row.item_tags as Array<{ count: number }> | undefined
      return {
        id: row.id as string,
        workspace_id: row.workspace_id as string,
        name: row.name as string,
        slug: row.slug as string,
        item_count: itemTags?.[0]?.count ?? 0,
      } satisfies TagWithCount
    })
    .sort((a, b) => {
      // Primary: item_count DESC; secondary: name ASC (already ordered by name above)
      if (b.item_count !== a.item_count) return b.item_count - a.item_count
      return a.name.localeCompare(b.name)
    })
}
