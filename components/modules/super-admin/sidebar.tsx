'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    ShieldAlert, 
    Settings, 
    LogOut, 
    BarChart3,
    ArrowLeft,
    AlertCircle,
    Store,
    Shield,
    Table2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { canView, type AdminRecord, type GranularPermissions } from '@/lib/admin-permissions'
import { CommandPalette } from '@/components/modules/super-admin/command-palette'

type NavItem = {
    name: string
    href: string
    icon: any
    // If set, the item is only shown if the admin can view this section
    section?: keyof GranularPermissions
}

const PLATFORM_NAV: NavItem[] = [
    { name: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users, section: 'users' },
    { name: 'Boutiques & Shops', href: '/admin/restaurants', icon: Store, section: 'restaurants' },
    { name: 'Tables & QR Codes', href: '/admin/tables', icon: Table2, section: 'tables' },

    { name: 'Modération', href: '/admin/moderation', icon: ShieldAlert, section: 'moderation' },

    { name: 'Paiements & SaaS', href: '/admin/payments', icon: CreditCard, section: 'payments' },
    { name: 'Équipe Admin', href: '/admin/compteAdmin', icon: Shield, section: 'admins' },
]

const REPORTS_NAV: NavItem[] = [
    { name: 'Statistiques Globales', href: '/admin/stats', icon: BarChart3, section: 'analytics' },
    { name: 'Signalements', href: '/admin/moderation', icon: AlertCircle, section: 'moderation' },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings, section: 'settings' },
]

export function SuperAdminSidebar({ 
    className, 
    onItemClick, 
    isSuperAdmin,
    admin
}: { 
    className?: string
    onItemClick?: () => void
    isSuperAdmin?: boolean
    admin?: AdminRecord
}) {
    const pathname = usePathname()

    // Build a lightweight admin object for permission checks if only isSuperAdmin is passed (backward compat)
    const adminRecord: AdminRecord = admin || { 
        id: '', 
        is_super_admin: isSuperAdmin ?? false, 
        permissions: isSuperAdmin ? { all: true } : null 
    }

    const filterNavItem = (item: NavItem) => {
        if (!item.section) return true // Always show items with no section requirement
        return canView(adminRecord, item.section)
    }

    const renderLink = (item: NavItem) => (
        <Link
            key={item.href + item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                pathname === item.href 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
            )}
        >
            <item.icon className={cn("h-4 w-4 shrink-0", pathname === item.href ? "text-orange-500" : "")} />
            {item.name}
        </Link>
    )

    const visiblePlatform = PLATFORM_NAV.filter(filterNavItem)
    const visibleReports = REPORTS_NAV.filter(filterNavItem)

    return (
        <div className={cn("flex h-full flex-col border-r bg-slate-950 text-slate-200 w-64", className)}>
            <div className="flex flex-col border-b border-slate-800 p-4 gap-4">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                        <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">MENLYLA <span className="text-xs text-orange-500 font-mono">ADMIN</span></span>
                </Link>
                <CommandPalette />
            </div>
            
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid items-start px-4 text-sm font-medium gap-2">
                    {visiblePlatform.length > 0 && (
                        <div className="mb-4">
                            <h4 className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Gestion Plateforme</h4>
                            <div className="space-y-1">
                                {visiblePlatform.map(renderLink)}
                            </div>
                        </div>
                    )}

                    {visibleReports.length > 0 && (
                        <div className="mb-4">
                            <h4 className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Analyses & Rapports</h4>
                            <div className="space-y-1">
                                {visibleReports.map(renderLink)}
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-900 mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour Dashboard
                    </Button>
                </Link>
                <form action="/auth/signout" method="post" onSubmit={onItemClick}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400 hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </form>
            </div>
        </div>
    )
}
