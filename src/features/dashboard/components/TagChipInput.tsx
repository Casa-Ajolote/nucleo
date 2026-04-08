'use client'

import { useRef, KeyboardEvent, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Tag normalization
// ---------------------------------------------------------------------------
function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30)
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TagChipInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TagChipInput({
  value,
  onChange,
  placeholder = 'Escribe un tag y presiona Enter…',
  maxTags,
}: TagChipInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isAtLimit = maxTags !== undefined && value.length >= maxTags

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const addTag = useCallback(
    (raw: string) => {
      const normalized = normalizeTag(raw)
      if (!normalized) return
      if (value.includes(normalized)) return
      if (maxTags !== undefined && value.length >= maxTags) return
      onChange([...value, normalized])
    },
    [value, onChange, maxTags]
  )

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((t) => t !== tag))
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget

      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag(input.value)
        input.value = ''
        return
      }

      if (e.key === 'Backspace' && input.value === '' && value.length > 0) {
        e.preventDefault()
        onChange(value.slice(0, -1))
      }
    },
    [addTag, value, onChange]
  )

  return (
    <div
      role="group"
      aria-label="Gestión de tags"
      onClick={focusInput}
      className={cn(
        'border border-border rounded px-2 py-1.5',
        'flex flex-wrap gap-1 cursor-text',
        'transition-all duration-150',
        'focus-within:border-accent',
        'focus-within:shadow-[0_0_0_2px_rgba(35,131,226,0.15)]'
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-selected text-accent text-xs px-1.5 py-0.5 rounded"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            aria-label={`Eliminar tag ${tag}`}
            className="leading-none text-accent/70 hover:text-accent-hover transition-colors duration-150"
          >
            <X size={10} aria-hidden="true" />
          </button>
        </span>
      ))}

      {!isAtLimit && (
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            const trimmed = e.currentTarget.value.trim()
            if (trimmed) {
              addTag(trimmed)
              e.currentTarget.value = ''
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          aria-label="Agregar tag"
          className={cn(
            'border-none outline-none bg-transparent',
            'text-sm text-ink placeholder:text-placeholder',
            'min-w-[80px] flex-1'
          )}
          style={{ minWidth: '80px' }}
        />
      )}
    </div>
  )
}
