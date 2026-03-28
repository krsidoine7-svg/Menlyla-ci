
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
    Shield, 
    ShieldCheck, 
    Mail, 
    Lock, 
    Loader2,
    Save,
    ArrowLeft,
    Users,
    CreditCard,
    Store,
    Settings,
    ShieldAlert,
    BarChart3,
    Eye,
    Edit,
    Trash2,
    VenetianMask,
    Table2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createAdminAccount } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const adminFormSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    isSuperAdmin: z.boolean(),
    permissions: z.object({
        users: z.object({ view: z.boolean(), edit: z.boolean(), delete: z.boolean(), impersonate: z.boolean() }),
        restaurants: z.object({ view: z.boolean(), edit: z.boolean(), delete: z.boolean() }),
        payments: z.object({ view: z.boolean(), refund: z.boolean() }),
        moderation: z.object({ view: z.boolean(), resolve: z.boolean() }),
        settings: z.object({ view: z.boolean(), edit: z.boolean() }),
        admins: z.object({ view: z.boolean(), create: z.boolean(), edit: z.boolean(), delete: z.boolean() }),
        analytics: z.object({ view: z.boolean() }),
        tables: z.object({ view: z.boolean(), edit: z.boolean(), delete: z.boolean() }),
    })
})

type AdminFormValues = z.infer<typeof adminFormSchema>

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
            { key: 'view', label: 'Voir l\'équipe', icon: Eye },
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

export function CreateAdminForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<AdminFormValues>({
        resolver: zodResolver(adminFormSchema),
        defaultValues: {
            email: '',
            password: '',
            isSuperAdmin: false,
            permissions: {
                users: { view: true, edit: false, delete: false, impersonate: false },
                restaurants: { view: true, edit: false, delete: false },
                payments: { view: true, refund: false },
                moderation: { view: true, resolve: false },
                settings: { view: false, edit: false },
                admins: { view: false, create: false, edit: false, delete: false },
                analytics: { view: true },
                tables: { view: true, edit: false, delete: false },
            }
        }
    })


    const onSubmit = async (data: AdminFormValues) => {
        setIsLoading(true)
        const result = await createAdminAccount(data)
        
        if (result.success) {
            toast.success(result.message)
            router.push('/admin/compteAdmin')
        } else {
            toast.error(result.error || 'Une erreur est survenue.')
        }
        setIsLoading(false)
    }

    const isSuper = form.watch('isSuperAdmin')
    const permissions = form.watch('permissions')

    const toggleModuleRow = (moduleId: string, state: boolean) => {
        const moduleDef = PERMISSION_MODULES.find(m => m.id === moduleId)
        if (!moduleDef) return
        
        moduleDef.actions.forEach(action => {
            // @ts-ignore
            form.setValue(`permissions.${moduleId}.${action.key}`, state, { shouldValidate: true })
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Information de base */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden sticky top-8">
                        <CardHeader className="bg-slate-900 text-white">
                            <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                                <Shield className="h-5 w-5 text-orange-400" /> Profil Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-slate-700">Adresse Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="email" 
                                        placeholder="admin@menlyla.com" 
                                        className="pl-10 h-11 border-slate-200 rounded-xl font-medium focus-visible:ring-indigo-500"
                                        {...form.register('email')}
                                    />
                                </div>
                                {form.formState.errors.email && <p className="text-xs font-bold text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-bold text-slate-700">Mot de Passe (Provisoire)</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="password" 
                                        type="password"
                                        placeholder="••••••••" 
                                        className="pl-10 h-11 border-slate-200 rounded-xl font-medium focus-visible:ring-indigo-500"
                                        {...form.register('password')}
                                    />
                                </div>
                                {form.formState.errors.password && <p className="text-xs font-bold text-destructive">{form.formState.errors.password.message}</p>}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div 
                                    className={cn(
                                        "flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all select-none cursor-pointer",
                                        isSuper ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                                    )}
                                    onClick={() => form.setValue('isSuperAdmin', !isSuper)}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                        isSuper ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <Label className={cn("text-sm font-black uppercase tracking-widest pointer-events-none", isSuper ? "text-orange-600" : "text-slate-400")}>
                                            Super Admin
                                        </Label>
                                        <p className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">Accès total sans restriction</p>
                                    </div>
                                    <Checkbox 
                                        id="super-admin-check"
                                        checked={isSuper} 
                                        onCheckedChange={(checked) => form.setValue('isSuperAdmin', checked === true)}
                                        className="border-2 border-slate-200 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 h-5 w-5 pointer-events-none"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 font-black uppercase tracking-widest gap-2 group transition-all mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 group-hover:scale-110 transition-transform" /> 
                                        Créer le compte
                                    </>
                                )}
                            </Button>
                            
                            <Button variant="ghost" asChild className="w-full h-11 text-slate-400 hover:text-slate-600 font-bold gap-2">
                                <Link href="/admin/compteAdmin">
                                    <ArrowLeft className="h-4 w-4" /> Annuler et revenir
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions Gradients */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm h-full bg-white">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-xl font-black text-slate-900 italic uppercase">Permissions Détaillées par Section</CardTitle>
                            <CardDescription className="text-sm font-medium">Contrôlez au millimètre les actions que ce collaborateur peut effectuer.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isSuper ? (
                                <div className="p-16 text-center bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl border-2 border-dashed border-orange-200">
                                    <div className="h-24 w-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30 animate-pulse">
                                        <ShieldCheck className="h-12 w-12 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black text-orange-950 uppercase italic mb-3">Contrôle Absolu</h3>
                                    <p className="text-orange-900/70 font-bold max-w-md mx-auto leading-relaxed text-sm">
                                        Le rôle Super Admin écrase toutes les permissions détaillées. L'utilisateur aura automatiquement un accès complet en écriture et en lecture à l'intégralité du système Menlyla.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {PERMISSION_MODULES.map((module) => {
                                        const modulePermissions = (permissions[module.id] || {}) as Record<string, boolean>
                                        const allChecked = module.actions.every(action => modulePermissions[action.key])

                                        return (
                                            <div key={module.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all bg-white hover:shadow-sm">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 border-b border-slate-100 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl font-black border", module.color)}>
                                                            <module.icon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black uppercase tracking-tight text-slate-900 text-sm">{module.label}</h4>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{module.actions.length} actions disponibles</p>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => toggleModuleRow(module.id, !allChecked)}
                                                        className={cn(
                                                            "h-8 text-[10px] font-black uppercase tracking-widest",
                                                            allChecked ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50" : "border-slate-200 text-slate-500"
                                                        )}
                                                    >
                                                        {allChecked ? "Tout décocher" : "Tout sélectionner"}
                                                    </Button>
                                                </div>
                                                
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
                                                    {module.actions.map((action) => {
                                                        const isChecked = modulePermissions[action.key]
                                                        return (
                                                            <label 
                                                                key={action.key}
                                                                className={cn(
                                                                    "flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none",
                                                                    isChecked ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                                                )}
                                                            >
                                                                <Checkbox 
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => {
                                                                        // @ts-ignore
                                                                        form.setValue(`permissions.${module.id}.${action.key}`, checked === true, { shouldValidate: true })
                                                                    }}
                                                                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-5 w-5 rounded-md"
                                                                />
                                                                <div className="space-y-1">
                                                                    <div className={cn("flex items-center gap-1.5 font-bold text-xs uppercase tracking-tight", isChecked ? "text-indigo-950" : "text-slate-600")}>
                                                                        <action.icon className="h-3.5 w-3.5 opacity-70" />
                                                                        {action.label}
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-slate-400 capitalize-first">{action.key} access</p>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}


