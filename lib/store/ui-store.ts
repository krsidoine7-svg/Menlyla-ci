import { create } from 'zustand'

type UIState = {
    activeTab: string | null
    setActiveTab: (tab: string | null) => void
    searchQuery: string
    setSearchQuery: (q: string) => void
}

export const useUIStore = create<UIState>((set) => ({
    activeTab: null,
    setActiveTab: (tab) => set({ activeTab: tab }),
    searchQuery: '',
    setSearchQuery: (q) => set({ searchQuery: q }),
}))
