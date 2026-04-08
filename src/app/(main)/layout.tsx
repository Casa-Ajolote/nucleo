'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  Folder,
  Tag,
  Hash,
  Settings,
  Import,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaptureDialog } from '@/features/capture/components/CaptureDialog'

const WORKSPACES = [
  { id: 'personal', name: 'Personal', icon: '📁', active: true },
  { id: 'trabajo', name: 'Trabajo', icon: '💼', active: false },
  { id: 'side', name: 'Side Projects', icon: '🚀', active: false },
]

const FOLDERS = [
  {
    id: 'claude',
    name: 'Claude Code',
    open: true,
    children: [
      { id: 'comandos', name: 'Comandos' },
      { id: 'prompts', name: 'Prompts' },
    ],
  },
  { id: 'react', name: 'React', open: false, children: [] },
  { id: 'ia', name: 'IA', open: false, children: [] },
]

const CATEGORIES = [
  { id: 'dev', name: 'Development', color: '#2383E2', count: 24 },
  { id: 'ai', name: 'AI', color: '#0F7B6C', count: 18 },
  { id: 'design', name: 'Design', color: '#DFAB01', count: 7 },
  { id: 'biz', name: 'Business', color: '#EB5757', count: 3 },
]

const TOP_TAGS = [
  { id: 'claude-code', name: 'claude-code', count: 12 },
  { id: 'react', name: 'react', count: 8 },
  { id: 'prompts', name: 'prompts', count: 6 },
  { id: 'nextjs', name: 'nextjs', count: 5 },
  { id: 'supabase', name: 'supabase', count: 4 },
]

function SidebarContent() {
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    new Set(FOLDERS.filter((f) => f.open).map((f) => f.id))
  )
  const [activeWorkspace, setActiveWorkspace] = useState('personal')

  function toggleFolder(id: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
          Nucleo
        </span>
      </div>

      <div className="flex-1 py-2 space-y-4 overflow-y-auto">
        {/* Workspaces */}
        <section>
          <p className="sidebar-section-header">Workspaces</p>
          {WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              className={cn('sidebar-item', activeWorkspace === ws.id && 'active')}
              onClick={() => setActiveWorkspace(ws.id)}
            >
              <span className="text-base leading-none">{ws.icon}</span>
              <span className="flex-1 text-left">{ws.name}</span>
              {activeWorkspace === ws.id && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>
          ))}
          <button className="sidebar-item">
            <Plus size={14} className="shrink-0" />
            <span>Crear workspace</span>
          </button>
        </section>

        <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

        {/* Carpetas */}
        <section>
          <p className="sidebar-section-header">Carpetas</p>
          {FOLDERS.map((folder) => {
            const isOpen = openFolders.has(folder.id)
            return (
              <div key={folder.id}>
                <button
                  className="sidebar-item"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {folder.children.length > 0 ? (
                    isOpen ? (
                      <ChevronDown size={13} className="shrink-0" />
                    ) : (
                      <ChevronRight size={13} className="shrink-0" />
                    )
                  ) : (
                    <span className="w-[13px] shrink-0" />
                  )}
                  <Folder size={14} className="shrink-0" />
                  <span className="flex-1 text-left">{folder.name}</span>
                </button>
                {isOpen && folder.children.length > 0 && (
                  <div className="ml-5">
                    {folder.children.map((child) => (
                      <button key={child.id} className="sidebar-item pl-3">
                        <span className="flex-1 text-left">{child.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <button className="sidebar-item">
            <Plus size={14} className="shrink-0" />
            <span>Nueva carpeta</span>
          </button>
        </section>

        <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

        {/* Categorías */}
        <section>
          <p className="sidebar-section-header">Categorías</p>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} className="sidebar-item">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: cat.color }}
              />
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
                {cat.count}
              </span>
            </button>
          ))}
        </section>

        <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

        {/* Tags */}
        <section>
          <p className="sidebar-section-header">Tags</p>
          {TOP_TAGS.map((tag) => (
            <button key={tag.id} className="sidebar-item">
              <Hash size={13} className="shrink-0" />
              <span className="flex-1 text-left">{tag.name}</span>
              <span className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
                {tag.count}
              </span>
            </button>
          ))}
          <button className="sidebar-item">
            <Tag size={13} className="shrink-0" />
            <span>Ver todos</span>
          </button>
        </section>
      </div>

      {/* Footer */}
      <div
        className="py-2 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button className="sidebar-item">
          <Import size={14} className="shrink-0" />
          <span>Importar</span>
        </button>
        <button className="sidebar-item">
          <Settings size={14} className="shrink-0" />
          <span>Configuración</span>
        </button>
        <button className="sidebar-item">
          <LogOut size={14} className="shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Nucleo
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[240px]">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 lg:hidden sticky top-0 z-30 border-b"
          style={{
            background: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <Menu size={18} />
          </button>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Personal
          </span>
          <button
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <Search size={18} />
          </button>
        </header>

        {/* Desktop top bar */}
        <header
          className="hidden lg:flex items-center gap-3 px-6 py-3 sticky top-0 z-30 border-b"
          style={{
            background: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center gap-2 flex-1 max-w-sm rounded px-3 py-1.5 border transition-colors cursor-text"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-sidebar)',
            }}
          >
            <Search size={14} style={{ color: 'var(--color-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-placeholder)' }}>
              Buscar en Personal…
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

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {/* FAB */}
      <button
        className="fab"
        aria-label="Capturar nuevo item"
        onClick={() => setCaptureOpen(true)}
      >
        <Plus size={22} strokeWidth={2} />
      </button>

      {/* Capture dialog */}
      <CaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  )
}
