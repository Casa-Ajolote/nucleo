'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  Folder,
  Tag,
  Settings,
  Import,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaptureDialog } from '@/features/capture/components/CaptureDialog'
import { createClient } from '@/lib/supabase/client'
import { logoutAction } from '@/features/auth/services/actions'
import { useOrganizeStore, buildFolderTree } from '@/features/organize/store/organizeStore'
import { useItemsStore } from '@/features/dashboard/store/itemsStore'
import {
  getFolders,
  createFolder,
  renameFolder as renameFolderAction,
  deleteFolder as deleteFolderAction,
  getCategories,
  createCategory,
  getTagsWithCount,
} from '@/features/organize/services/organizeActions'
import type { Folder as FolderType, Category } from '@/features/organize/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS = ['#2383E2', '#9B59B6', '#E74C3C', '#27AE60', '#F39C12', '#1ABC9C']
const MAX_VISIBLE_TAGS = 10

// ---------------------------------------------------------------------------
// Workspace type
// ---------------------------------------------------------------------------

interface Workspace {
  id: string
  name: string
  slug: string
  icon: string
  position: number
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SidebarSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-7 rounded animate-pulse"
          style={{ background: 'var(--color-hover)', opacity: 0.6 - i * 0.1 }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline text input (used for folder/category creation and rename)
// ---------------------------------------------------------------------------

interface InlineInputProps {
  placeholder: string
  initialValue?: string
  onConfirm: (value: string) => void
  onCancel: () => void
  indent?: number
}

function InlineInput({ placeholder, initialValue = '', onConfirm, onCancel, indent = 0 }: InlineInputProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim()) onConfirm(value.trim())
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5"
      style={{ paddingLeft: `${8 + indent * 16}px` }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCancel()}
        placeholder={placeholder}
        className="flex-1 text-xs rounded px-2 py-1 outline-none border"
        style={{
          background: 'var(--color-canvas)',
          borderColor: 'var(--color-accent)',
          color: 'var(--color-ink)',
        }}
        aria-label={placeholder}
      />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          if (value.trim()) onConfirm(value.trim())
        }}
        className="p-0.5 rounded transition-colors"
        style={{ color: 'var(--color-accent)' }}
        aria-label="Confirmar"
      >
        <Check size={12} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Color picker (for categories)
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  selected: string
  onChange: (color: string) => void
}

function ColorPicker({ selected, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-1.5 px-2 py-1">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-4 h-4 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: color,
            outline: selected === color ? `2px solid ${color}` : undefined,
            outlineOffset: selected === color ? '2px' : undefined,
          }}
          aria-label={`Color ${color}`}
          aria-pressed={selected === color}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FolderTreeNode — recursive
// ---------------------------------------------------------------------------

interface FolderTreeNodeProps {
  folder: FolderType
  onClose?: () => void
  workspaceId: string
}

function FolderTreeNode({ folder, onClose, workspaceId }: FolderTreeNodeProps) {
  const {
    activeFilter,
    expandedFolderIds,
    setFilter,
    toggleFolderExpand,
    addFolder,
    removeFolder,
    renameFolder,
  } = useOrganizeStore()

  const [showNewChild, setShowNewChild] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const isExpanded = expandedFolderIds.has(folder.id)
  const isActive = activeFilter?.type === 'folder' && activeFilter.id === folder.id
  const hasChildren = (folder.children?.length ?? 0) > 0
  const indentPx = 8 + folder.depth * 16

  function handleFolderClick() {
    setFilter({ type: 'folder', id: folder.id, name: folder.name })
    onClose?.()
  }

  async function handleCreateChild(name: string) {
    setShowNewChild(false)
    const result = await createFolder(workspaceId, name, folder.id)
    if (result.folder) {
      addFolder(result.folder)
      if (!isExpanded) toggleFolderExpand(folder.id)
    }
  }

  async function handleRename(name: string) {
    setRenaming(false)
    const result = await renameFolderAction(folder.id, name)
    if (!result.error) {
      renameFolder(folder.id, name)
    }
  }

  async function handleDelete() {
    setShowActions(false)
    const result = await deleteFolderAction(folder.id)
    if (!result.error) {
      removeFolder(folder.id)
    }
  }

  return (
    <div>
      {renaming ? (
        <InlineInput
          placeholder="Nombre de carpeta"
          initialValue={folder.name}
          indent={folder.depth}
          onConfirm={handleRename}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <div
          className="group flex items-center gap-1 pr-1 py-0.5 rounded cursor-pointer transition-colors"
          style={{
            paddingLeft: `${indentPx}px`,
            background: isActive ? 'var(--color-selected)' : undefined,
          }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Chevron to expand/collapse */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleFolderExpand(folder.id) }}
            className="p-0.5 rounded transition-colors hover:bg-black/5"
            style={{
              color: 'var(--color-muted)',
              visibility: hasChildren ? 'visible' : 'hidden',
            }}
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            <ChevronRight
              size={12}
              className={cn('transition-transform duration-150', isExpanded && 'rotate-90')}
            />
          </button>

          {/* Folder icon + name */}
          <button
            type="button"
            onClick={handleFolderClick}
            className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
          >
            <Folder
              size={13}
              className="shrink-0"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-muted)' }}
            />
            <span
              className="text-xs truncate"
              style={{ color: isActive ? 'var(--color-ink)' : 'var(--color-ink)' }}
            >
              {folder.name}
            </span>
          </button>

          {/* Hover actions */}
          {showActions && (
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Create subcarpeta — only if depth < 2 */}
              {folder.depth < 2 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowNewChild(true) }}
                  className="p-0.5 rounded hover:bg-black/5 transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Nueva subcarpeta"
                >
                  <Plus size={11} />
                </button>
              )}
              {/* Rename */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setRenaming(true) }}
                className="p-0.5 rounded hover:bg-black/5 transition-colors text-xs leading-none font-medium"
                style={{ color: 'var(--color-muted)', fontSize: '10px' }}
                aria-label="Renombrar"
              >
                Aa
              </button>
              {/* Delete */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
                className="p-0.5 rounded hover:bg-black/5 transition-colors"
                style={{ color: 'var(--color-error)' }}
                aria-label="Eliminar carpeta"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline input for new child */}
      {showNewChild && (
        <InlineInput
          placeholder="Nombre de subcarpeta"
          indent={folder.depth + 1}
          onConfirm={handleCreateChild}
          onCancel={() => setShowNewChild(false)}
        />
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {folder.children!.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              onClose={onClose}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SidebarContent
// ---------------------------------------------------------------------------

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter()

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  // Loading state per section
  const [loadingOrganize, setLoadingOrganize] = useState(false)

  // New folder/category creation state
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])

  // Tags visibility toggle
  const [showAllTags, setShowAllTags] = useState(false)

  // Store
  const {
    folders,
    categories,
    tags,
    activeFilter,
    setFolders,
    setCategories,
    setTags,
    addFolder,
    addCategory,
    setFilter,
    clearFilter,
    resetOrganize,
  } = useOrganizeStore()

  const { activeWorkspaceId } = useItemsStore()

  // Load workspaces once
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('workspaces')
        .select('id, name, slug, icon, position')
        .eq('user_id', user.id)
        .order('position')
        .then(({ data }) => {
          if (data) setWorkspaces(data as Workspace[])
        })
    })
  }, [])

  // Load organize data when workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return

    resetOrganize()
    setLoadingOrganize(true)

    Promise.all([
      getFolders(activeWorkspaceId),
      getCategories(activeWorkspaceId),
      getTagsWithCount(activeWorkspaceId),
    ])
      .then(([foldersData, categoriesData, tagsData]) => {
        setFolders(foldersData)
        setCategories(categoriesData)
        setTags(tagsData)
      })
      .catch(() => {
        // Silent — empty states will show
      })
      .finally(() => {
        setLoadingOrganize(false)
      })
  }, [activeWorkspaceId, resetOrganize, setFolders, setCategories, setTags])

  async function handleLogout() {
    onClose?.()
    await logoutAction()
    router.push('/login')
  }

  async function handleCreateRootFolder(name: string) {
    setShowNewFolder(false)
    if (!activeWorkspaceId) return
    const result = await createFolder(activeWorkspaceId, name, null)
    if (result.folder) {
      addFolder(result.folder)
    }
  }

  async function handleCreateCategory(name: string) {
    setShowNewCategory(false)
    if (!activeWorkspaceId) return
    const result = await createCategory(activeWorkspaceId, name, newCategoryColor)
    if (result.category) {
      addCategory(result.category)
      setNewCategoryColor(CATEGORY_COLORS[0])
    }
  }

  const folderTree = buildFolderTree(folders)
  const visibleTags = showAllTags ? tags : tags.slice(0, MAX_VISIBLE_TAGS)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-3 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
          Nucleo
        </span>
      </div>

      <div className="flex-1 py-2 overflow-y-auto">
        {/* Clear active filter */}
        {activeFilter && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={clearFilter}
              className="flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs transition-colors"
              style={{
                color: 'var(--color-accent)',
                background: 'var(--color-selected)',
              }}
            >
              <X size={11} />
              <span className="truncate">
                {activeFilter.type === 'folder' ? 'Carpeta' : activeFilter.type === 'category' ? 'Categoría' : 'Tag'}:
                {' '}{activeFilter.name}
              </span>
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Workspaces */}
          <section>
            <p className="sidebar-section-header">Workspaces</p>
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/w/${ws.id}`}
                className="sidebar-item"
                onClick={() => { clearFilter(); onClose?.() }}
              >
                <span className="text-base leading-none">{ws.icon}</span>
                <span className="flex-1 text-left">{ws.name}</span>
              </Link>
            ))}
            <button type="button" className="sidebar-item">
              <Plus size={14} className="shrink-0" />
              <span>Crear workspace</span>
            </button>
          </section>

          <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

          {/* Carpetas */}
          <section>
            <p className="sidebar-section-header">Carpetas</p>

            {loadingOrganize ? (
              <SidebarSkeleton rows={2} />
            ) : folderTree.length === 0 ? (
              <p
                className="px-3 py-1 text-xs italic"
                style={{ color: 'var(--color-placeholder)' }}
              >
                Sin carpetas aún
              </p>
            ) : (
              <div>
                {folderTree.map((folder) => (
                  <FolderTreeNode
                    key={folder.id}
                    folder={folder}
                    onClose={onClose}
                    workspaceId={activeWorkspaceId ?? ''}
                  />
                ))}
              </div>
            )}

            {showNewFolder && (
              <InlineInput
                placeholder="Nombre de carpeta"
                indent={0}
                onConfirm={handleCreateRootFolder}
                onCancel={() => setShowNewFolder(false)}
              />
            )}

            {!showNewFolder && (
              <button
                type="button"
                className="sidebar-item"
                onClick={() => setShowNewFolder(true)}
                disabled={!activeWorkspaceId}
              >
                <Plus size={14} className="shrink-0" />
                <span>Nueva carpeta</span>
              </button>
            )}
          </section>

          <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

          {/* Categorías */}
          <section>
            <p className="sidebar-section-header">Categorías</p>

            {loadingOrganize ? (
              <SidebarSkeleton rows={2} />
            ) : categories.length === 0 ? (
              <p
                className="px-3 py-1 text-xs italic"
                style={{ color: 'var(--color-placeholder)' }}
              >
                Sin categorías aún
              </p>
            ) : (
              <div>
                {categories.map((cat) => (
                  <CategoryItem
                    key={cat.id}
                    category={cat}
                    isActive={activeFilter?.type === 'category' && activeFilter.id === cat.id}
                    onClick={() => {
                      setFilter({ type: 'category', id: cat.id, name: cat.name })
                      onClose?.()
                    }}
                  />
                ))}
              </div>
            )}

            {showNewCategory && (
              <div>
                <ColorPicker
                  selected={newCategoryColor}
                  onChange={setNewCategoryColor}
                />
                <InlineInput
                  placeholder="Nombre de categoría"
                  indent={0}
                  onConfirm={handleCreateCategory}
                  onCancel={() => setShowNewCategory(false)}
                />
              </div>
            )}

            {!showNewCategory && (
              <button
                type="button"
                className="sidebar-item"
                onClick={() => setShowNewCategory(true)}
                disabled={!activeWorkspaceId}
              >
                <Plus size={14} className="shrink-0" />
                <span>Nueva categoría</span>
              </button>
            )}
          </section>

          <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

          {/* Tags */}
          <section>
            <p className="sidebar-section-header">Tags</p>

            {loadingOrganize ? (
              <SidebarSkeleton rows={3} />
            ) : tags.length === 0 ? (
              <p
                className="px-3 py-1 text-xs italic"
                style={{ color: 'var(--color-placeholder)' }}
              >
                Sin tags aún
              </p>
            ) : (
              <div>
                {visibleTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="sidebar-item w-full"
                    style={{
                      background:
                        activeFilter?.type === 'tag' && activeFilter.id === tag.id
                          ? 'var(--color-selected)'
                          : undefined,
                    }}
                    onClick={() => {
                      setFilter({ type: 'tag', id: tag.id, name: tag.name })
                      onClose?.()
                    }}
                  >
                    <Tag
                      size={12}
                      className="shrink-0"
                      style={{ color: 'var(--color-muted)' }}
                    />
                    <span className="flex-1 text-left truncate">{tag.name}</span>
                    {tag.item_count > 0 && (
                      <span
                        className="text-xs tabular-nums shrink-0"
                        style={{ color: 'var(--color-placeholder)' }}
                      >
                        {tag.item_count}
                      </span>
                    )}
                  </button>
                ))}

                {tags.length > MAX_VISIBLE_TAGS && (
                  <button
                    type="button"
                    className="sidebar-item"
                    onClick={() => setShowAllTags((v) => !v)}
                  >
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {showAllTags
                        ? 'Ver menos'
                        : `Ver todos (${tags.length - MAX_VISIBLE_TAGS} más)`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="py-2 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button type="button" className="sidebar-item">
          <Import size={14} className="shrink-0" />
          <span>Importar</span>
        </button>
        <button type="button" className="sidebar-item">
          <Settings size={14} className="shrink-0" />
          <span>Configuración</span>
        </button>
        <button type="button" className="sidebar-item" onClick={handleLogout}>
          <LogOut size={14} className="shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategoryItem — separated to keep FolderTreeNode readable
// ---------------------------------------------------------------------------

interface CategoryItemProps {
  category: Category
  isActive: boolean
  onClick: () => void
}

function CategoryItem({ category, isActive, onClick }: CategoryItemProps) {
  return (
    <button
      type="button"
      className="sidebar-item w-full"
      style={{ background: isActive ? 'var(--color-selected)' : undefined }}
      onClick={onClick}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: category.color }}
        aria-hidden="true"
      />
      <span className="flex-1 text-left truncate">{category.name}</span>
      {typeof category.item_count === 'number' && category.item_count > 0 && (
        <span
          className="text-xs tabular-nums shrink-0"
          style={{ color: 'var(--color-placeholder)' }}
        >
          {category.item_count}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// MainLayout
// ---------------------------------------------------------------------------

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-canvas)' }}>
      {/* Sidebar — desktop (fixed) */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile (overlay drawer) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
            style={{
              width: 'var(--sidebar-width)',
              background: 'var(--color-sidebar)',
              borderRight: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between px-3 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Nucleo
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[240px]">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 lg:hidden sticky top-0 z-30 border-b"
          style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Nucleo
          </span>
          <button
            type="button"
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
        </header>

        {/* Desktop top bar */}
        <header
          className="hidden lg:flex items-center gap-3 px-6 py-3 sticky top-0 z-30 border-b"
          style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-2 flex-1 max-w-sm rounded px-3 py-1.5 border transition-colors cursor-text"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-sidebar)' }}
          >
            <Search size={14} style={{ color: 'var(--color-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-placeholder)' }}>
              Buscar…
            </span>
            <span
              className="ml-auto text-xs px-1 rounded"
              style={{
                color: 'var(--color-placeholder)',
                background: 'var(--color-hover)',
                fontSize: '11px',
              }}
            >
              ⌘K
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* FAB */}
      <button
        type="button"
        className="fab"
        aria-label="Capturar nuevo item"
        onClick={() => setCaptureOpen(true)}
      >
        <Plus size={22} strokeWidth={2} />
      </button>

      <CaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  )
}
