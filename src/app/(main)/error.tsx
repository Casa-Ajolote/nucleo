'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MainError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
      style={{ color: 'var(--color-ink)' }}
    >
      <p className="text-3xl leading-none mb-4" aria-hidden="true">
        ⚠
      </p>
      <h1
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-ink)' }}
      >
        Algo salió mal
      </h1>
      <p
        className="text-sm mb-6 max-w-sm"
        style={{ color: 'var(--color-muted)' }}
      >
        Ocurrió un error inesperado en esta página. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
          }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
            backgroundColor: 'transparent',
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
      {error.digest && (
        <p
          className="mt-4 text-xs font-mono"
          style={{ color: 'var(--color-placeholder)' }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
