import { create } from 'zustand'
import type { Folder, Category, TagWithCount } from '../types'

type FilterType = 'folder' | 'tag' | 'category'

interface ActiveFilter {
  type: FilterType
  id: string
  name: string
}

interface OrganizeStore {
  // Data
  folders: Folder[]
  categories: Category[]
  tags: TagWithCount[]

  // Filter state
  activeFilter: ActiveFilter | null

  // Folder expand state (set of folder IDs that are expanded)
  expandedFolderIds: Set<string>

  // Actions
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  removeFolder: (id: string) => void
  renameFolder: (id: string, name: string) => void

  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void

  setTags: (tags: TagWithCount[]) => void

  setFilter: (filter: ActiveFilter | null) => void
  clearFilter: () => void

  toggleFolderExpand: (id: string) => void

  resetOrganize: () => void
}

const initialState = {
  folders: [],
  categories: [],
  tags: [],
  activeFilter: null,
  expandedFolderIds: new Set<string>(),
}

export const useOrganizeStore = create<OrganizeStore>((set) => ({
  ...initialState,

  setFolders: (folders) => set({ folders }),

  addFolder: (folder) =>
    set((state) => ({ folders: [...state.folders, folder] })),

  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    })),

  renameFolder: (id, name) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, name } : f
      ),
    })),

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  setTags: (tags) => set({ tags }),

  setFilter: (filter) => set({ activeFilter: filter }),

  clearFilter: () => set({ activeFilter: null }),

  toggleFolderExpand: (id) =>
    set((state) => {
      const next = new Set(state.expandedFolderIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { expandedFolderIds: next }
    }),

  resetOrganize: () =>
    set({
      ...initialState,
      expandedFolderIds: new Set<string>(),
    }),
}))

// Converts a flat folder array into a nested tree structure
export function buildFolderTree(folders: Folder[]): Folder[] {
  const map = new Map<string, Folder>()
  const roots: Folder[] = []

  folders.forEach((f) => map.set(f.id, { ...f, children: [] }))

  folders.forEach((f) => {
    const node = map.get(f.id)!
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}
