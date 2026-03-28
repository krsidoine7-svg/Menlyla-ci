'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { updateAdminPermissions } from '@/app/(super-admin)/admin/actions'
import { 
    ShieldCheck, Shield, Users, Store, CreditCard, ShieldAlert,
    Settings, BarChart3, Loader2, Save, Eye, Edit, Trash2, VenetianMask, Table2
} from 'lucide-react'


type Admin = {
    id: string
    email?: string | null
    is_super_admin: boolean
    permissions?: Record<string, any> | null
}

const PERMISSION_MODULES = [
    {
        id: 'users',
        label: 'Utilisateurs',
        icon: Users,
        color: 'text-blue-500 bg-blue-50 border-blue-200',
        actions: [
            { key: 'view', label: 'Voir / Rechercher', icon: Eye },
            { key: 'edit', label: 'Modifier', icon: Edit },
            { key: 'delete', label: 'Supprimer', icon: Trash2 },
            { key: 'impersonate', label: 'Connexion en tant que...', icon: VenetianMask },
        ]
    },
    {
        id: 'restaurants',
        label: 'Boutiques & Restaurants',
        icon: Store,
        color: 'text-orange-500 bg-orange-50 border-orange-200',
        actions: [
            { key: 'view', label: 'Voir les boutiques', icon: Eye },
            { key: 'edit', label: 'Approuver / Rejeter', icon: Edit },
            { key: 'delete', label: 'Supprimer / Suspendre', icon: Trash2 },
        ]
    },
    {
        id: 'moderation',
        label: 'Modération & Qualité',
        icon: ShieldAlert,
        color: 'text-rose-500 bg-rose-50 border-rose-200',
        actions: [
            { key: 'view', label: 'Voir les signalements', icon: Eye },
            { key: 'resolve', label: 'Traiter les signalements', icon: Edit },
        ]
    },
    {
        id: 'payments',
        label: 'Finances & Paiements',
        icon: CreditCard,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
        actions: [
            { key: 'view', label: 'Voir les transactions', icon: Eye },
            { key: 'refund', label: 'Gérer les remboursements', icon: Edit },
        ]
    },
    {
        id: 'admins',
        label: 'Équipe Administrative',
        icon: Shield,
        color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
        actions: [
            { key: 'view', label: "Voir l'équipe", icon: Eye },
            { key: 'create', label: 'Inviter un admin', icon: ShieldCheck },
            { key: 'edit', label: 'Gérer les droits', icon: Edit },
            { key: 'delete', label: 'Retirer un accès', icon: Trash2 },
        ]
    },
    {
        id: 'settings',
        label: 'Paramètres Globaux',
        icon: Settings,
        color: 'text-slate-600 bg-slate-100 border-slate-300',
        actions: [
            { key: 'view', label: 'Voir les paramètres', icon: Eye },
            { key: 'edit', label: 'Modifier les tarifs & APIs', icon: Edit },
        ]
    },
    {
        id: 'analytics',
        label: 'Statistiques (MRR)',
        icon: BarChart3,
        color: 'text-purple-500 bg-purple-50 border-purple-200',
        actions: [
            { key: 'view', label: 'Lecteur Uniquement', icon: Eye },
        ]
    },
    {
        id: 'tables',
        label: 'Tables & Zones',
        icon: Table2,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        actions: [
            { key: 'view', label: 'Voir toutes les tables', icon: Eye },
            { key: 'edit', label: 'Modifier / Réorganiser', icon: Edit },
            { key: 'delete', label: 'Supprimer une table', icon: Trash2 },
        ]
    },
] as const

function buildDefaultPermissions(existing: Record<string, any> | null | undefined) {
    const defaults: Record<string, Record<string, boolean>> = {
        users: { view: false, edit: false, delete: false, impersonate: false },
        restaurants: { view: false, edit: false, delete: false },
        moderation: { view: false, resolve: false },
        payments: { view: false, refund: false },
        admins: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, edit: false },
        analytics: { view: false },
        tables: { view: false, edit: false, delete: false },
    }


    if (!existing) return defaults

    for (const [section, value] of Object.entries(existing)) {
        if (section in defaults) {
            if (typeof value === 'boolean') {
                // Legacy flat format → migrate to granular
                for (const key of Object.keys(defaults[section])) {
                    defaults[section][key] = value
                }
            } else if (typeof value === 'object') {
                defaults[section] = { ...defaults[section], ...value }
            }
        }
    }

    return defaults
}

export function EditAdminPermissionsDrawer({ 
    admin, 
    isCurrentUser,
    open,
    onOpenChange
}: { 
    admin: Admin
    isCurrentUser: boolean
    open: boolean
    onOpenChange: (open: boolean) => void 
}) {
    const [isSuperAdmin, setIsSuperAdmin] = useState(admin.is_super_admin)
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
        buildDefaultPermissions(admin.permissions)
    )
    const [isLoading, setIsLoading] = useState(false)

    const setPermission = (section: string, action: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [section]: { ...prev[section], [action]: value }
        }))
    }

    const toggleAll = (moduleId: string, state: boolean) => {
        const module = PERMISSION_MODULES.find(m => m.id === moduleId)
        if (!module) return
        const updated: Record<string, boolean> = {}
        module.actions.forEach(a => { updated[a.key] = state })
        setPermissions(prev => ({ ...prev, [moduleId]: { ...prev[moduleId], ...updated } }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        const result = await updateAdminPermissions(admin.id, {
            is_super_admin: isSuperAdmin,
            permissions
        })

        if (result.success) {
            toast.success(result.message)
            onOpenChange(false)
        } else {
            toast.error(result.error || 'Une erreur est survenue.')
        }
        setIsLoading(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
                <SheetHeader className="p-6 border-b bg-slate-900 text-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-black text-lg text-orange-300">
                            {admin.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <SheetTitle className="text-white font-black uppercase italic text-lg">Modifier les droits</SheetTitle>
                            <SheetDescription className="text-slate-400 font-medium text-sm">{admin.email}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="p-6 space-y-6">
                    {/* Super Admin Toggle */}
                    <div
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none",
                            isSuperAdmin ? "bg-orange-50 border-orange-200" : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                        onClick={() => !isCurrentUser && setIsSuperAdmin(!isSuperAdmin)}
                    >
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                            isSuperAdmin ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className={cn("font-black uppercase tracking-widest text-sm", isSuperAdmin ? "text-orange-700" : "text-slate-500")}>
                                Super Admin
                            </p>
                            <p className="text-xs font-bold text-slate-400">Accès total — ignore toutes les permissions individuelles</p>
                        </div>
                        <Checkbox
                            checked={isSuperAdmin}
                            disabled={isCurrentUser}
                            onCheckedChange={(c) => setIsSuperAdmin(c === true)}
                            className="pointer-events-none border-2 h-5 w-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                    </div>

                    {isCurrentUser && (
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center">
                            ⚠️ Vous ne pouvez pas modifier votre propre rôle Super Admin
                        </p>
                    )}

                    {/* Granular Permissions */}
                    {!isSuperAdmin && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Permissions par Section</h3>
                            {PERMISSION_MODULES.map((module) => {
                                const modulePerms = permissions[module.id] || {}
                                const allChecked = module.actions.every(a => modulePerms[a.key])

                                return (
                                    <div key={module.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                                        <div className="flex items-center justify-between p-3 bg-slate-50/60 border-b border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn("h-8 w-8 flex items-center justify-center rounded-lg border", module.color)}>
                                                    <module.icon className="h-4 w-4" />
                                                </div>
                                                <span className="font-black text-xs uppercase tracking-tight text-slate-900">{module.label}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleAll(module.id, !allChecked)}
                                                className="h-7 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                                            >
                                                {allChecked ? 'Tout décocher' : 'Tout sélectionner'}
                                            </Button>
                                        </div>

                                        <div className="p-3 grid grid-cols-2 gap-2">
                                            {module.actions.map((action) => {
                                                const isChecked = modulePerms[action.key] ?? false
                                                return (
                                                    <label
                                                        key={action.key}
                                                        className={cn(
                                                            "flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer",
                                                            isChecked ? "border-indigo-400 bg-indigo-50/40" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(c) => setPermission(module.id, action.key, c === true)}
                                                            className="h-4 w-4 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                        />
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <action.icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                            <span className={cn("text-xs font-bold uppercase tracking-tight truncate", isChecked ? "text-indigo-950" : "text-slate-600")}>
                                                                {action.label}
                                                            </span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 p-4 border-t bg-white flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 font-black uppercase tracking-widest text-xs"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-indigo-500/20"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <><Save className="h-4 w-4" /> Enregistrer</>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
