import { create } from 'zustand'

type UIState = {
    activeTab: string | null
    setActiveTab: (tab: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
    activeTab: null,
    setActiveTab: (tab) => set({ activeTab: tab }),
}))
