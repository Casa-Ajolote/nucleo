import { create } from 'zustand'
import type { NucleoItem } from '../types'

interface ItemsStore {
  items: NucleoItem[]
  isLoading: boolean
  activeWorkspaceId: string | null
  setActiveWorkspace: (id: string) => void
  setItems: (items: NucleoItem[]) => void
  addItem: (item: NucleoItem) => void
  updateItem: (id: string, data: Partial<NucleoItem>) => void
  removeItem: (id: string) => void
}

export const useItemsStore = create<ItemsStore>((set) => ({
  items: [],
  isLoading: false,
  activeWorkspaceId: null,

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items] })),

  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}))
