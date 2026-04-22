'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, FileText, Check, AlertTriangle } from 'lucide-react'
import { parseCSV, generateCSVTemplate } from '@/features/import/utils/csvParser'
import { createItemForImport, getOrCreateFolderByPath } from '@/features/import/services/importActions'
import { useItemsStore } from '@/features/dashboard/store/itemsStore'
import type { CSVParseResult, CSVRow } from '@/features/import/utils/csvParser'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportState = 'idle' | 'preview' | 'importing' | 'done'

interface ImportError {
  row: string
  message: string
}

// ---------------------------------------------------------------------------
// ProgressBar
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
// CSVImporter
// ---------------------------------------------------------------------------

interface CSVImporterProps {
  /** Fallback workspace ID when accessed directly without going through a workspace page. */
  defaultWorkspaceId?: string
}

export function CSVImporter({ defaultWorkspaceId }: CSVImporterProps = {}) {
  const [state, setState] = useState<ImportState>('idle')
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
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
  // Template download
  // ---------------------------------------------------------------------------

  function handleDownloadTemplate() {
    const csv = generateCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nucleo-import-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ---------------------------------------------------------------------------
  // File processing
  // ---------------------------------------------------------------------------

  function processFile(file: File) {
    setFileError(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Solo se aceptan archivos CSV')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('El archivo no puede superar 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') {
        setFileError('No se pudo leer el archivo')
        return
      }
      const result = parseCSV(text)
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
    // Reset so same file can be re-selected
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

    const rows: CSVRow[] = parseResult.rows
    const total = rows.length

    setState('importing')
    setImportTotal(total)
    setProgress(0)
    setFailed(0)
    setImportErrors([])

    let failCount = 0
    let successCount = 0
    const errors: ImportError[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      let folderId: string | null = null
      if (row.carpeta) {
        folderId = await getOrCreateFolderByPath(activeWorkspaceId, row.carpeta)
      }

      const result = await createItemForImport(activeWorkspaceId, {
        content: row.contenido || row.url,
        contentType: row.tipo,
        url: row.url || undefined,
        folderId,
      })

      if (result.error) {
        failCount++
        if (errors.length < 5) {
          errors.push({
            row: row.titulo || `Fila ${i + 2}`,
            message: result.error,
          })
        }
      } else {
        successCount++
        if (result.id) {
          addItem({
            id: result.id,
            title: row.titulo || null,
            summary: null,
            content: row.contenido || row.url,
            content_type: row.tipo,
            status: 'pending',
            tags: row.tags,
            category: row.categoria || null,
            folder_id: folderId,
            thumbnail_url: null,
            url: row.url || null,
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
        {/* Download template */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-hover)'
            e.currentTarget.style.color = 'var(--color-ink)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-muted)'
          }}
        >
          <Download size={13} aria-hidden="true" />
          Descargar plantilla CSV
        </button>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivo CSV. Arrastra o presiona Enter para seleccionar."
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
              Arrastra tu CSV aquí o haz click para seleccionar
            </p>
            <p className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
              Máximo 5 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
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
    const previewRows = parseResult.rows.slice(0, 5)
    const totalRows = parseResult.rows.length

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={15} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
            Vista previa — <strong>{totalRows}</strong> {totalRows === 1 ? 'fila' : 'filas'} a importar
          </p>
        </div>

        {/* Preview table */}
        {previewRows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--color-sidebar)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Título', 'Tipo', 'Tags', 'Carpeta'].map((col) => (
                    <th
                      key={col}
                      className="text-left px-3 py-2 font-medium"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: i < previewRows.length - 1 ? '1px solid var(--color-border)' : undefined }}
                  >
                    <td className="px-3 py-2 max-w-[140px] truncate" style={{ color: 'var(--color-ink)' }}>
                      {row.titulo || <span style={{ color: 'var(--color-placeholder)' }}>Sin título</span>}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--color-muted)' }}>
                      {row.tipo}
                    </td>
                    <td className="px-3 py-2 max-w-[120px] truncate" style={{ color: 'var(--color-muted)' }}>
                      {row.tags.length > 0 ? row.tags.join(', ') : <span style={{ color: 'var(--color-placeholder)' }}>—</span>}
                    </td>
                    <td className="px-3 py-2 max-w-[100px] truncate" style={{ color: 'var(--color-muted)' }}>
                      {row.carpeta || <span style={{ color: 'var(--color-placeholder)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalRows > 5 && (
              <p
                className="px-3 py-2 text-xs italic"
                style={{ color: 'var(--color-placeholder)', borderTop: '1px solid var(--color-border)' }}
              >
                … y {totalRows - 5} {totalRows - 5 === 1 ? 'fila más' : 'filas más'}
              </p>
            )}
          </div>
        )}

        {/* Warnings */}
        {parseResult.errors.length > 0 && (
          <div
            className="rounded-lg px-3 py-2.5 space-y-1"
            role="status"
            style={{
              background: 'rgba(234, 179, 8, 0.06)',
              border: '1px solid rgba(234, 179, 8, 0.2)',
            }}
          >
            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#92400e' }}>
              <AlertTriangle size={12} aria-hidden="true" />
              Advertencias
            </p>
            <ul className="space-y-0.5">
              {parseResult.errors.slice(0, 5).map((err, i) => (
                <li key={i} className="text-xs" style={{ color: '#92400e' }}>
                  {err}
                </li>
              ))}
              {parseResult.errors.length > 5 && (
                <li className="text-xs" style={{ color: '#92400e' }}>
                  … y {parseResult.errors.length - 5} más
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Skipped notice */}
        {parseResult.skipped > 0 && (
          <p className="text-xs" style={{ color: 'var(--color-placeholder)' }}>
            Se omitirán {parseResult.skipped} {parseResult.skipped === 1 ? 'fila' : 'filas'} con contenido vacío.
          </p>
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
            disabled={totalRows === 0 || !activeWorkspaceId}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
            }}
            aria-busy={false}
          >
            Importar {totalRows} {totalRows === 1 ? 'item' : 'items'}
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
          Importando…
        </p>
        <ProgressBar
          current={progress}
          total={importTotal}
          label={`Importando ${progress} de ${importTotal} items…`}
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
            {succeededCount} {succeededCount === 1 ? 'item importado' : 'items importados'} exitosamente.
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
                <span className="font-medium">{err.row}:</span> {err.message}
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
