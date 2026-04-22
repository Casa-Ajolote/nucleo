'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          color: '#37352f',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '400px',
          }}
        >
          <p
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              marginBottom: '1rem',
            }}
            aria-hidden="true"
          >
            ⚠
          </p>
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#37352f',
            }}
          >
            Algo salió mal
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#787774',
              marginBottom: '1.5rem',
            }}
          >
            Ocurrió un error inesperado. Puedes intentar de nuevo o recargar la página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2383e2',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#9b9a97',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
