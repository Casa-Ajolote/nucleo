'use client'

import { useEffect, useState } from 'react'
import { ItemCard } from './ItemCard'
import { FilterBar } from './FilterBar'
import { EmptyState } from './EmptyState'
import { ItemDetail } from './ItemDetail'
import { useItemsStore } from '../store/itemsStore'
import { deleteItem } from '@/features/capture/services/itemActions'
import { createClient } from '@/lib/supabase/client'
import type { NucleoItem } from '../types'

interface Workspace {
  id: string
  name: string
  slug: string
  icon: string
}

interface Props {
  workspace: Workspace
  initialItems: NucleoItem[]
}

export function WorkspaceDashboard({ workspace, initialItems }: Props) {
  const { items, setItems, setActiveWorkspace, removeItem } = useItemsStore()
  const [selectedItem, setSelectedItem] = useState<NucleoItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    setActiveWorkspace(workspace.id)
    setItems(initialItems)
  }, [workspace.id, initialItems, setActiveWorkspace, setItems])

  // Polling para items pending/processing — actualiza cards cuando el AI pipeline termina
  useEffect(() => {
    const supabase = createClient()

    async function pollPendingItems() {
      const store = useItemsStore.getState()
      const pendingIds = store.items
        .filter((i) => i.status === 'pending' || i.status === 'processing')
        .map((i) => i.id)

      if (pendingIds.length === 0) return

      const { data } = await supabase
        .from('items')
        .select(`
          id, title, summary, processing_status, thumbnail_url, category_id,
          item_tags ( tags ( name ) )
        `)
        .in('id', pendingIds)

      if (!data) return

      data.forEach((row) => {
        const tags = Array.isArray(row.item_tags)
          ? (row.item_tags as unknown as Array<{ tags: { name: string } }>)
              .map((t) => t.tags?.name)
              .filter(Boolean)
          : []

        store.updateItem(row.id, {
          title: row.title,
          summary: row.summary,
          status: row.processing_status as NucleoItem['status'],
          thumbnail_url: row.thumbnail_url,
          category: row.category_id,
          tags,
        })
      })
    }

    const interval = setInterval(pollPendingItems, 3000)
    return () => clearInterval(interval)
  }, [workspace.id])

  function handleCardClick(item: NucleoItem) {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  async function handleDelete(id: string) {
    removeItem(id)
    await deleteItem(id)
  }

  async function handleDetailDelete(id: string) {
    removeItem(id)
    setDetailOpen(false)
    await deleteItem(id)
  }

  return (
    <div className="space-y-0">
      <FilterBar total={items.length} workspaceName={workspace.name} />

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
        onEdit={() => {}}
        onDelete={handleDetailDelete}
      />
    </div>
  )
}
