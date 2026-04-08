'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CopyButton({ text, label, size = 'md', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API not available — silently fail
    }
  }

  const iconSize = size === 'sm' ? 13 : 15

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copiado' : 'Copiar al portapapeles'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors',
        'text-muted hover:text-ink hover:bg-hover',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {copied ? (
        <Check
          size={iconSize}
          style={{ color: 'var(--color-success)' }}
          aria-hidden="true"
        />
      ) : (
        <Copy size={iconSize} aria-hidden="true" />
      )}
      {label !== undefined && (
        <span style={copied ? { color: 'var(--color-success)' } : undefined}>
          {copied ? 'Copiado' : label}
        </span>
      )}
    </button>
  )
}
