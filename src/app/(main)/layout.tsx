'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaptureDialog } from '@/features/capture/components/CaptureDialog'
import { createClient } from '@/lib/supabase/client'
import { logoutAction } from '@/features/auth/services/actions'

interface Workspace {
  id: string
  name: string
  slug: string
  icon: string
  position: number
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

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
          if (data) setWorkspaces(data)
        })
    })
  }, [])

  async function handleLogout() {
    onClose?.()
    await logoutAction()
    router.push('/login')
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
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/w/${ws.id}`}
              className="sidebar-item"
              onClick={onClose}
            >
              <span className="text-base leading-none">{ws.icon}</span>
              <span className="flex-1 text-left">{ws.name}</span>
            </Link>
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
          <button className="sidebar-item">
            <ChevronRight size={13} className="shrink-0" />
            <Folder size={14} className="shrink-0" />
            <span className="flex-1 text-left text-muted italic text-xs">Sin carpetas aún</span>
          </button>
          <button className="sidebar-item">
            <Plus size={14} className="shrink-0" />
            <span>Nueva carpeta</span>
          </button>
        </section>

        <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

        {/* Categorías */}
        <section>
          <p className="sidebar-section-header">Categorías</p>
          <p className="px-3 py-1 text-xs italic" style={{ color: 'var(--color-placeholder)' }}>
            Sin categorías aún
          </p>
        </section>

        <div className="h-px mx-2" style={{ background: 'var(--color-border)' }} />

        {/* Tags */}
        <section>
          <p className="sidebar-section-header">Tags</p>
          <p className="px-3 py-1 text-xs italic" style={{ color: 'var(--color-placeholder)' }}>
            Sin tags aún
          </p>
          <button className="sidebar-item">
            <Tag size={13} className="shrink-0" />
            <span>Ver todos</span>
          </button>
        </section>
      </div>

      {/* Footer */}
      <div className="py-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button className="sidebar-item">
          <Import size={14} className="shrink-0" />
          <span>Importar</span>
        </button>
        <button className="sidebar-item">
          <Settings size={14} className="shrink-0" />
          <span>Configuración</span>
        </button>
        <button className="sidebar-item" onClick={handleLogout}>
          <LogOut size={14} className="shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

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
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <Menu size={18} />
          </button>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Nucleo
          </span>
          <button className="p-1 rounded transition-colors" style={{ color: 'var(--color-muted)' }}>
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
