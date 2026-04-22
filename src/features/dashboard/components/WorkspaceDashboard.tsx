'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ItemCard } from './ItemCard'
import { FilterBar } from './FilterBar'
import { EmptyState } from './EmptyState'
import { ItemDetail } from './ItemDetail'
import { ItemEditForm } from './ItemEditForm'
import { useItemsStore } from '../store/itemsStore'
import { useOrganizeStore } from '@/features/organize/store/organizeStore'
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
  const { activeFilter, clearFilter } = useOrganizeStore()
  const [selectedItem, setSelectedItem] = useState<NucleoItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NucleoItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const filteredItems = activeFilter
    ? items.filter((item) => {
        if (activeFilter.type === 'folder') return item.folder_id === activeFilter.id
        if (activeFilter.type === 'category') return item.category === activeFilter.id
        if (activeFilter.type === 'tag') return item.tags.includes(activeFilter.name)
        return true
      })
    : items

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

      {activeFilter && (
        <div
          className="flex items-center justify-between px-4 py-2 mb-3 rounded-lg text-sm"
          style={{
            background: 'var(--color-selected)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span>
            {activeFilter.type === 'folder' ? '📁' : activeFilter.type === 'tag' ? '🏷️' : '🗂️'}{' '}
            {activeFilter.name}
          </span>
          <button
            type="button"
            onClick={clearFilter}
            aria-label="Limpiar filtro"
            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          >
            <X size={12} aria-hidden="true" />
            Limpiar
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState variant={activeFilter ? 'empty-folder' : 'empty-workspace'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
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
        onEdit={(item) => {
          setEditingItem(item)
          setEditOpen(true)
        }}
        onDelete={handleDetailDelete}
      />

      <ItemEditForm
        item={editingItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(_id, _data) => setEditOpen(false)}
      />
    </div>
  )
}
