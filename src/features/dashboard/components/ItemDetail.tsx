'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  MoreHorizontal,
  LinkIcon,
  ExternalLink,
  FileText,
  Terminal,
  FileCode,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Separator from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'
import { CopyButton } from './CopyButton'
import { formatRelativeTime } from './ItemCard'
import type { NucleoItem, ContentType } from '../types'

// ---------------------------------------------------------------------------
// Content type label
// ---------------------------------------------------------------------------
const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  link: 'Link',
  text: 'Texto',
  markdown: 'Markdown',
  command: 'Comando',
}

// ---------------------------------------------------------------------------
// Content type icon
// ---------------------------------------------------------------------------
function ContentTypeIcon({ type, size = 14 }: { type: ContentType; size?: number }) {
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
// Simple markdown parser — no external dependency
// ---------------------------------------------------------------------------
function parseMarkdownSimple(text: string): React.ReactNode {
  const lines = text.split('\n')

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Headings
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="text-sm font-semibold text-ink mt-3 mb-1">
              {parseInline(line.slice(4))}
            </p>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <p key={i} className="text-base font-semibold text-ink mt-3 mb-1">
              {parseInline(line.slice(3))}
            </p>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <p key={i} className="text-lg font-semibold text-ink mt-3 mb-1">
              {parseInline(line.slice(2))}
            </p>
          )
        }

        // Unordered list item
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-muted shrink-0" />
              <span>{parseInline(line.slice(2))}</span>
            </div>
          )
        }

        // Ordered list item
        const orderedMatch = line.match(/^(\d+)\. (.+)/)
        if (orderedMatch) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-ink">
              <span className="text-muted shrink-0 tabular-nums">{orderedMatch[1]}.</span>
              <span>{parseInline(orderedMatch[2])}</span>
            </div>
          )
        }

        // Code block start/end (```) — handled as a passthrough visual block
        if (line.startsWith('```')) {
          return <div key={i} className="hidden" />
        }

        // Horizontal rule
        if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
          return (
            <hr key={i} className="border-border my-2" />
          )
        }

        // Empty line
        if (line.trim() === '') {
          return <div key={i} className="h-1" />
        }

        // Normal paragraph
        return (
          <p key={i} className="text-sm text-ink leading-relaxed">
            {parseInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function parseInline(text: string): React.ReactNode {
  // Split on bold (**text**), italic (*text*), and inline code (`code`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono text-xs px-1 py-0.5 rounded"
          style={{ background: 'var(--color-sidebar)', color: 'var(--color-ink)' }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

// ---------------------------------------------------------------------------
// Content renderer by type
// ---------------------------------------------------------------------------
function ContentBlock({ item }: { item: NucleoItem }) {
  if (item.content_type === 'link') {
    return (
      <div
        className="rounded-lg border flex items-center gap-3 p-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-sidebar)' }}
      >
        <LinkIcon size={16} className="text-muted shrink-0" />
        <span className="flex-1 text-sm text-ink truncate">{item.url}</span>
        <CopyButton text={item.url ?? ''} size="sm" />
        <a
          href={item.url && /^https?:\/\//i.test(item.url) ? item.url : '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir enlace en nueva pestaña"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink
            size={15}
            className="text-muted transition-colors"
            style={{ cursor: 'pointer' }}
          />
        </a>
      </div>
    )
  }

  if (item.content_type === 'command') {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <pre
          className="text-sm font-mono p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed"
          style={{ background: '#1e1e1e', color: '#d4d4d4' }}
        >
          {item.content}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton
            text={item.content}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white hover:bg-white/20"
          />
        </div>
      </div>
    )
  }

  if (item.content_type === 'markdown') {
    return (
      <div className="rounded-lg p-4" style={{ background: 'var(--color-sidebar)' }}>
        {parseMarkdownSimple(item.content)}
      </div>
    )
  }

  // text
  return (
    <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
      {item.content}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Status banners
// ---------------------------------------------------------------------------
function ProcessingBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 text-sm"
      style={{
        background: 'rgba(234, 179, 8, 0.08)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        color: '#92400e',
      }}
    >
      <Clock size={14} className="shrink-0 animate-pulse" />
      <span>La IA está procesando este item…</span>
    </div>
  )
}

function FailedBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 text-sm"
      style={{
        background: 'rgba(235, 87, 87, 0.08)',
        borderBottom: '1px solid rgba(235, 87, 87, 0.2)',
        color: 'var(--color-error)',
      }}
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span className="flex-1">El análisis falló. El contenido original se preservó.</span>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs underline underline-offset-2 hover:no-underline transition-all"
        style={{ color: 'var(--color-error)' }}
      >
        <RefreshCw size={11} />
        Reintentar
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Delete confirm dialog
// ---------------------------------------------------------------------------
interface DeleteConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemTitle: string
  onConfirm: () => void
}

function DeleteConfirm({ open, onOpenChange, itemTitle, onConfirm }: DeleteConfirmProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[60]"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
        />
        <Dialog.Content
          className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl p-6 shadow-xl"
          style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}
          aria-describedby="delete-confirm-desc"
        >
          <Dialog.Title className="text-base font-semibold text-ink mb-2">
            ¿Eliminar &ldquo;{itemTitle}&rdquo;?
          </Dialog.Title>
          <p id="delete-confirm-desc" className="text-sm text-muted mb-6 leading-relaxed">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-lg transition-colors text-ink hover:bg-hover"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm rounded-lg transition-colors font-medium"
              style={{
                background: 'rgba(235,87,87,0.12)',
                color: 'var(--color-error)',
                border: '1px solid rgba(235,87,87,0.25)',
              }}
            >
              Eliminar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ---------------------------------------------------------------------------
// Header dropdown menu
// ---------------------------------------------------------------------------
interface HeaderMenuProps {
  onEdit: () => void
  onDelete: () => void
}

function HeaderMenu({ onEdit, onDelete }: HeaderMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-1.5 rounded transition-colors hover:bg-hover"
          aria-label="Más opciones"
        >
          <MoreHorizontal size={16} className="text-muted" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[140px] rounded-lg border py-1 z-[60] shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          style={{
            background: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
          }}
          sideOffset={6}
          align="end"
        >
          <DropdownMenu.Item
            onSelect={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none hover:bg-hover rounded-sm mx-1 text-ink"
          >
            <Pencil size={13} className="text-muted" />
            Editar
          </DropdownMenu.Item>
          <DropdownMenu.Separator
            className="my-1 h-px mx-1"
            style={{ background: 'var(--color-border)' }}
          />
          <DropdownMenu.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
            style={{ color: 'var(--color-error)' }}
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
// Panel content (shared between mobile/desktop)
// ---------------------------------------------------------------------------
interface PanelContentProps {
  item: NucleoItem
  onClose: () => void
  onEdit: (item: NucleoItem) => void
  onDelete: (id: string) => void
}

function PanelContent({ item, onClose, onEdit, onDelete }: PanelContentProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const displayTitle =
    item.title ??
    (item.url ? (() => { try { return new URL(item.url!).hostname } catch { return item.url! } })() : item.content.slice(0, 60))

  function handleConfirmDelete() {
    setDeleteOpen(false)
    onDelete(item.id)
    onClose()
  }

  return (
    <>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3"
        style={{
          background: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={onClose}
          className="p-1.5 rounded transition-colors hover:bg-hover shrink-0"
          aria-label="Cerrar detalle"
        >
          <ChevronLeft size={18} className="text-muted" />
        </button>
        <span className="flex-1 text-sm font-medium text-ink truncate min-w-0">
          {displayTitle}
        </span>
        <HeaderMenu
          onEdit={() => onEdit(item)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

      {/* Status banners */}
      {item.status === 'processing' && <ProcessingBanner />}
      {item.status === 'failed' && <FailedBanner onRetry={() => {}} />}

      {/* Scrollable body */}
      <div className="flex flex-col gap-0 pb-24">
        {/* Thumbnail */}
        <div className="w-full aspect-video overflow-hidden" style={{ background: 'var(--color-sidebar)' }}>
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ContentTypeIcon type={item.content_type} size={32} />
            </div>
          )}
        </div>

        <div className="px-4 pt-5 flex flex-col gap-4">
          {/* Title */}
          <h1 className="text-lg font-semibold leading-snug" style={{ color: 'var(--color-ink)' }}>
            {displayTitle}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <ContentTypeIcon type={item.content_type} size={13} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {CONTENT_TYPE_LABEL[item.content_type]}
            </span>
            {item.category && (
              <>
                <span className="text-xs" style={{ color: 'var(--color-placeholder)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {item.category}
                </span>
              </>
            )}
            <span className="text-xs" style={{ color: 'var(--color-placeholder)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {formatRelativeTime(item.created_at)}
            </span>
          </div>

          {/* Tags — all visible */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs rounded px-1.5 py-0.5"
                  style={{
                    background: 'var(--color-hover)',
                    color: 'var(--color-muted)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <Separator.Root
            className="h-px"
            style={{ background: 'var(--color-border)' }}
          />

          {/* Summary section */}
          {item.summary && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-muted shrink-0" />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                    Resumen
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {item.summary}
                </p>
              </div>
              <Separator.Root
                className="h-px"
                style={{ background: 'var(--color-border)' }}
              />
            </>
          )}

          {/* Content section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <ContentTypeIcon type={item.content_type} size={14} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                Contenido
              </span>
            </div>
            <ContentBlock item={item} />
          </div>

          <Separator.Root
            className="h-px"
            style={{ background: 'var(--color-border)' }}
          />
        </div>
      </div>

      {/* Sticky footer actions */}
      <div
        className="sticky bottom-0 flex gap-2 px-4 pt-3 pb-6"
        style={{
          background: 'var(--color-canvas)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors hover:bg-hover"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink)',
          }}
        >
          <Pencil size={14} />
          Editar
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          style={{
            border: '1px solid rgba(235,87,87,0.25)',
            color: 'var(--color-error)',
            background: 'rgba(235,87,87,0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(235,87,87,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(235,87,87,0.05)'
          }}
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>

      {/* Delete confirm */}
      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemTitle={displayTitle}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export interface ItemDetailProps {
  item: NucleoItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (item: NucleoItem) => void
  onDelete: (id: string) => void
}

export function ItemDetail({ item, open, onOpenChange, onEdit, onDelete }: ItemDetailProps) {
  // Track panel animation state
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      // Small defer so CSS transition runs after mount
      timerRef.current = setTimeout(() => setVisible(true), 10)
    } else {
      setVisible(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [open])

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  if (!item) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-40 transition-opacity duration-200"
          style={{
            background: open ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* Content — side panel on desktop, full-screen on mobile */}
        <Dialog.Content
          className={cn(
            // Mobile: full-screen
            'fixed inset-0 z-50 overflow-y-auto',
            // Desktop: right side panel
            'sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-full sm:max-w-xl',
            'transition-transform duration-200 ease-out'
          )}
          style={{
            background: 'var(--color-canvas)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
            transform: visible ? 'translateX(0)' : 'translateX(100%)',
          }}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">
            Detalle del item
          </Dialog.Title>

          <PanelContent
            item={item}
            onClose={handleClose}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
