'use client'

import { useState } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/features/search/store/searchStore'
import { useOrganizeStore } from '@/features/organize/store/organizeStore'

// ---------------------------------------------------------------------------
// Static type options
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'link', label: 'Link' },
  { value: 'text', label: 'Texto' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'command', label: 'Comando' },
]

// ---------------------------------------------------------------------------
// CheckboxItem — shared between dropdown and drawer
// ---------------------------------------------------------------------------

interface CheckboxItemProps {
  label: React.ReactNode
  checked: boolean
  onToggle: () => void
}

function CheckboxItem({ label, checked, onToggle }: CheckboxItemProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-sm transition-colors',
        'hover:bg-[var(--color-hover)] outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
      )}
      style={{ color: 'var(--color-ink)' }}
    >
      <span
        className={cn(
          'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors'
        )}
        style={{
          borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
          background: checked ? 'var(--color-accent)' : 'transparent',
        }}
        aria-hidden="true"
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
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
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// FilterDropdown — wraps a set of CheckboxItems in a Radix dropdown
// ---------------------------------------------------------------------------

interface FilterDropdownProps {
  label: string
  activeCount: number
  children: React.ReactNode
}

function FilterDropdown({ label, activeCount, children }: FilterDropdownProps) {
  const isActive = activeCount > 0

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors duration-150',
            'hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
          )}
          style={{
            borderColor: isActive ? 'color-mix(in srgb, var(--color-accent) 40%, transparent)' : 'var(--color-border)',
            color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
          }}
        >
          {label}
          {isActive && (
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold leading-none"
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
              }}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown size={11} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[160px] max-h-64 overflow-y-auto rounded-lg border py-1 z-50 shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          style={{
            background: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
          }}
          sideOffset={4}
          align="start"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ---------------------------------------------------------------------------
// FilterDrawer — mobile Sheet using Radix Dialog
// ---------------------------------------------------------------------------

interface FilterDrawerProps {
  children: React.ReactNode
}

function FilterDrawer({ children }: FilterDrawerProps) {
  const [open, setOpen] = useState(false)
  const { hasActiveFilters } = useSearchStore()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-colors duration-150',
            'hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
          )}
          style={{
            borderColor: hasActiveFilters()
              ? 'color-mix(in srgb, var(--color-accent) 40%, transparent)'
              : 'var(--color-border)',
            color: hasActiveFilters() ? 'var(--color-accent)' : 'var(--color-muted)',
          }}
        >
          <SlidersHorizontal size={12} aria-hidden="true" />
          Filtros
          {hasActiveFilters() && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t p-5',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'max-h-[80vh] overflow-y-auto'
          )}
          style={{
            background: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-sm font-semibold"
              style={{ color: 'var(--color-ink)' }}
            >
              Filtros
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Cerrar filtros"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ---------------------------------------------------------------------------
// FilterSections — shared between dropdown row and mobile drawer
// ---------------------------------------------------------------------------

function FilterSections() {
  const { categories, tags } = useOrganizeStore()
  const {
    activeTypes,
    activeCategoryIds,
    activeTagNames,
    toggleType,
    toggleCategory,
    toggleTag,
  } = useSearchStore()

  return (
    <div className="space-y-5">
      {/* Tipo */}
      <div>
        <p
          className="text-xs font-medium mb-2 px-1"
          style={{ color: 'var(--color-muted)' }}
        >
          Tipo
        </p>
        <div className="space-y-0.5">
          {TYPE_OPTIONS.map((opt) => (
            <CheckboxItem
              key={opt.value}
              label={opt.label}
              checked={activeTypes.includes(opt.value)}
              onToggle={() => toggleType(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Categoría */}
      {categories.length > 0 && (
        <div>
          <p
            className="text-xs font-medium mb-2 px-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Categoría
          </p>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <CheckboxItem
                key={cat.id}
                label={
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cat.color }}
                      aria-hidden="true"
                    />
                    {cat.name}
                    {typeof cat.item_count === 'number' && cat.item_count > 0 && (
                      <span
                        className="ml-auto text-xs tabular-nums"
                        style={{ color: 'var(--color-placeholder)' }}
                      >
                        {cat.item_count}
                      </span>
                    )}
                  </span>
                }
                checked={activeCategoryIds.includes(cat.id)}
                onToggle={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p
            className="text-xs font-medium mb-2 px-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Tags
          </p>
          <div className="space-y-0.5">
            {tags.map((tag) => (
              <CheckboxItem
                key={tag.id}
                label={
                  <span className="flex items-center gap-2 w-full">
                    <span style={{ color: 'var(--color-muted)' }}>#{tag.name}</span>
                    {tag.item_count > 0 && (
                      <span
                        className="ml-auto text-xs tabular-nums"
                        style={{ color: 'var(--color-placeholder)' }}
                      >
                        {tag.item_count}
                      </span>
                    )}
                  </span>
                }
                checked={activeTagNames.includes(tag.name)}
                onToggle={() => toggleTag(tag.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------

interface FilterBarProps {
  total: number
  workspaceName: string
}

export function FilterBar({ total, workspaceName }: FilterBarProps) {
  const { categories, tags } = useOrganizeStore()
  const {
    activeTypes,
    activeCategoryIds,
    activeTagNames,
    toggleType,
    toggleCategory,
    toggleTag,
    clearFilters,
    hasActiveFilters,
  } = useSearchStore()

  // Build active chips list from all 3 filter groups
  const typeChips = activeTypes.map((t) => ({
    key: `type-${t}`,
    label: TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t,
    onRemove: () => toggleType(t),
  }))

  const categoryChips = activeCategoryIds.map((id) => {
    const cat = categories.find((c) => c.id === id)
    return {
      key: `cat-${id}`,
      label: cat?.name ?? id,
      color: cat?.color,
      onRemove: () => toggleCategory(id),
    }
  })

  const tagChips = activeTagNames.map((name) => ({
    key: `tag-${name}`,
    label: `#${name}`,
    onRemove: () => toggleTag(name),
  }))

  const allChips = [...typeChips, ...categoryChips, ...tagChips]

  return (
    <div className="space-y-2 py-3">
      {/* Row 1: workspace name + counter + dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Workspace + count */}
        <span className="text-sm mr-1" style={{ color: 'var(--color-ink)' }}>
          <strong>{workspaceName}</strong>
          <span style={{ color: 'var(--color-muted)' }} className="font-normal">
            {' '}· {total} {total === 1 ? 'item' : 'items'}
          </span>
        </span>

        {/* Mobile: single Filtros button that opens a bottom drawer */}
        <FilterDrawer>
          <FilterSections />
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{
                background: 'var(--color-hover)',
                color: 'var(--color-ink)',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </FilterDrawer>

        {/* Desktop: 3 separate dropdowns */}
        {/* Tipo */}
        <div className="hidden sm:flex items-center gap-2">
          <FilterDropdown label="Tipo" activeCount={activeTypes.length}>
            {TYPE_OPTIONS.map((opt) => (
              <DropdownMenu.CheckboxItem
                key={opt.value}
                checked={activeTypes.includes(opt.value)}
                onCheckedChange={() => toggleType(opt.value)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none rounded-sm mx-1 transition-colors"
                style={{ color: 'var(--color-ink)' }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = 'var(--color-hover)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <span
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: activeTypes.includes(opt.value)
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                    background: activeTypes.includes(opt.value)
                      ? 'var(--color-accent)'
                      : 'transparent',
                  }}
                  aria-hidden="true"
                >
                  {activeTypes.includes(opt.value) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
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
                {opt.label}
              </DropdownMenu.CheckboxItem>
            ))}
          </FilterDropdown>

          {/* Categoría */}
          <FilterDropdown label="Categoría" activeCount={activeCategoryIds.length}>
            {categories.length === 0 ? (
              <p
                className="px-3 py-2 text-xs italic"
                style={{ color: 'var(--color-placeholder)' }}
              >
                Sin categorías
              </p>
            ) : (
              categories.map((cat) => (
                <DropdownMenu.CheckboxItem
                  key={cat.id}
                  checked={activeCategoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none rounded-sm mx-1 transition-colors"
                  style={{ color: 'var(--color-ink)' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'var(--color-hover)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <span
                    className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      borderColor: activeCategoryIds.includes(cat.id)
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      background: activeCategoryIds.includes(cat.id)
                        ? 'var(--color-accent)'
                        : 'transparent',
                    }}
                    aria-hidden="true"
                  >
                    {activeCategoryIds.includes(cat.id) && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
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
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: cat.color }}
                    aria-hidden="true"
                  />
                  {cat.name}
                  {typeof cat.item_count === 'number' && cat.item_count > 0 && (
                    <span
                      className="ml-auto text-xs tabular-nums"
                      style={{ color: 'var(--color-placeholder)' }}
                    >
                      {cat.item_count}
                    </span>
                  )}
                </DropdownMenu.CheckboxItem>
              ))
            )}
          </FilterDropdown>

          {/* Tags */}
          <FilterDropdown label="Tags" activeCount={activeTagNames.length}>
            {tags.length === 0 ? (
              <p
                className="px-3 py-2 text-xs italic"
                style={{ color: 'var(--color-placeholder)' }}
              >
                Sin tags
              </p>
            ) : (
              tags.map((tag) => (
                <DropdownMenu.CheckboxItem
                  key={tag.id}
                  checked={activeTagNames.includes(tag.name)}
                  onCheckedChange={() => toggleTag(tag.name)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer outline-none rounded-sm mx-1 transition-colors"
                  style={{ color: 'var(--color-ink)' }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'var(--color-hover)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <span
                    className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      borderColor: activeTagNames.includes(tag.name)
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      background: activeTagNames.includes(tag.name)
                        ? 'var(--color-accent)'
                        : 'transparent',
                    }}
                    aria-hidden="true"
                  >
                    {activeTagNames.includes(tag.name) && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
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
                  <span style={{ color: 'var(--color-muted)' }}>#{tag.name}</span>
                  {tag.item_count > 0 && (
                    <span
                      className="ml-auto text-xs tabular-nums"
                      style={{ color: 'var(--color-placeholder)' }}
                    >
                      {tag.item_count}
                    </span>
                  )}
                </DropdownMenu.CheckboxItem>
              ))
            )}
          </FilterDropdown>

          {/* Clear filters button */}
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-2 py-0.5 text-xs rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ color: 'var(--color-muted)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-hover)'
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Active filter chips */}
      {allChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Filtros activos">
          {allChips.map((chip) => (
            <span
              key={chip.key}
              role="listitem"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
              style={{
                background: 'var(--color-selected)',
                color: 'var(--color-accent)',
                borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
              }}
            >
              {'color' in chip && typeof chip.color === 'string' && chip.color ? (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: chip.color }}
                  aria-hidden="true"
                />
              ) : null}
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Quitar filtro ${chip.label}`}
                className="transition-opacity hover:opacity-60 focus-visible:outline-none"
              >
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
