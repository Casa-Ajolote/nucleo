'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Collapsible from '@radix-ui/react-collapsible'
import { X, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectContentType, type ContentType } from '@/features/capture/services/detect'
import { ContentTypeBadge } from '@/features/capture/components/ContentTypeBadge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FolderOption {
  id: string | null
  name: string
  depth: number
  parentId?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FOLDERS: FolderOption[] = [
  { id: null, name: 'Sin carpeta', depth: 0 },
  { id: 'f1', name: 'Claude Code', depth: 0 },
  { id: 'f2', name: 'Skills', depth: 1, parentId: 'f1' },
  { id: 'f3', name: 'Ideas', depth: 0 },
]

const DUPLICATE_URL = 'https://nextjs.org/docs'
const MAX_CONTENT_LENGTH = 50_000

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaptureDialog({ open, onOpenChange }: CaptureDialogProps) {
  const [content, setContent] = useState('')
  const [detectedType, setDetectedType] = useState<ContentType | null>(null)
  const [folderOpen, setFolderOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const duplicateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset all internal state
  const resetState = useCallback(() => {
    setContent('')
    setDetectedType(null)
    setFolderOpen(false)
    setSelectedFolder(null)
    setIsDuplicate(false)
    setIsSubmitting(false)
    setError(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [])

  // Clear duplicate timer on unmount
  useEffect(() => {
    return () => {
      if (duplicateTimerRef.current) {
        clearTimeout(duplicateTimerRef.current)
      }
    }
  }, [])

  // Autofocus textarea when dialog opens
  useEffect(() => {
    if (open) {
      // Slight delay to let Radix finish the open animation
      const id = setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
      return () => clearTimeout(id)
    }
  }, [open])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`

    const value = el.value
    setContent(value)
    setError(null)
    setIsDuplicate(false)

    if (value.trim()) {
      const type = detectContentType(value)
      setDetectedType(type)

      // Duplicate check for links (simulated)
      if (duplicateTimerRef.current) {
        clearTimeout(duplicateTimerRef.current)
      }
      if (type === 'link') {
        duplicateTimerRef.current = setTimeout(() => {
          if (value.trim() === DUPLICATE_URL) {
            setIsDuplicate(true)
          }
        }, 500)
      }
    } else {
      setDetectedType(null)
    }
  }

  function handleRequestClose() {
    if (content.trim()) {
      const confirmed = window.confirm('¿Descartar lo escrito?')
      if (!confirmed) return
    }
    resetState()
    onOpenChange(false)
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Pega o escribe algo para guardar')
      return
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError('El contenido es demasiado largo. Máximo 50,000 caracteres.')
      return
    }

    setIsSubmitting(true)

    await new Promise<void>((resolve) => setTimeout(resolve, 800))

    resetState()
    onOpenChange(false)
  }

  function handleFolderSelect(id: string | null) {
    setSelectedFolder(id)
  }

  // ---------------------------------------------------------------------------
  // Radix close interception
  // We use onInteractOutside and onEscapeKeyDown to inject the confirm guard.
  // ---------------------------------------------------------------------------

  function handleInteractOutside(e: Event) {
    if (content.trim()) {
      e.preventDefault()
      const confirmed = window.confirm('¿Descartar lo escrito?')
      if (confirmed) {
        resetState()
        onOpenChange(false)
      }
    }
  }

  function handleEscapeKeyDown(e: KeyboardEvent) {
    if (content.trim()) {
      e.preventDefault()
      const confirmed = window.confirm('¿Descartar lo escrito?')
      if (confirmed) {
        resetState()
        onOpenChange(false)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isEmpty = !content.trim()
  const canSubmit = !isEmpty && !isSubmitting

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) handleRequestClose() }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
        />

        {/* Content */}
        <Dialog.Content
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
          className={cn(
            'fixed z-50 flex flex-col',
            // Mobile: bottom sheet
            'bottom-0 left-0 right-0 rounded-t-xl',
            // Desktop: centered modal
            'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:rounded-xl sm:max-w-lg sm:w-full',
            'shadow-xl',
            'outline-none'
          )}
          style={{ background: 'var(--color-canvas)' }}
          aria-describedby="capture-dialog-description"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Dialog.Title
              className="text-sm font-semibold"
              style={{ color: 'var(--color-ink)' }}
            >
              Capturar
            </Dialog.Title>
            <Dialog.Description id="capture-dialog-description" className="sr-only">
              Pega un link, texto, markdown o comando para guardarlo en tu segundo cerebro.
            </Dialog.Description>
            <button
              type="button"
              onClick={handleRequestClose}
              aria-label="Cerrar dialog"
              className="flex items-center justify-center w-6 h-6 rounded transition-colors"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              placeholder="Pega un link, texto, markdown o comando…"
              aria-label="Contenido a capturar"
              aria-required="true"
              aria-invalid={error !== null}
              disabled={isSubmitting}
              rows={4}
              className="w-full resize-none rounded px-3 py-2.5 text-sm border outline-none min-h-[120px] transition-all duration-150 disabled:opacity-60"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-canvas)',
                color: 'var(--color-ink)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(35,131,226,0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />

            {/* Badge row */}
            {detectedType && (
              <div className="flex items-center gap-2">
                <ContentTypeBadge type={detectedType} />
              </div>
            )}

            {/* Error */}
            {error && (
              <p
                className="text-xs flex items-center gap-1.5"
                style={{ color: 'var(--color-error)' }}
                role="alert"
              >
                <span aria-hidden="true">!</span>
                {error}
              </p>
            )}

            {/* Duplicate warning */}
            {isDuplicate && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded text-xs"
                style={{
                  background: 'rgba(223,171,1,0.1)',
                  color: '#A07800',
                  border: '1px solid rgba(223,171,1,0.25)',
                }}
                role="status"
              >
                <AlertTriangle size={12} aria-hidden="true" />
                Ya tienes este link guardado.
              </div>
            )}
          </div>

          {/* Folder toggle */}
          <div className="px-4 pb-2">
            <Collapsible.Root open={folderOpen} onOpenChange={setFolderOpen}>
              <Collapsible.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors py-1"
                  style={{ color: 'var(--color-accent)' }}
                  aria-expanded={folderOpen}
                >
                  {folderOpen ? (
                    <ChevronUp size={12} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={12} aria-hidden="true" />
                  )}
                  {selectedFolder
                    ? `Carpeta: ${FOLDERS.find((f) => f.id === selectedFolder)?.name ?? 'Sin carpeta'}`
                    : '+ Guardar en carpeta…'}
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content>
                <div
                  className="mt-1 rounded border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)' }}
                  role="listbox"
                  aria-label="Seleccionar carpeta"
                >
                  {FOLDERS.map((folder) => {
                    const isSelected = selectedFolder === folder.id
                    const paddingLeft = 12 + folder.depth * 12

                    return (
                      <button
                        key={String(folder.id)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleFolderSelect(folder.id)}
                        className="w-full flex items-center gap-2 py-2 pr-3 text-xs transition-colors"
                        style={{
                          paddingLeft,
                          background: isSelected
                            ? 'var(--color-selected)'
                            : 'var(--color-canvas)',
                          color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--color-hover)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--color-canvas)'
                          }
                        }}
                      >
                        {/* Radio circle */}
                        <span
                          className="flex items-center justify-center w-3.5 h-3.5 rounded-full border shrink-0"
                          style={{
                            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-muted)',
                            background: isSelected ? 'var(--color-accent)' : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#fff' }}
                            />
                          )}
                        </span>

                        {/* Folder emoji for non-root */}
                        {folder.id !== null && (
                          <span aria-hidden="true">
                            {folder.depth > 0 ? '└ 📁' : '📁'}
                          </span>
                        )}

                        {folder.name}
                      </button>
                    )
                  })}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {isDuplicate ? (
              /* Duplicate mode: two buttons */
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="flex-1 py-2 rounded text-sm font-medium transition-colors border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-ink)',
                    background: 'var(--color-canvas)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-canvas)'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--color-accent)',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'var(--color-accent-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-accent)'
                  }}
                >
                  Sí, guardar igual
                </button>
              </div>
            ) : (
              /* Default mode: single primary button */
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-busy={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canSubmit ? 'var(--color-accent)' : 'var(--color-border)',
                  color: canSubmit ? '#fff' : 'var(--color-muted)',
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) {
                    e.currentTarget.style.background = 'var(--color-accent-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canSubmit
                    ? 'var(--color-accent)'
                    : 'var(--color-border)'
                }}
              >
                {isSubmitting && (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                )}
                {isSubmitting ? 'Guardando…' : 'Guardar'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
