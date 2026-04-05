'use client'

import { 
    MoreHorizontal, 
    Trash2, 
    Edit, 
    ShieldCheck, 
    ShieldX,
    UserCircle,
    Mail,
    Calendar,
    ShieldAlert,
    AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { LogIn } from 'lucide-react'
import { toggleAdminRole, deleteUserAccount, getImpersonationLink } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'
import { useState } from 'react'

type UserRowProps = { 
    user: any
    isAdmin: boolean
    canEdit?: boolean
    canDelete?: boolean
    canImpersonate?: boolean
}

export function UserRow({ user, isAdmin, canEdit = true, canDelete = true, canImpersonate = true }: UserRowProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean,
        type: 'delete' | 'impersonate' | 'role',
        title: string,
        description: string,
        action: () => void,
        color: string,
        icon: any
    }>({
        isOpen: false,
        type: 'delete',
        title: '',
        description: '',
        action: () => {},
        color: 'bg-red-600',
        icon: Trash2
    })

    const onToggleRole = () => {
        setConfirmConfig({
            isOpen: true,
            type: 'role',
            title: isAdmin ? "Révocation" : "Élévation Admin",
            description: isAdmin 
                ? "Vous allez retirer les privilèges d'accès total à cet utilisateur. Il ne pourra plus accéder au Super Dashboard." 
                : "ATTENTION : Vous allez accorder un ACCÈS TOTAL à cet utilisateur. Il pourra modifier d'autres utilisateurs et voir les données SaaS.",
            action: async () => {
                setIsLoading(true)
                const res = await toggleAdminRole(user.id)
                if (res.success) toast.success(res.message)
                else toast.error(res.error)
                setIsLoading(false)
            },
            color: isAdmin ? 'bg-amber-500' : 'bg-orange-600',
            icon: ShieldCheck
        })
    }

    const onImpersonate = () => {
        setConfirmConfig({
            isOpen: true,
            type: 'impersonate',
            title: "Infiltration (Ghost Mode)",
            description: "Vous allez être déconnecté de votre session admin pour entrer dans le compte de ce restaurateur. C'est idéal pour le support technique ou la configuration.",
            action: async () => {
                setIsLoading(true)
                toast.loading("Génération du passe-partout...", { id: 'impersonate' })
                const res = await getImpersonationLink(user.id)
                if (res.success && res.link) {
                    toast.success('Connexion établie. Redirection...', { id: 'impersonate' })
                    window.location.href = res.link
                } else {
                    toast.error(res.error || "Une erreur est survenue.", { id: 'impersonate' })
                    setIsLoading(false)
                }
            },
            color: 'bg-emerald-600',
            icon: LogIn
        })
    }

    const onDelete = () => {
        setConfirmConfig({
            isOpen: true,
            type: 'delete',
            title: "Extermination Totale",
            description: `Supprimer "${user.full_name || user.email}" ? Cette action effacera ses menus, QR codes et historiques. C'est irréversible.`,
            action: async () => {
                setIsLoading(true)
                const res = await deleteUserAccount(user.id)
                if (res.success) toast.success(res.message)
                else toast.error(res.error)
                setIsLoading(false)
            },
            color: 'bg-red-600',
            icon: Trash2
        })
    }

    const hasAnyAction = canEdit || canDelete || canImpersonate

    return (
        <>
        <tr className={cn(
            "hover:bg-white/[0.03] transition-all duration-300 group",
            isLoading && "opacity-50 pointer-events-none animate-pulse"
        )}>

            <td className="px-12 py-8 whitespace-nowrap">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-[0_10px_30px_-10px_rgba(234,88,12,0.5)] group-hover:rotate-6 transition-all duration-500 overflow-hidden relative border border-white/10">
                        {user.profile_image ? (
                             <img src={user.profile_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="relative z-10">{user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-lg tracking-tight group-hover:text-orange-500 transition-colors uppercase italic flex items-center gap-2">
                            {user.full_name || 'Anonyme'}
                            {isAdmin && <ShieldCheck className="h-4 w-4 text-orange-500" />}
                        </div>
                        <div className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase mt-1">
                            {user.username ? `@${user.username}` : "SANS IDENTIFIANT"}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-10 py-8 whitespace-nowrap">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm font-bold text-white/60">
                        <Mail className="h-4 w-4 text-orange-600/60" />
                        {user.email || '—'}
                    </div>
                    <div className="text-[9px] font-mono font-black text-white/10 tracking-widest uppercase truncate max-w-[150px]">
                        UID: {user.id.slice(0, 8)}...
                    </div>
                </div>
            </td>
            <td className="px-10 py-8 whitespace-nowrap">
                <Badge className={cn(
                    "font-black text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase border-none italic",
                    isAdmin 
                        ? "bg-orange-600 text-white shadow-xl shadow-orange-600/20" 
                        : "bg-white/5 text-white/40 border border-white/5"
                )}>
                    {isAdmin ? (
                        <span className="flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> Root Admin</span>
                    ) : 'Standard'}
                </Badge>
            </td>
            <td className="px-10 py-8 whitespace-nowrap">
                <div className="flex items-center gap-3 text-sm font-bold text-white/40">
                    <Calendar className="h-4 w-4 text-orange-600/40" />
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </div>
            </td>
            <td className="px-12 py-8 text-right whitespace-nowrap">
                {hasAnyAction ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 p-0 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/5 group/btn">
                                <span className="sr-only">Actions</span>
                                <MoreHorizontal className="h-6 w-6 text-white/20 group-hover/btn:text-white transition-colors" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)] bg-black/95 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
                            <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Contrôle Alpha</DropdownMenuLabel>
                            
                            {canEdit && (
                                <DropdownMenuItem className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-orange-600 focus:text-white transition-all">
                                    <Edit className="h-4 w-4 text-orange-500 group-focus:text-white" />
                                    Rectifier
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-white/10 focus:text-white transition-all text-white/60">
                                <UserCircle className="h-4 w-4 text-white/20 group-focus:text-white" />
                                Profil Public
                            </DropdownMenuItem>
                            {canImpersonate && (
                                <DropdownMenuItem 
                                    onClick={onImpersonate}
                                    className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-emerald-600 focus:text-white transition-all text-white/60"
                                >
                                    <LogIn className="h-4 w-4 text-emerald-500 group-focus:text-white" />
                                    Accès Ghost
                                </DropdownMenuItem>
                            )}

                            {(canEdit) && (
                                <>
                                    <DropdownMenuSeparator className="my-2 bg-white/5" />
                                    <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Permissions</DropdownMenuLabel>
                                    {!isAdmin ? (
                                        <DropdownMenuItem 
                                            onClick={onToggleRole}
                                            className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-orange-600 focus:text-white transition-all text-white/60"
                                        >
                                            <ShieldCheck className="h-4 w-4 text-orange-500 group-focus:text-white" />
                                            Élever Admin
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem 
                                            onClick={onToggleRole}
                                            className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-red-600 focus:text-white transition-all text-white/60"
                                        >
                                            <ShieldX className="h-4 w-4 text-red-500 group-focus:text-white" />
                                            Révoquer Droits
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}

                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator className="my-2 bg-white/5" />
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl font-bold group focus:bg-red-900 focus:text-white transition-all text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4 opacity-50 group-focus:opacity-100" />
                                        Exterminer
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Badge variant="outline" className="bg-transparent border-white/5 text-[9px] font-black text-white/10 uppercase tracking-widest px-3 py-1">ReadOnly</Badge>
                )}
            </td>
        </tr>

        <AlertDialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
            <AlertDialogContent className="rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden p-0 bg-black backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                <div className={cn("p-10 flex items-center gap-8 text-white relative overflow-hidden", confirmConfig.color)}>
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                         {confirmConfig.icon && <confirmConfig.icon className="h-32 w-32" />}
                    </div>
                    <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20 relative z-10">
                        {confirmConfig.icon && <confirmConfig.icon className="h-10 w-10 text-white" />}
                    </div>
                    <div className="relative z-10 space-y-1">
                        <AlertDialogTitle className="text-3xl font-black italic uppercase tracking-tight leading-none">{confirmConfig.title}</AlertDialogTitle>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Action Prioritaire • Admin</p>
                    </div>
                </div>
                
                <div className="p-10 space-y-6">
                    <AlertDialogDescription className="text-white/80 font-bold text-lg leading-relaxed italic">
                        {confirmConfig.description}
                    </AlertDialogDescription>
                </div>

                <AlertDialogFooter className="p-10 pt-0 flex gap-4">
                    <AlertDialogCancel asChild>
                        <Button variant="outline" className="flex-1 h-16 rounded-[1.5rem] border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] text-white/40 hover:bg-white/10 hover:text-white transition-all">
                            Annuler
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button 
                            onClick={(e) => {
                                e.preventDefault()
                                setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                                confirmConfig.action()
                            }}
                            className={cn("flex-1 h-16 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl transition-all active:scale-[0.98]", confirmConfig.color)}
                        >
                            Confirmer la Tâche
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
