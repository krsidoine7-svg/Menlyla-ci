'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useFavoritesStore } from '@/lib/store/favorites'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = {
    dishId: string
}

export function FavoriteButton({ dishId }: Props) {
    const [mounted, setMounted] = useState(false)
    const { toggleFavorite, isFavorite } = useFavoritesStore()

    useEffect(() => {
        setMounted(true)
    }, [])

    const active = mounted ? isFavorite(dishId) : false

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(dishId)
        if (!active) {
            toast.success("Ajouté à vos favoris !")
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "flex items-center justify-center h-9 w-9 rounded-full transition-all active:scale-90",
                active
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-orange-50 hover:text-orange-500"
            )}
        >
            <Bookmark
                className={cn(
                    "h-4 w-4 transition-all",
                    active && "fill-current"
                )}
            />
        </button>
    )
}
