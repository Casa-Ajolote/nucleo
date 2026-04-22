export interface Folder {
  id: string
  workspace_id: string
  parent_id: string | null
  name: string
  slug: string
  depth: number
  position: number
  children?: Folder[]
}

export interface Category {
  id: string
  workspace_id: string
  name: string
  slug: string
  color: string
  item_count?: number
}

export interface TagWithCount {
  id: string
  workspace_id: string
  name: string
  slug: string
  item_count: number
}
