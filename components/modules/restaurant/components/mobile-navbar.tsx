'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    restaurantSlug: string
}

export function MobileNavbar({ restaurantSlug }: Props) {
    const pathname = usePathname()
    const [activeHash, setActiveHash] = useState('')

    // Listen to hash changes to update the highlight in real-time
    useEffect(() => {
        const handleHashChange = () => setActiveHash(window.location.hash)
        window.addEventListener('hashchange', handleHashChange)
        handleHashChange() // Initial manual check
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    const navItems = [
        { name: 'Menu', icon: Home, href: `/${restaurantSlug}`, hash: '' },
        { name: 'Trouver', icon: Search, href: `/${restaurantSlug}#search`, hash: '#search' },
        { name: 'Favoris', icon: Heart, href: `/${restaurantSlug}#favorites`, hash: '#favorites' },
        { name: 'Panier', icon: ShoppingBag, href: `/${restaurantSlug}/cart`, hash: null },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[50] md:hidden px-6 pb-6 pointer-events-none">
            {/* The container itself must be pointer-events-auto */}
            <div className="relative flex items-center justify-around h-16 bg-white/95 backdrop-blur-3xl border border-orange-50 rounded-full shadow-[0_20px_50px_rgba(234,88,12,0.15)] px-2 pointer-events-auto">

                {navItems.map((item) => {
                    const isMainPath = pathname === `/${restaurantSlug}`
                    const isCart = pathname.endsWith('/cart')

                    // Logic to determine if this specific button should be 'Vibrant Orange'
                    const isActive = item.hash !== null
                        ? (isMainPath && activeHash === item.hash)
                        : (isCart && item.name === 'Panier')

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center flex-1 h-full group"
                        >
                            <div className={cn(
                                "flex items-center justify-center h-12 w-12 rounded-full transition-all duration-500 ease-out",
                                isActive
                                    ? "bg-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.4)] scale-110 -translate-y-1"
                                    : "text-orange-200 hover:text-orange-400" // Orange très pâle pour l'effet psychologique
                            )}>
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-500",
                                    isActive ? "scale-110" : "scale-100"
                                )} />

                                {/* Inner Glow for the active icon */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                                )}
                            </div>

                            {/* Small indicator dot below the active icon */}
                            {isActive && (
                                <div className="absolute -bottom-1 h-1 w-1 bg-orange-600 rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
