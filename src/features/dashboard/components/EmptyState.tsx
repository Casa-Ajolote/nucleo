'use client'

import { Inbox, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  variant: 'empty-workspace' | 'no-results'
  onCapture?: () => void
  onClearFilters?: () => void
}

export function EmptyState({ variant, onCapture, onClearFilters }: EmptyStateProps) {
  if (variant === 'empty-workspace') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Inbox size={48} className="text-muted" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink">Tu workspace está vacío</p>
          <p className="text-xs text-muted">Guarda tu primer recurso para empezar</p>
        </div>
        <button
          onClick={onCapture}
          className={cn(
            'mt-1 px-4 py-2 rounded text-sm font-medium text-white transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
          style={{ background: 'var(--color-accent)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-accent-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-accent)'
          }}
        >
          Capturar algo
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <SearchX size={48} className="text-muted" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">Sin resultados</p>
        <p className="text-xs text-muted">
          No hay items que coincidan con los filtros actuales.
        </p>
      </div>
      <button
        onClick={onClearFilters}
        className={cn(
          'mt-1 px-3 py-1.5 rounded text-sm text-muted hover:text-ink hover:bg-hover',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
      >
        Limpiar filtros
      </button>
    </div>
  )
}
