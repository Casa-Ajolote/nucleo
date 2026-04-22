'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Bookmark, Check, AlertTriangle } from 'lucide-react'
import { parseBookmarksHTML } from '@/features/import/utils/bookmarkParser'
import { createItemForImport, getOrCreateFolderByPath } from '@/features/import/services/importActions'
import { useItemsStore } from '@/features/dashboard/store/itemsStore'
import type { BookmarkParseResult, ParsedBookmark } from '@/features/import/utils/bookmarkParser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportState = 'idle' | 'preview' | 'importing' | 'done'

interface ImportError {
  title: string
  message: string
}

// ---------------------------------------------------------------------------
// ProgressBar (local — same pattern as CSVImporter)
// ---------------------------------------------------------------------------

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-hover)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BookmarkImporter
// ---------------------------------------------------------------------------

interface BookmarkImporterProps {
  /** Fallback workspace ID when accessed directly without going through a workspace page. */
  defaultWorkspaceId?: string
}

export function BookmarkImporter({ defaultWorkspaceId }: BookmarkImporterProps = {}) {
  const [state, setState] = useState<ImportState>('idle')
  const [parseResult, setParseResult] = useState<BookmarkParseResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [failed, setFailed] = useState(0)
  const [importErrors, setImportErrors] = useState<ImportError[]>([])
  const [succeededCount, setSucceededCount] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const { activeWorkspaceId: storeWorkspaceId, addItem } = useItemsStore()

  // Use the store's active workspace if set (user navigated through workspace page),
  // otherwise fall back to the server-resolved default workspace ID.
  const activeWorkspaceId = storeWorkspaceId ?? (defaultWorkspaceId || null)

  // ---------------------------------------------------------------------------
  // File processing
  // ---------------------------------------------------------------------------

  function processFile(file: File) {
    setFileError(null)

    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setFileError('Solo se aceptan archivos HTML exportados del navegador')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setFileError('El archivo no puede superar 20 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') {
        setFileError('No se pudo leer el archivo')
        return
      }
      const result = parseBookmarksHTML(text)
      if (result.total === 0) {
        setFileError('No se encontraron bookmarks válidos en el archivo')
        return
      }
      setParseResult(result)
      setState('preview')
    }
    reader.onerror = () => {
      setFileError('Error al leer el archivo')
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

  function handleDropzoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  // ---------------------------------------------------------------------------
  // Import loop
  // ---------------------------------------------------------------------------

  async function handleImport() {
    if (!parseResult || !activeWorkspaceId) return

    const bookmarks: ParsedBookmark[] = parseResult.bookmarks
    const total = bookmarks.length

    setState('importing')
    setImportTotal(total)
    setProgress(0)
    setFailed(0)
    setImportErrors([])

    let failCount = 0
    let successCount = 0
    const errors: ImportError[] = []

    for (let i = 0; i < bookmarks.length; i++) {
      const bm = bookmarks[i]

      let folderId: string | null = null
      if (bm.folderPath) {
        folderId = await getOrCreateFolderByPath(activeWorkspaceId, bm.folderPath)
      }

      const result = await createItemForImport(activeWorkspaceId, {
        content: bm.url,
        contentType: 'link',
        url: bm.url,
        folderId,
      })

      if (result.error) {
        failCount++
        if (errors.length < 5) {
          errors.push({ title: bm.title || bm.url, message: result.error })
        }
      } else {
        successCount++
        if (result.id) {
          addItem({
            id: result.id,
            title: bm.title || null,
            summary: null,
            content: bm.url,
            content_type: 'link',
            status: 'pending',
            tags: [],
            category: null,
            folder_id: folderId,
            thumbnail_url: null,
            url: bm.url,
            workspace_id: activeWorkspaceId,
            created_at: new Date().toISOString(),
          })
        }
      }

      setProgress(i + 1)
      setFailed(failCount)
    }

    setSucceededCount(successCount)
    setImportErrors(errors)
    setState('done')
  }

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  function handleReset() {
    setState('idle')
    setParseResult(null)
    setFileError(null)
    setProgress(0)
    setImportTotal(0)
    setFailed(0)
    setImportErrors([])
    setSucceededCount(0)
  }

  // ---------------------------------------------------------------------------
  // Render — idle
  // ---------------------------------------------------------------------------

  if (state === 'idle') {
    return (
      <div className="space-y-3">
        {/* Instructions */}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Exporta tus bookmarks desde Chrome (Administrador de marcadores → ⋮ → Exportar marcadores), Safari o Firefox, luego súbelos aquí.
        </p>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivo HTML de bookmarks. Arrastra o presiona Enter para seleccionar."
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleDropzoneKeyDown}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 text-center cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2"
          style={{
            borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
            background: isDragging ? 'var(--color-selected)' : 'var(--color-sidebar)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-hover)' }}
            aria-hidden="true"
          >
            <Upload size={16} style={{ color: 'var(--color-muted)' }} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
              Arrastra el archivo HTML aquí o haz click para seleccionar
            </p>
            <p className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
              Máximo 20 MB · Chrome, Safari y Firefox
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm"
            className="sr-only"
            onChange={handleFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        {/* File error */}
        {fileError && (
          <div
            className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
            role="alert"
            style={{
              background: 'rgba(235, 87, 87, 0.08)',
              border: '1px solid rgba(235, 87, 87, 0.2)',
              color: 'var(--color-error)',
            }}
          >
            <AlertTriangle size={13} className="shrink-0" aria-hidden="true" />
            {fileError}
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render — preview
  // ---------------------------------------------------------------------------

  if (state === 'preview' && parseResult) {
    const previewBookmarks = parseResult.bookmarks.slice(0, 10)
    const total = parseResult.total
    const uniqueFolders = parseResult.folders

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark size={15} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Vista previa — <strong>{total}</strong> {total === 1 ? 'bookmark encontrado' : 'bookmarks encontrados'}
          </p>
        </div>

        {/* Preview list */}
        <div
          className="rounded-lg border divide-y overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {previewBookmarks.map((bm, i) => {
            let hostname = bm.url
            try { hostname = new URL(bm.url).hostname } catch { /* keep original */ }

            return (
              <div
                key={i}
                className="flex items-start gap-3 px-3 py-2.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Bookmark
                  size={13}
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--color-muted)' }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--color-ink)' }}>
                    {bm.title || hostname}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-placeholder)' }}>
                    {hostname}
                    {bm.folderPath && (
                      <span style={{ color: 'var(--color-muted)' }}> · {bm.folderPath}</span>
                    )}
                  </p>
                </div>
              </div>
            )
          })}

          {total > 10 && (
            <p
              className="px-3 py-2 text-xs italic"
              style={{ color: 'var(--color-placeholder)' }}
            >
              … y {total - 10} {total - 10 === 1 ? 'bookmark más' : 'bookmarks más'}
            </p>
          )}
        </div>

        {/* Folders notice */}
        {uniqueFolders.length > 0 && (
          <div
            className="rounded-lg px-3 py-2.5"
            style={{
              background: 'var(--color-sidebar)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Se crearán {uniqueFolders.length} {uniqueFolders.length === 1 ? 'carpeta nueva' : 'carpetas nuevas'}:
            </p>
            <div className="flex flex-wrap gap-1">
              {uniqueFolders.slice(0, 8).map((folder) => (
                <span
                  key={folder}
                  className="text-xs rounded px-1.5 py-0.5"
                  style={{
                    background: 'var(--color-hover)',
                    color: 'var(--color-muted)',
                  }}
                >
                  {folder}
                </span>
              ))}
              {uniqueFolders.length > 8 && (
                <span className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
                  +{uniqueFolders.length - 8} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={total === 0 || !activeWorkspaceId}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
            }}
            aria-busy={false}
          >
            Importar {total} {total === 1 ? 'bookmark' : 'bookmarks'}
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render — importing
  // ---------------------------------------------------------------------------

  if (state === 'importing') {
    return (
      <div className="space-y-4 py-2" role="status" aria-live="polite">
        <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          Importando bookmarks…
        </p>
        <ProgressBar
          current={progress}
          total={importTotal}
          label={`Importando ${progress} de ${importTotal} bookmarks…`}
        />
        {failed > 0 && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {failed} {failed === 1 ? 'error' : 'errores'} hasta ahora
          </p>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render — done
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(39, 174, 96, 0.12)' }}
          aria-hidden="true"
        >
          <Check size={15} style={{ color: '#27AE60' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            {succeededCount} {succeededCount === 1 ? 'bookmark importado' : 'bookmarks importados'} exitosamente.
            {failed > 0 && (
              <span style={{ color: 'var(--color-error)' }}> {failed} {failed === 1 ? 'falló' : 'fallaron'}.</span>
            )}
          </p>
        </div>
      </div>

      {importErrors.length > 0 && (
        <div
          className="rounded-lg px-3 py-2.5 space-y-1"
          role="alert"
          style={{
            background: 'rgba(235, 87, 87, 0.06)',
            border: '1px solid rgba(235, 87, 87, 0.2)',
          }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
            Errores de importación
          </p>
          <ul className="space-y-0.5">
            {importErrors.map((err, i) => (
              <li key={i} className="text-xs" style={{ color: 'var(--color-error)' }}>
                <span className="font-medium">{err.title}:</span> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
        style={{
          background: 'var(--color-accent)',
          color: '#fff',
        }}
      >
        Importar más
      </button>
    </div>
  )
}
