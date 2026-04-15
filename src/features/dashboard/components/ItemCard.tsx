'use client'

import { useState } from 'react'
import {
  LinkIcon,
  FileText,
  FileCode,
  Terminal,
  MoreHorizontal,
  Pencil,
  FolderOpen,
  Trash2,
  RefreshCw,
  Download,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import type { NucleoItem, ContentType } from '../types'
import { downloadObsidianNote } from '../utils/exportObsidian'

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return `hace ${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`

  const weeks = Math.floor(days / 7)
  return `hace ${weeks} semanas`
}

// ---------------------------------------------------------------------------
// Content type icon
// ---------------------------------------------------------------------------
function ContentTypeIcon({
  type,
  size = 12,
}: {
  type: ContentType
  size?: number
}) {
  const props = { size, className: 'text-muted shrink-0' }
  switch (type) {
    case 'link':
      return <LinkIcon {...props} />
    case 'text':
      return <FileText {...props} />
    case 'markdown':
      return <FileCode {...props} />
    case 'command':
      return <Terminal {...props} />
  }
}

// ---------------------------------------------------------------------------
// Thumbnail placeholder
// ---------------------------------------------------------------------------
function ThumbnailPlaceholder({ type }: { type: ContentType }) {
  const iconProps = { size: 24 }
  return (
    <div className="w-full aspect-video bg-sidebar rounded-t-lg flex items-center justify-center">
      {type === 'link' && <LinkIcon {...iconProps} className="text-muted" />}
      {type === 'text' && <FileText {...iconProps} className="text-muted" />}
      {type === 'markdown' && <FileCode {...iconProps} className="text-muted" />}
      {type === 'command' && <Terminal {...iconProps} className="text-muted" />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Processing skeleton overlay
// ---------------------------------------------------------------------------
function ProcessingOverlay() {
  return (
    <div className="p-3 space-y-2 animate-pulse">
      <div className="h-4 bg-hover rounded w-3/4" />
      <div className="space-y-1.5">
        <div className="h-3 bg-hover rounded w-full" />
        <div className="h-3 bg-hover rounded w-5/6" />
      </div>
      <div className="flex gap-1.5 pt-1">
        <div className="h-5 w-12 bg-hover rounded" />
        <div className="h-5 w-10 bg-hover rounded" />
      </div>
      <div className="h-3 bg-hover rounded w-1/3" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tag chips
// ---------------------------------------------------------------------------
function TagChips({ tags }: { tags: string[] }) {
  const visible = tags.slice(0, 3)
  const overflow = tags.length - visible.length

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((tag) => (
        <span
          key={tag}
          className="rounded text-xs px-1.5 py-0.5 bg-hover text-muted"
        >
          #{tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-xs text-placeholder">+{overflow}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Context menu (dropdown)
// ---------------------------------------------------------------------------
function CardMenu({
  visible,
  onDelete,
  onExport,
}: {
  visible: boolean
  onDelete?: () => void
  onExport?: () => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'absolute top-2 right-2 p-1 rounded transition-opacity duration-150',
            'bg-canvas/80 backdrop-blur-sm border border-border',
            'hover:bg-hover',
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-label="Opciones del item"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={14} className="text-muted" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[140px] rounded-lg border border-border bg-canvas shadow-md',
            'py-1 z-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          sideOffset={4}
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
          >
            <Pencil size={13} className="text-muted" />
            Editar
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
          >
            <FolderOpen size={13} className="text-muted" />
            Mover
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
            onSelect={onExport}
          >
            <Download size={13} className="text-muted" />
            Exportar .md
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border mx-1" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
            style={{ color: 'var(--color-error)' }}
            onSelect={onDelete}
          >
            <Trash2 size={13} style={{ color: 'var(--color-error)' }} />
            Eliminar
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ItemCardProps {
  item: NucleoItem
  onDelete?: (id: string) => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const [hovered, setHovered] = useState(false)

  const displayTitle =
    item.title ?? (item.url ? new URL(item.url).hostname : item.content.slice(0, 60))

  return (
    <article
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex flex-col border border-border rounded-lg bg-canvas cursor-pointer',
        'transition-all duration-150',
        hovered && 'border-[#C7C6C4] shadow-[0_2px_6px_rgba(0,0,0,0.09)]'
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
      }}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <img
          src={item.thumbnail_url}
          alt={displayTitle}
          className="w-full aspect-video object-cover rounded-t-lg"
        />
      ) : (
        <ThumbnailPlaceholder type={item.content_type} />
      )}

      {/* Context menu trigger — visible on hover */}
      <CardMenu
        visible={hovered}
        onDelete={onDelete ? () => onDelete(item.id) : undefined}
        onExport={() => downloadObsidianNote(item, displayTitle)}
      />

      {/* Body */}
      {item.status === 'processing' || item.status === 'pending' ? (
        <ProcessingOverlay />
      ) : item.status === 'failed' ? (
        <FailedBody item={item} />
      ) : (
        <div className="animate-in fade-in duration-300">
          <ReadyBody item={item} />
        </div>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Ready body
// ---------------------------------------------------------------------------
function ReadyBody({ item }: { item: NucleoItem }) {
  const displayTitle =
    item.title ?? (item.url ? new URL(item.url).hostname : item.content.slice(0, 60))

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Title */}
      <p className="font-medium text-sm text-ink leading-snug line-clamp-1">
        {displayTitle}
      </p>

      {/* Summary or command preview */}
      {item.content_type === 'command' ? (
        <pre
          className="text-xs rounded px-2 py-1.5 overflow-x-auto leading-relaxed line-clamp-2"
          style={{ background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace' }}
        >
          {item.content}
        </pre>
      ) : item.summary ? (
        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
      ) : null}

      {/* Tags */}
      <TagChips tags={item.tags} />

      {/* Footer: type icon + relative time */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <ContentTypeIcon type={item.content_type} size={12} />
        <span className="text-xs text-muted">·</span>
        <span className="text-xs text-muted">{formatRelativeTime(item.created_at)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Failed body
// ---------------------------------------------------------------------------
function FailedBody({ item }: { item: NucleoItem }) {
  const displayTitle =
    item.title ?? (item.url ? new URL(item.url).hostname : 'Item sin título')

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="font-medium text-sm text-ink leading-snug line-clamp-1">
        {displayTitle}
      </p>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium"
          style={{
            background: 'rgba(235,87,87,0.10)',
            color: 'var(--color-error)',
          }}
        >
          ⚠ Análisis falló
        </span>
      </div>

      <button
        className="self-start flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors duration-150 px-2 py-1 rounded hover:bg-hover"
        onClick={(e) => e.stopPropagation()}
        aria-label="Reintentar análisis"
      >
        <RefreshCw size={11} />
        Reintentar
      </button>

      <div className="flex items-center gap-1.5 mt-0.5">
        <ContentTypeIcon type={item.content_type} size={12} />
        <span className="text-xs text-muted">·</span>
        <span className="text-xs text-muted">{formatRelativeTime(item.created_at)}</span>
      </div>
    </div>
  )
}
