'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { likeDish } from '../actions'
import { cn } from '@/lib/utils'

type Props = {
    dishId: string
    initialLikes: number
}

export function LikeButton({ dishId, initialLikes }: Props) {
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLiked) return // Prevent multiple likes in one session easily

        setIsLiked(true)
        setLikes(prev => prev + 1)
        setIsAnimating(true)

        setTimeout(() => setIsAnimating(false), 600)

        const result = await likeDish(dishId)
        if (!result.success) {
            // Rollback on error
            setLikes(prev => prev - 1)
            setIsLiked(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-90",
                isLiked
                    ? "bg-red-50 text-red-500"
                    : "bg-muted/50 text-muted-foreground hover:bg-red-50 hover:text-red-400"
            )}
        >
            <Heart
                className={cn(
                    "h-4 w-4 transition-all",
                    isLiked && "fill-current",
                    isAnimating && "animate-ping"
                )}
            />
            <span className="text-xs font-bold tabular-nums">{likes}</span>
        </button>
    )
}
