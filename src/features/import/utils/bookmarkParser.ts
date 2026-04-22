// Client-safe utility — no server imports.
// Parses Netscape Bookmark File Format (exported by Chrome, Safari, Firefox).

export interface ParsedBookmark {
  title: string
  url: string
  folderPath: string  // e.g. "Trabajo/Herramientas" — empty string if at root
  depth: number       // 0–2 (capped to Nucleo's max 3 levels)
}

export interface BookmarkParseResult {
  bookmarks: ParsedBookmark[]
  total: number
  folders: string[]  // unique folder paths found
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_DEPTH = 2 // Nucleo max depth index (0-based → levels 0, 1, 2)

function isValidUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Recursively walk DL/DT tree from a parent `<DL>` element.
 *
 * @param dl        The <DL> element to walk
 * @param pathParts Current folder path segments (mutated via slice — immutable per call)
 * @param bookmarks Accumulator array
 */
function walkDL(
  dl: Element,
  pathParts: string[],
  bookmarks: ParsedBookmark[]
): void {
  // Direct children of <DL> — iterate over all child nodes
  const children = Array.from(dl.children)

  for (const child of children) {
    // <DT> wraps both folders (<H3>) and links (<A>)
    if (child.tagName !== 'DT') continue

    const h3 = child.querySelector(':scope > h3')
    const anchor = child.querySelector(':scope > a')
    const nestedDL = child.querySelector(':scope > dl')

    if (h3) {
      // This DT is a folder
      const folderName = h3.textContent?.trim() ?? ''
      if (!folderName) continue

      const newPathParts = pathParts.length < MAX_DEPTH
        ? [...pathParts, folderName]
        : pathParts.slice(0, MAX_DEPTH) // cap at max depth

      if (nestedDL) {
        walkDL(nestedDL, newPathParts, bookmarks)
      }
    } else if (anchor) {
      // This DT is a bookmark
      const url = anchor.getAttribute('href')?.trim() ?? ''
      if (!isValidUrl(url)) continue

      const title = anchor.textContent?.trim() ?? url

      // Cap depth: if pathParts is longer than MAX_DEPTH, slice it
      const cappedParts = pathParts.slice(0, MAX_DEPTH)
      const depth = Math.min(cappedParts.length, MAX_DEPTH)

      bookmarks.push({
        title,
        url,
        folderPath: cappedParts.join('/'),
        depth,
      })

      // Recurse in case there's a nested DL under an <A> (non-standard but safe to handle)
      if (nestedDL) {
        walkDL(nestedDL, cappedParts, bookmarks)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// parseBookmarksHTML
// ---------------------------------------------------------------------------

export function parseBookmarksHTML(html: string): BookmarkParseResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const bookmarks: ParsedBookmark[] = []

  // The root <DL> is typically the first one in the document
  const rootDL = doc.querySelector('dl')
  if (rootDL) {
    walkDL(rootDL, [], bookmarks)
  }

  // Collect unique folder paths (exclude empty root path)
  const folderSet = new Set<string>()
  for (const bm of bookmarks) {
    if (bm.folderPath) {
      // Also register intermediate paths
      const parts = bm.folderPath.split('/')
      for (let i = 1; i <= parts.length; i++) {
        folderSet.add(parts.slice(0, i).join('/'))
      }
    }
  }

  return {
    bookmarks,
    total: bookmarks.length,
    folders: Array.from(folderSet).sort(),
  }
}
