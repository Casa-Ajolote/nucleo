export type ContentType = 'link' | 'text' | 'markdown' | 'command'
export type ItemStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface NucleoItem {
  id: string
  title: string | null
  summary: string | null
  content: string
  content_type: ContentType
  status: ItemStatus
  tags: string[]
  category: string | null
  folder_id: string | null
  thumbnail_url: string | null
  url: string | null
  workspace_id: string
  created_at: string
}
