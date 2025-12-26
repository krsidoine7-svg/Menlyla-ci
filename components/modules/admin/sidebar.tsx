'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, QrCode, Settings, LogOut, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu & Carte', href: '/dashboard/menu', icon: UtensilsCrossed },
    { name: 'QR Codes & Tables', href: '/dashboard/tables', icon: QrCode },
    { name: 'Commandes', href: '/dashboard/orders', icon: Receipt },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col border-r bg-card w-64">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-bold text-primary">MANLY</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Pro</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <form action="/auth/signout" method="post">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </form>
            </div>
        </div>
    )
}
