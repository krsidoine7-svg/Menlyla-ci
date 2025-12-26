import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
    dishId: string
    name: string
    price: number
    quantity: number
    modifiers?: any[] // Todo: Typed modifiers
}

type CartState = {
    items: CartItem[]
    restaurantId: string | null
    addItem: (item: CartItem, restaurantId: string) => void
    removeItem: (dishId: string) => void
    updateQuantity: (dishId: string, quantity: number) => void
    clearCart: () => void
    total: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            addItem: (item, restaurantId) => {
                const currentResto = get().restaurantId
                if (currentResto && currentResto !== restaurantId) {
                    // Confirm clear cart? For now, auto-clear or throw.
                    // Let's auto-clear for simplicity in MVP
                    set({ items: [item], restaurantId })
                    return
                }

                const items = get().items
                const existing = items.find((i) => i.dishId === item.dishId)
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.dishId === item.dishId
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                        restaurantId
                    })
                } else {
                    set({ items: [...items, item], restaurantId })
                }
            },
            removeItem: (dishId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.dishId !== dishId),
                })),
            updateQuantity: (dishId, quantity) =>
                set((state) => ({
                    items: quantity > 0
                        ? state.items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i))
                        : state.items.filter((i) => i.dishId !== dishId)
                })),
            clearCart: () => set({ items: [], restaurantId: null }),
            total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'manly-cart',
        }
    )
)
