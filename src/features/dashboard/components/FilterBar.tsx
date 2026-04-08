'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterKey = 'type' | 'category' | 'tags'

interface ActiveFilter {
  key: FilterKey
  value: string
  label: string
}

// ---------------------------------------------------------------------------
// Static filter options (placeholder data)
// ---------------------------------------------------------------------------
const FILTER_OPTIONS: Record<FilterKey, string[]> = {
  type: ['Link', 'Texto', 'Markdown', 'Comando'],
  category: ['Development', 'AI', 'Design', 'Business'],
  tags: ['react', 'nextjs', 'prompts', 'claude-code', 'supabase', 'git'],
}

const FILTER_LABELS: Record<FilterKey, string> = {
  type: 'Tipo',
  category: 'Categoría',
  tags: 'Tags',
}

// ---------------------------------------------------------------------------
// Single filter dropdown
// ---------------------------------------------------------------------------
function FilterDropdown({
  filterKey,
  activeValues,
  onSelect,
}: {
  filterKey: FilterKey
  activeValues: Set<string>
  onSelect: (key: FilterKey, value: string) => void
}) {
  const options = FILTER_OPTIONS[filterKey]
  const label = FILTER_LABELS[filterKey]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded border border-border text-xs text-muted',
            'hover:bg-hover hover:text-ink transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            activeValues.size > 0 && 'border-accent/40 text-accent'
          )}
        >
          {label}
          <ChevronDown size={11} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[140px] rounded-lg border border-border bg-canvas shadow-md',
            'py-1 z-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          sideOffset={4}
          align="start"
        >
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option}
              checked={activeValues.has(option)}
              onCheckedChange={() => onSelect(filterKey, option)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink cursor-pointer outline-none hover:bg-hover rounded-sm mx-1"
            >
              <span
                className={cn(
                  'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                  activeValues.has(option)
                    ? 'border-accent bg-accent'
                    : 'border-border'
                )}
              >
                {activeValues.has(option) && (
                  <svg
                    width="8"
                    height="6"
                    viewBox="0 0 8 6"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              {option}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ---------------------------------------------------------------------------
// FilterBar component
// ---------------------------------------------------------------------------
interface FilterBarProps {
  total: number
  workspaceName: string
}

export function FilterBar({ total, workspaceName }: FilterBarProps) {
  // activeFilters tracks selected values per key
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  function handleSelect(key: FilterKey, value: string) {
    setActiveFilters((prev) => {
      const exists = prev.find((f) => f.key === key && f.value === value)
      if (exists) {
        return prev.filter((f) => !(f.key === key && f.value === value))
      }
      return [...prev, { key, value, label: value }]
    })
  }

  function removeFilter(key: FilterKey, value: string) {
    setActiveFilters((prev) =>
      prev.filter((f) => !(f.key === key && f.value === value))
    )
  }

  function clearAll() {
    setActiveFilters([])
  }

  function activeValuesForKey(key: FilterKey): Set<string> {
    return new Set(
      activeFilters.filter((f) => f.key === key).map((f) => f.value)
    )
  }

  const hasFilters = activeFilters.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {/* Workspace + count */}
      <span className="text-sm text-ink mr-1">
        <strong>{workspaceName}</strong>
        <span className="text-muted font-normal"> · {total} items</span>
      </span>

      {/* Filter dropdowns */}
      {(['type', 'category', 'tags'] as FilterKey[]).map((key) => (
        <FilterDropdown
          key={key}
          filterKey={key}
          activeValues={activeValuesForKey(key)}
          onSelect={handleSelect}
        />
      ))}

      {/* Active filter chips */}
      {activeFilters.map((filter) => (
        <span
          key={`${filter.key}-${filter.value}`}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-selected text-accent border border-accent/20"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key, filter.value)}
            aria-label={`Quitar filtro ${filter.label}`}
            className="hover:text-ink transition-colors duration-100"
          >
            <X size={11} aria-hidden="true" />
          </button>
        </span>
      ))}

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="px-2 py-0.5 text-xs text-muted hover:text-ink hover:bg-hover rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
