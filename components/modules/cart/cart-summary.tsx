'use client'

import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export function CartSummary() {
    const items = useCartStore((state) => state.items)
    const getTotalPrice = useCartStore((state) => state.getTotalPrice)
    const [mounted, setMounted] = useState(false)
    const params = useParams()
    const slug = params.slug as string // Public route always has slug

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || items.length === 0) return null

    const count = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <div className="fixed bottom-4 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 md:max-w-[500px] md:mx-auto px-4">
            <Link href={`/${slug}/cart`}>
                <Button className="w-full h-14 text-lg shadow-xl shadow-primary/20 flex items-center justify-between px-6 rounded-full">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-foreground/20 px-2 py-0.5 rounded text-sm font-bold">
                            {count}
                        </div>
                        <span>Voir le panier</span>
                    </div>
                    <span className="font-bold">{getTotalPrice().toLocaleString()} FCFA</span>
                </Button>
            </Link>
        </div>
    )
}
