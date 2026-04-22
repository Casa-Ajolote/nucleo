'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Share } from 'lucide-react'

const DISMISS_KEY = 'nucleo-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

export function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Register service worker once on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    // Already dismissed — do not show
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    // Already installed — do not show
    if (isInStandaloneMode()) return

    const ios = isIOS()
    setIsIos(ios)

    if (ios) {
      // iOS: show the manual instructions banner immediately
      setIsVisible(true)
      return
    }

    // Chrome / Edge: wait for the native prompt event
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1')
    setIsVisible(false)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1')
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }, [deferredPrompt])

  if (!isVisible) return null

  return (
    <div
      role="banner"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-80 rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-4"
      style={{
        background: 'var(--color-canvas)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-ink)',
      }}
    >
      <div
        className="mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: 'var(--color-selected)' }}
        aria-hidden="true"
      >
        {isIos ? (
          <Share size={16} style={{ color: 'var(--color-accent)' }} />
        ) : (
          <Download size={16} style={{ color: 'var(--color-accent)' }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-ink)' }}>
          Instala Nucleo
        </p>

        {isIos ? (
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Toca <strong style={{ color: 'var(--color-ink)' }}>Compartir</strong> y luego{' '}
            <strong style={{ color: 'var(--color-ink)' }}>Agregar a pantalla de inicio</strong>
          </p>
        ) : (
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
              style={{
                background: 'var(--color-accent)',
                color: '#ffffff',
              }}
            >
              Instalar app
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-md transition-colors mt-0.5"
        style={{ color: 'var(--color-muted)' }}
        aria-label="Cerrar banner de instalación"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
