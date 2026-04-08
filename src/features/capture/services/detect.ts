export type ContentType = 'link' | 'text' | 'markdown' | 'command'

export function detectContentType(content: string): ContentType {
  const trimmed = content.trim()

  // 1. URL
  if (/^https?:\/\/\S+/.test(trimmed)) return 'link'

  // 2. Markdown patterns
  if (/^#{1,6}\s|```|\*\*|^-\s|^\d+\.\s|^\[.+\]\(.+\)/m.test(trimmed)) return 'markdown'

  // 3. Command patterns
  if (
    /^(\$\s|\/|git |npm |npx |sudo |curl |cd |ls |cat |echo |docker |brew |pip )/.test(trimmed)
  )
    return 'command'

  return 'text'
}
