'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, QrCode, Settings, LogOut, Receipt, BarChart3, MessageSquare, ChevronDown, ChevronRight, User, Palette, Share2, Stamp, CalendarDays, BellRing, Database, Scale, LayoutGrid, Clock3, CreditCard, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'QR Codes & Tables', href: '/dashboard/tables', icon: QrCode },
    { name: 'Commandes', href: '/dashboard/orders', icon: Receipt },
    { name: 'Statistiques', href: '/dashboard/analytics', icon: BarChart3 },
    {
        name: 'Paramètres',
        href: '/dashboard/settings',
        icon: Settings,
        isCollapsible: true,
        subsections: [
            {
                label: 'Établissement',
                items: [
                    { name: 'Profil & Carte de Visite', slug: 'profile', icon: User },
                    { name: 'Apparence & Marque', slug: 'design', icon: Palette },
                ]
            },
            {
                label: 'Expérience Client',
                items: [
                    { name: 'Horaires', slug: 'hours', icon: Clock3 },
                    { name: 'Avis & Retours', slug: 'reviews', icon: MessageSquare },
                    { name: 'Événements & Offres', slug: 'events', icon: CalendarDays },
                ]
            },
            {
                label: 'Ma Facturation',
                items: [
                    { name: 'Mon Abonnement', slug: 'subscription', icon: ShieldCheck },
                    { name: 'Méthodes de Paiement', slug: 'payments', icon: CreditCard },
                ]
            }

        ]
    },
    { name: 'Voir ma carte', href: '/', icon: UtensilsCrossed, external: true },
]

export function DashboardSidebar({ className, onItemClick, restaurantSlug, plan = 'solo' }: { className?: string, onItemClick?: () => void, restaurantSlug?: string | null, plan?: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentSection = searchParams.get('section')

    // Auto-open settings if we are on the settings page
    const [isSettingsOpen, setIsSettingsOpen] = useState(pathname?.startsWith('/dashboard/settings'))

    useEffect(() => {
        if (pathname?.startsWith('/dashboard/settings')) {
            setIsSettingsOpen(true)
        }
    }, [pathname])

    const handleSettingsClick = (e: React.MouseEvent) => {
        // If clicking the main link, toggle
        e.preventDefault()
        setIsSettingsOpen(!isSettingsOpen)
    }

    return (
        <div className={cn("flex h-full flex-col border-r bg-card w-64", className)}>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <img src="/logos/logo-icon.svg" alt="Logo" className="w-8 h-8" />
                    <img src="/logos/logo-text.svg" alt="MENLYLA" className="h-4 mt-1" />
                    <span className={cn(
                        "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ml-1",
                        plan === 'pro' ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                    )}>
                        {plan}
                    </span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                    {navItems.map((item) => {
                        const isSettings = item.name === 'Paramètres'

                        if (isSettings) {
                            const isActive = pathname?.startsWith(item.href)
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all hover:bg-muted hover:text-primary",
                                            isActive && !isSettingsOpen ? "bg-muted text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </div>
                                        {isSettingsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>

                                    {isSettingsOpen && (
                                        <div className="pl-4 space-y-4 py-2 animate-in slide-in-from-left-2 duration-200">
                                            {item.subsections?.map((sub, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground/70 px-2 tracking-widest mb-1">{sub.label}</h4>
                                                    {sub.items.map(subItem => {
                                                        const subHref = `${item.href}?section=${subItem.slug}`
                                                        // Check if active: either generic settings page (for first item) or specific section
                                                        const isSubActive = isActive && (currentSection === subItem.slug || (!currentSection && subItem.slug === 'profile'))

                                                        return (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subHref}
                                                                onClick={onItemClick}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                                                    isSubActive
                                                                        ? "bg-orange-50 text-orange-700 font-medium border border-orange-100/50"
                                                                        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                                                )}
                                                            >
                                                                <subItem.icon className="h-3.5 w-3.5 opacity-70" />
                                                                {subItem.name}
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        const href = item.external && restaurantSlug ? `/${restaurantSlug}` : item.href

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                target={item.external ? "_blank" : undefined}
                                onClick={onItemClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground",
                                    item.external && "text-orange-600 font-bold hover:bg-orange-50 mt-4 border border-orange-100"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <form action="/auth/signout" method="post" onSubmit={onItemClick}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </form>
            </div>
        </div>
    )
}
