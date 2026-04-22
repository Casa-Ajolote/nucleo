'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/features/search/store/searchStore'
import { useItemsStore } from '@/features/dashboard/store/itemsStore'
import { searchItems } from '@/features/search/services/searchActions'

// ---------------------------------------------------------------------------
// highlightMatch — exported helper
// ---------------------------------------------------------------------------

export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Use capturing group so split() preserves the matched segments
  const splitRegex = new RegExp(`(${escaped})`, 'gi')
  // Separate test regex to avoid lastIndex issues
  const testRegex = new RegExp(`^${escaped}$`, 'i')
  const parts = text.split(splitRegex)

  if (parts.length === 1) return text

  return (
    <>
      {parts.map((part, i) =>
        testRegex.test(part) ? (
          <strong key={i} style={{ color: 'var(--color-accent)' }}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// SearchBar component
// ---------------------------------------------------------------------------

interface Props {
  className?: string
}

export function SearchBar({ className }: Props) {
  const { query, isSearching, setQuery, setResults, setIsSearching, clearSearch } =
    useSearchStore()
  const { activeWorkspaceId } = useItemsStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [focused, setFocused] = useState(false)
  // Mobile: collapsed by default, expands on icon click
  const [expanded, setExpanded] = useState(false)

  // Debounced search — fires 300ms after query stops changing
  const runSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (!value.trim()) {
        clearSearch()
        return
      }

      debounceRef.current = setTimeout(async () => {
        if (!activeWorkspaceId) return
        setIsSearching(true)
        try {
          const results = await searchItems(activeWorkspaceId, value)
          setResults(results)
        } catch {
          setResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [activeWorkspaceId, clearSearch, setIsSearching, setResults]
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    runSearch(value)
  }

  function handleClear() {
    clearSearch()
    inputRef.current?.focus()
  }

  // Cmd+K / Ctrl+K shortcut (desktop)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setExpanded(true)
        // Wait one tick so the input is rendered/visible before focusing
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape' && focused) {
        inputRef.current?.blur()
        setFocused(false)
        setExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focused])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const hasQuery = query.length > 0
  const showHint = !hasQuery && !focused

  // ---------------------------------------------------------------------------
  // Mobile — collapsed icon button
  // ---------------------------------------------------------------------------
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={cn(
          'flex items-center justify-center p-1 rounded transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          className
        )}
        style={{ color: 'var(--color-muted)' }}
        aria-label="Buscar"
      >
        <Search size={18} aria-hidden="true" />
      </button>
    )
  }

  // ---------------------------------------------------------------------------
  // Expanded input (mobile full-width when expanded, desktop always shown)
  // ---------------------------------------------------------------------------
  return (
    <div
      className={cn(
        'relative flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200',
        focused
          ? 'shadow-[0_0_0_2px_var(--color-accent)]'
          : 'hover:border-[var(--color-muted)]',
        className
      )}
      style={{
        borderColor: focused ? 'var(--color-accent)' : 'var(--color-border)',
        background: 'var(--color-sidebar)',
      }}
    >
      {/* Left icon: spinner when searching, lupa otherwise */}
      {isSearching ? (
        <Loader2
          size={14}
          className="shrink-0 animate-spin"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden="true"
        />
      ) : (
        <Search
          size={14}
          className="shrink-0"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden="true"
        />
      )}

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          // Collapse on mobile if no query
          if (!hasQuery) setExpanded(false)
        }}
        placeholder="Buscar…"
        aria-label="Buscar items"
        aria-busy={isSearching}
        className={cn(
          'flex-1 min-w-0 bg-transparent text-sm outline-none',
          '[&::-webkit-search-cancel-button]:hidden'
        )}
        style={{ color: 'var(--color-ink)' }}
      />

      {/* ⌘K hint — only when empty and unfocused (desktop) */}
      {showHint && (
        <span
          className="hidden lg:inline shrink-0 text-[11px] px-1 rounded"
          style={{
            color: 'var(--color-placeholder)',
            background: 'var(--color-hover)',
          }}
          aria-hidden="true"
        >
          ⌘K
        </span>
      )}

      {/* Clear button — visible when there is a query */}
      {hasQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="shrink-0 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ color: 'var(--color-muted)' }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchBarDesktop — always-visible input for desktop header (no collapse)
// ---------------------------------------------------------------------------

export function SearchBarDesktop({ className }: Props) {
  const { query, isSearching, setQuery, setResults, setIsSearching, clearSearch } =
    useSearchStore()
  const { activeWorkspaceId } = useItemsStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [focused, setFocused] = useState(false)

  const runSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (!value.trim()) {
        clearSearch()
        return
      }

      debounceRef.current = setTimeout(async () => {
        if (!activeWorkspaceId) return
        setIsSearching(true)
        try {
          const results = await searchItems(activeWorkspaceId, value)
          setResults(results)
        } catch {
          setResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [activeWorkspaceId, clearSearch, setIsSearching, setResults]
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    runSearch(value)
  }

  function handleClear() {
    clearSearch()
    inputRef.current?.focus()
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && focused) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focused])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const hasQuery = query.length > 0
  const showHint = !hasQuery && !focused

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 flex-1 max-w-sm rounded-lg border px-3 py-1.5 transition-all duration-200',
        className
      )}
      style={{
        borderColor: focused ? 'var(--color-accent)' : 'var(--color-border)',
        background: 'var(--color-sidebar)',
        boxShadow: focused ? '0 0 0 2px var(--color-accent)' : undefined,
      }}
    >
      {isSearching ? (
        <Loader2
          size={14}
          className="shrink-0 animate-spin"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden="true"
        />
      ) : (
        <Search
          size={14}
          className="shrink-0"
          style={{ color: 'var(--color-muted)' }}
          aria-hidden="true"
        />
      )}

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Buscar…"
        aria-label="Buscar items"
        aria-busy={isSearching}
        className="flex-1 min-w-0 bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
        style={{ color: 'var(--color-ink)' }}
      />

      {showHint && (
        <span
          className="shrink-0 text-[11px] px-1 rounded"
          style={{
            color: 'var(--color-placeholder)',
            background: 'var(--color-hover)',
          }}
          aria-hidden="true"
        >
          ⌘K
        </span>
      )}

      {hasQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="shrink-0 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ color: 'var(--color-muted)' }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
