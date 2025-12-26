'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
    dishIds: string[]
    toggleFavorite: (dishId: string) => void
    isFavorite: (dishId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            dishIds: [],
            toggleFavorite: (dishId) => {
                const current = get().dishIds
                const exists = current.includes(dishId)
                if (exists) {
                    set({ dishIds: current.filter(id => id !== dishId) })
                } else {
                    set({ dishIds: [...current, dishId] })
                }
            },
            isFavorite: (dishId) => get().dishIds.includes(dishId),
        }),
        {
            name: 'manly-favorites',
        }
    )
)
