'use client'

import { useState } from 'react'
import { ItemCard } from '@/features/dashboard/components/ItemCard'
import { FilterBar } from '@/features/dashboard/components/FilterBar'
import { EmptyState } from '@/features/dashboard/components/EmptyState'
import { ItemDetail } from '@/features/dashboard/components/ItemDetail'
import type { NucleoItem } from '@/features/dashboard/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_ITEMS: NucleoItem[] = [
  {
    id: '1',
    title: 'Next.js 16 App Router docs',
    summary:
      'Documentación oficial del App Router de Next.js 16 con ejemplos de Server Components, streaming y layouts anidados.',
    content: 'https://nextjs.org/docs',
    content_type: 'link',
    status: 'ready',
    tags: ['nextjs', 'docs', 'react'],
    category: 'Development',
    folder_id: null,
    thumbnail_url: null,
    url: 'https://nextjs.org/docs',
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Git squash last N commits',
    summary: null,
    content:
      'git rebase -i HEAD~3\n# Cambia "pick" por "squash" en los commits que quieres unir',
    content_type: 'command',
    status: 'ready',
    tags: ['git', 'shell'],
    category: 'Development',
    folder_id: null,
    thumbnail_url: null,
    url: null,
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: null,
    summary: null,
    content: 'https://supabase.com/docs/guides/auth/row-level-security',
    content_type: 'link',
    status: 'processing',
    tags: [],
    category: null,
    folder_id: null,
    thumbnail_url: null,
    url: 'https://supabase.com/docs/guides/auth/row-level-security',
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  {
    id: '4',
    title: null,
    summary: null,
    content: 'https://broken-url-example.com/article',
    content_type: 'link',
    status: 'failed',
    tags: [],
    category: null,
    folder_id: null,
    thumbnail_url: null,
    url: 'https://broken-url-example.com/article',
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Prompt: Code review sistemático',
    summary:
      'Template de prompt para hacer code reviews exhaustivos con Claude. Incluye checklist de seguridad, performance y DX.',
    content:
      '# Code Review Prompt\n\nRevisa el siguiente código considerando:\n- Seguridad: SQL injection, XSS, auth\n- Performance: N+1, renders innecesarios\n- DX: naming, complejidad, tests',
    content_type: 'markdown',
    status: 'ready',
    tags: ['claude', 'prompts', 'code-review'],
    category: 'AI',
    folder_id: null,
    thumbnail_url: null,
    url: null,
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Zustand vs Redux Toolkit en 2025',
    summary:
      'Comparativa actualizada de las dos soluciones de estado más populares en React. Zustand gana en simplicidad, RTK en proyectos enterprise.',
    content:
      'En proyectos pequeños y medianos, Zustand es la elección correcta...',
    content_type: 'text',
    status: 'ready',
    tags: ['react', 'state', 'zustand'],
    category: 'Development',
    folder_id: null,
    thumbnail_url: null,
    url: null,
    workspace_id: 'ws1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [items, setItems] = useState<NucleoItem[]>(MOCK_ITEMS)
  const [selectedItem, setSelectedItem] = useState<NucleoItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editItem, setEditItem] = useState<NucleoItem | null>(null)

  function handleCardClick(item: NucleoItem) {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleDetailDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setDetailOpen(false)
  }

  function handleEdit(item: NucleoItem) {
    setEditItem(item)
    // Edit flow can be wired to a form later
  }

  // Suppress unused variable warning until edit form is implemented
  void editItem

  return (
    <div className="space-y-0">
      <FilterBar total={items.length} workspaceName="Personal" />

      {items.length === 0 ? (
        <EmptyState variant="empty-workspace" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(item)
              }}
              role="button"
              tabIndex={0}
              className="outline-none"
              aria-label={`Ver detalle: ${item.title ?? 'Item sin título'}`}
            >
              <ItemCard item={item} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      <ItemDetail
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDetailDelete}
      />
    </div>
  )
}
