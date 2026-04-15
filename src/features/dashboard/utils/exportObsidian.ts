import type { NucleoItem, ContentType } from '../types'

// ---------------------------------------------------------------------------
// Type mapping
// ---------------------------------------------------------------------------

const CONTENT_TYPE_TO_OBSIDIAN: Record<ContentType, string> = {
  link: 'article',
  text: 'note',
  markdown: 'note',
  command: 'prompt',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a title string to a URL-safe kebab-case slug.
 * Normalizes diacritics so accented characters become their ASCII base.
 * Examples:
 *   "Guía de Tailwind CSS" → "guia-de-tailwind-css"
 *   "¿Cómo funciona Rust?" → "como-funciona-rust"
 */
export function toObsidianSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')    // strip combining diacritics
    .replace(/[^a-z0-9\s-]/g, '')       // keep alphanumeric + spaces + hyphens
    .trim()
    .replace(/\s+/g, '-')               // spaces → hyphens
    .replace(/-{2,}/g, '-')             // collapse double hyphens
    .slice(0, 80)
}

/** Extracts YYYY-MM-DD from an ISO timestamp string. */
function toDateString(isoString: string): string {
  return isoString.slice(0, 10)
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildFrontmatter(item: NucleoItem): string {
  const type = CONTENT_TYPE_TO_OBSIDIAN[item.content_type]
  const date = toDateString(item.created_at)
  const tagsLine = item.tags.length > 0 ? `[${item.tags.join(', ')}]` : '[]'
  const topic = item.category ?? ''

  return [
    '---',
    `type: ${type}`,
    'source: nucleo',
    `url: ${item.url ?? ''}`,
    `date_saved: ${date}`,
    `tags: ${tagsLine}`,
    `topic: ${topic}`,
    '---',
  ].join('\n')
}

function buildBody(item: NucleoItem, displayTitle: string): string {
  const date = toDateString(item.created_at)
  const tagsFormatted = item.tags.length > 0 ? item.tags.map((t) => `#${t}`).join(' ') : ''
  const source = item.url ?? item.content_type

  const whySaved = item.summary
    ? `Guardado para referencia: ${item.summary.slice(0, 200)}${item.summary.length > 200 ? '…' : ''}`
    : '_Sin nota._'

  return [
    `# ${displayTitle}`,
    '',
    `**Fuente:** ${source}  `,
    `**Fecha:** ${date}  `,
    `**Tags:** ${tagsFormatted}`,
    '',
    '## Contenido',
    '',
    item.content,
    '',
    '## Por qué lo guardé',
    '',
    whySaved,
    '',
    '## Links relacionados',
    '',
    '_Vacío por ahora._',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the filename for the exported .md file.
 * Format: YYYY-MM-DD-slug-del-titulo.md
 */
export function buildObsidianFilename(item: NucleoItem, displayTitle: string): string {
  const date = toDateString(item.created_at)
  const slug = toObsidianSlug(displayTitle)
  return `${date}-${slug}.md`
}

/**
 * Builds the complete Obsidian-compatible .md document string.
 * Pure function — no side effects.
 */
export function buildObsidianDocument(item: NucleoItem, displayTitle: string): string {
  const frontmatter = buildFrontmatter(item)
  const body = buildBody(item, displayTitle)
  return `${frontmatter}\n\n${body}\n`
}

/**
 * Triggers a browser file download of the Obsidian .md document for the given item.
 * displayTitle should be the same computed value used in the UI:
 *   item.title ?? (item.url ? new URL(item.url).hostname : item.content.slice(0, 60))
 */
export function downloadObsidianNote(item: NucleoItem, displayTitle: string): void {
  const content = buildObsidianDocument(item, displayTitle)
  const filename = buildObsidianFilename(item, displayTitle)

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(url)
}
