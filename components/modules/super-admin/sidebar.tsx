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
                "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                pathname === item.href 
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] ring-1 ring-red-400/30" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
            )}
        >
            <item.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", pathname === item.href ? "text-white" : "group-hover:text-red-500")} />
            <span className="font-medium tracking-tight">{item.name}</span>
        </Link>
    )

    const visiblePlatform = PLATFORM_NAV.filter(filterNavItem)
    const visibleReports = REPORTS_NAV.filter(filterNavItem)

    return (
        <div className={cn("flex h-full flex-col bg-black text-white w-72", className)}>
            <div className="flex flex-col p-6 gap-6">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-all duration-500">
                        <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-semibold tracking-tight leading-none text-white">Menlyla<span className="text-red-500">.</span></span>
                        <span className="text-[10px] text-white/40 font-medium tracking-wider mt-1">Plateforme Admin</span>
                    </div>
                </Link>
                <CommandPalette />
            </div>
            
            <div className="flex-1 overflow-auto py-2 scrollbar-none">
                <nav className="grid items-start px-4 text-sm gap-6">
                    {visiblePlatform.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="px-4 text-[10px] font-medium text-white/20 tracking-wider flex items-center gap-2">
                                <div className="h-px w-4 bg-white/10" />
                                Gestion
                            </h4>
                            <div className="space-y-1">
                                {visiblePlatform.map(renderLink)}
                            </div>
                        </div>
                    )}

                    {visibleReports.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="px-4 text-[10px] font-medium text-white/20 tracking-wider flex items-center gap-2">
                                <div className="h-px w-4 bg-white/10" />
                                Analytiques
                            </h4>
                            <div className="space-y-1">
                                {visibleReports.map(renderLink)}
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            <div className="p-4 bg-gradient-to-t from-black to-transparent space-y-2">
                <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-white/40 hover:text-white hover:bg-white/5 h-11 rounded-xl group transition-all">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium tracking-tight">Retour Site</span>
                    </Button>
                </Link>
                <form action="/auth/signout" method="post" onSubmit={onItemClick}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-white/40 hover:text-red-500 hover:bg-red-500/10 h-11 rounded-xl group transition-all">
                        <LogOut className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        <span className="font-medium tracking-tight">Déconnexion</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}
