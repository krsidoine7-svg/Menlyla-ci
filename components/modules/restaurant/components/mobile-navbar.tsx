'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, ShoppingBag, Heart, Receipt, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui-store'

type Props = {
    restaurantSlug: string
}

export function MobileNavbar({ restaurantSlug }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const { activeTab, setActiveTab } = useUIStore()
    const { activeOrderIds, items: cartItems } = useCartStore()

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash
            if (hash === '#favorites') setActiveTab('favorites')
            else if (hash === '#orders') setActiveTab('orders')
            else if (hash === '#profile') setActiveTab('profile')
            else if (hash === '#search') setActiveTab('search')
            else if (pathname === `/${restaurantSlug}` && !hash) setActiveTab(null)
        }
        window.addEventListener('hashchange', handleHashChange)
        window.addEventListener('popstate', handleHashChange)
        handleHashChange()

        return () => {
            window.removeEventListener('hashchange', handleHashChange)
            window.removeEventListener('popstate', handleHashChange)
        }
    }, [pathname, restaurantSlug, setActiveTab])

    const navItems = [
        { name: 'Home', icon: Home, href: `/${restaurantSlug}`, hash: '' },
        { name: 'Recherche', icon: Search, href: `/${restaurantSlug}#search`, hash: '#search' },
        { name: 'Favoris', icon: Heart, href: `/${restaurantSlug}#favorites`, hash: '#favorites' },
        { name: 'Panier', icon: ShoppingBag, href: `/${restaurantSlug}/cart`, hash: null },
        { name: 'Suivi', icon: Receipt, href: `/${restaurantSlug}#orders`, hash: '#orders', badge: activeOrderIds.length },
        { name: 'Moi', icon: User, href: `/${restaurantSlug}#profile`, hash: '#profile' },
    ]

    const isCartActive = pathname.endsWith('/cart')

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[50] px-3 pb-6 pointer-events-none md:max-w-[500px] md:mx-auto">
            <div className="relative flex items-center justify-between h-18 bg-white/70 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] px-1.5 pointer-events-auto">

                {navItems.map((item) => {
                    const isMainPath = pathname === `/${restaurantSlug}`
                    let isActive = false

                    if (item.name === 'Panier') {
                        isActive = isCartActive
                    } else if (item.hash === '') {
                        isActive = isMainPath && (activeTab === null) && !isCartActive
                    } else {
                        const tabKey = item.hash?.replace('#', '')
                        isActive = isMainPath && activeTab === tabKey
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.name === 'Home' ? `/${restaurantSlug}` : item.href}
                            onClick={(e) => {
                                if (item.hash !== null) {
                                    const tabKey = item.hash === '' ? null : item.hash.replace('#', '')
                                    setActiveTab(tabKey)
                                }
                                if (item.name === 'Home') {
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }
                            }}
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-2"
                        >
                            {/* The "Color Around" requested by user */}
                            {isActive && (
                                <div className="absolute inset-x-1 inset-y-2 bg-orange-100/80 rounded-2xl -z-0 animate-in fade-in zoom-in duration-300" />
                            )}

                            <div className={cn(
                                "relative z-10 flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                isActive
                                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105"
                                    : "text-slate-500 hover:text-orange-600"
                            )}>
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform duration-500",
                                    isActive ? "scale-110" : "scale-100"
                                )} />

                                {(item.badge || (item.name === 'Panier' && cartItems.length > 0)) ? (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white">
                                        {item.name === 'Panier' ? cartItems.reduce((acc, curr) => acc + curr.quantity, 0) : item.badge}
                                    </span>
                                ) : null}
                            </div>

                            <span className={cn(
                                "relative z-10 text-[8px] font-black uppercase tracking-tighter mt-1 transition-all duration-300",
                                isActive ? "opacity-100 text-orange-950" : "opacity-0"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
