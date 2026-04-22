import { create } from 'zustand'
import type { NucleoItem } from '@/features/dashboard/types'

interface SearchStore {
  // Search state
  query: string
  results: NucleoItem[]
  isSearching: boolean

  // FilterBar state (lifted here so WorkspaceDashboard can combine them)
  activeTypes: string[]       // 'link' | 'text' | 'markdown' | 'command'
  activeCategoryIds: string[] // category IDs
  activeTagNames: string[]    // tag names

  // Search actions
  setQuery: (q: string) => void
  setResults: (results: NucleoItem[]) => void
  setIsSearching: (b: boolean) => void
  clearSearch: () => void

  // Filter actions
  toggleType: (type: string) => void
  toggleCategory: (id: string) => void
  toggleTag: (name: string) => void
  clearFilters: () => void

  // Clear everything
  clearAll: () => void

  // Derived (computed as getter, not stored)
  hasActiveFilters: () => boolean
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial state
  query: '',
  results: [],
  isSearching: false,
  activeTypes: [],
  activeCategoryIds: [],
  activeTagNames: [],

  // Search actions
  setQuery: (q) => set({ query: q }),

  setResults: (results) => set({ results }),

  setIsSearching: (b) => set({ isSearching: b }),

  clearSearch: () => set({ query: '', results: [], isSearching: false }),

  // Filter actions
  toggleType: (type) =>
    set((state) => ({
      activeTypes: state.activeTypes.includes(type)
        ? state.activeTypes.filter((t) => t !== type)
        : [...state.activeTypes, type],
    })),

  toggleCategory: (id) =>
    set((state) => ({
      activeCategoryIds: state.activeCategoryIds.includes(id)
        ? state.activeCategoryIds.filter((c) => c !== id)
        : [...state.activeCategoryIds, id],
    })),

  toggleTag: (name) =>
    set((state) => ({
      activeTagNames: state.activeTagNames.includes(name)
        ? state.activeTagNames.filter((t) => t !== name)
        : [...state.activeTagNames, name],
    })),

  clearFilters: () =>
    set({ activeTypes: [], activeCategoryIds: [], activeTagNames: [] }),

  // Clear everything
  clearAll: () =>
    set({
      query: '',
      results: [],
      isSearching: false,
      activeTypes: [],
      activeCategoryIds: [],
      activeTagNames: [],
    }),

  // Derived getter
  hasActiveFilters: () => {
    const { activeTypes, activeCategoryIds, activeTagNames } = get()
    return (
      activeTypes.length > 0 ||
      activeCategoryIds.length > 0 ||
      activeTagNames.length > 0
    )
  },
}))
