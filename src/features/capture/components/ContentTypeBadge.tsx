import { Link2, FileText, FileCode, Terminal } from 'lucide-react'
import type { ContentType } from '@/features/capture/services/detect'

interface ContentTypeBadgeProps {
  type: ContentType
}

const BADGE_CONFIG: Record<
  ContentType,
  {
    Icon: React.ElementType
    label: string
    color: string
    background: string
  }
> = {
  link: {
    Icon: Link2,
    label: 'Link',
    color: '#2383E2',
    background: 'rgba(35,131,226,0.1)',
  },
  text: {
    Icon: FileText,
    label: 'Texto',
    color: 'var(--color-muted)',
    background: 'var(--color-hover)',
  },
  markdown: {
    Icon: FileCode,
    label: 'Markdown',
    color: '#0F7B6C',
    background: 'rgba(15,123,108,0.1)',
  },
  command: {
    Icon: Terminal,
    label: 'Comando',
    color: 'var(--color-ink)',
    background: 'var(--color-hover)',
  },
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  const { Icon, label, color, background } = BADGE_CONFIG[type]

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ color, background }}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  )
}
