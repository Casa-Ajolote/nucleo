// Client-safe utility — no server imports

export interface CSVRow {
  titulo: string
  url: string
  contenido: string
  tipo: 'link' | 'text' | 'markdown' | 'command'
  categoria: string
  tags: string[]
  carpeta: string
}

export interface CSVParseResult {
  rows: CSVRow[]
  errors: string[]  // e.g. "Fila 3: campo 'contenido' vacío"
  skipped: number   // rows omitted
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_TIPOS = new Set<CSVRow['tipo']>(['link', 'text', 'markdown', 'command'])

function normalizeTipo(raw: string): CSVRow['tipo'] {
  const lower = raw.trim().toLowerCase() as CSVRow['tipo']
  return VALID_TIPOS.has(lower) ? lower : 'text'
}

function parseTags(raw: string): string[] {
  if (!raw.trim()) return []
  // Support both | and , as separators
  return raw
    .split(/[|,]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Parse a single CSV line respecting double-quoted fields.
 * Handles escaped quotes ("") inside quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        // Peek ahead — escaped quote?
        if (line[i + 1] === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
    i++
  }

  fields.push(current)
  return fields
}

// ---------------------------------------------------------------------------
// parseCSV
// ---------------------------------------------------------------------------

const REQUIRED_HEADERS = ['titulo', 'contenido'] as const

export function parseCSV(text: string): CSVParseResult {
  const rows: CSVRow[] = []
  const errors: string[] = []
  let skipped = 0

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    errors.push('El archivo está vacío')
    return { rows, errors, skipped }
  }

  // Parse headers — normalize to lowercase, trim whitespace
  const rawHeaders = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())

  // Validate required columns exist
  for (const required of REQUIRED_HEADERS) {
    if (!rawHeaders.includes(required)) {
      errors.push(`Falta la columna requerida: '${required}'`)
    }
  }

  if (errors.length > 0) {
    return { rows, errors, skipped }
  }

  const headerIndex: Record<string, number> = {}
  rawHeaders.forEach((h, idx) => {
    headerIndex[h] = idx
  })

  // Helper to extract field value by column name
  function getField(fields: string[], column: string): string {
    const idx = headerIndex[column]
    if (idx === undefined) return ''
    return (fields[idx] ?? '').trim()
  }

  // Process data rows (skip header)
  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const rowNumber = lineIdx + 1 // 1-indexed for user messages
    const line = lines[lineIdx]

    // Skip blank lines silently
    if (!line.trim()) {
      skipped++
      continue
    }

    const fields = parseCSVLine(line)
    const contenido = getField(fields, 'contenido')

    // Rule: if contenido is empty → skip row
    if (!contenido) {
      skipped++
      errors.push(`Fila ${rowNumber}: campo 'contenido' vacío — fila omitida`)
      continue
    }

    const titulo = getField(fields, 'titulo')
    if (!titulo) {
      errors.push(`Fila ${rowNumber}: campo 'titulo' vacío`)
      // Still include row — titulo is not strictly blocking
    }

    const rawUrl = getField(fields, 'url')
    const rawCarpeta = getField(fields, 'carpeta')

    rows.push({
      titulo,
      url: rawUrl,
      contenido,
      tipo: normalizeTipo(getField(fields, 'tipo')),
      categoria: getField(fields, 'categoria'),
      tags: parseTags(getField(fields, 'tags')),
      carpeta: rawCarpeta,
    })
  }

  return { rows, errors, skipped }
}

// ---------------------------------------------------------------------------
// generateCSVTemplate
// ---------------------------------------------------------------------------

export function generateCSVTemplate(): string {
  const header = 'titulo,url,contenido,tipo,categoria,tags,carpeta'
  const example1 =
    'Mi primer link,https://ejemplo.com,,link,Development,react|nextjs,Ideas'
  const example2 = 'Mi nota,,Este es el texto de la nota,text,AI,ai|tools,'
  return [header, example1, example2].join('\n')
}
