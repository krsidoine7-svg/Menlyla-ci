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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleToggleRole = async () => {
        setIsLoading(true)
        const res = await toggleAdminRole(user.id)
        if (res.success) toast.success(res.message)
        else toast.error(res.error)
        setIsLoading(false)
    }

    const handleDelete = async () => {
        setIsLoading(true)
        setShowDeleteConfirm(false)
        const res = await deleteUserAccount(user.id)
        if (res.success) toast.success(res.message)
        else toast.error(res.error)
        setIsLoading(false)
    }

    const handleImpersonate = async () => {
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
    }

    const hasAnyAction = canEdit || canDelete || canImpersonate

    return (
        <>
        <tr className={cn(
            "hover:bg-slate-50/50 transition-colors group",
            isLoading && "opacity-50 pointer-events-none animate-pulse"
        )}>

            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg border-2 border-orange-200 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-3 transition-all duration-300">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{user.full_name || 'Sans nom'}</div>
                        <div className="text-xs font-bold text-slate-400 tracking-tighter uppercase">{user.username ? `@${user.username}` : "Pas d'identifiant"}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {user.email || 'Non renseigné'}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 tracking-tighter uppercase overflow-hidden max-w-[120px] truncate">
                        ID: {user.id}
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <Badge variant={isAdmin ? 'default' : 'outline'} className={cn(
                    "capitalize font-bold tracking-tight px-3 py-1 border-2",
                    isAdmin 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200"
                )}>
                    {isAdmin ? (
                        <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-orange-400" /> Admin</span>
                    ) : 'Utilisateur'}
                </Badge>
            </td>
            <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Indéterminé'}
                </div>
            </td>
            <td className="px-6 py-5 text-right whitespace-nowrap">
                {hasAnyAction ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-200/50 rounded-xl transition-all">
                                <span className="sr-only">Menu actions</span>
                                <MoreHorizontal className="h-5 w-5 text-slate-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-200">
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">Actions Rapides</DropdownMenuLabel>
                            
                            {canEdit && (
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-orange-50 focus:text-orange-600 transition-all">
                                    <Edit className="h-4 w-4 text-slate-400 group-focus:text-orange-500" />
                                    Modifier Profile
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-indigo-50 focus:text-indigo-600 transition-all">
                                <UserCircle className="h-4 w-4 text-slate-400 group-focus:text-indigo-500" />
                                Voir Passport
                            </DropdownMenuItem>
                            {canImpersonate && (
                                <DropdownMenuItem 
                                    onClick={handleImpersonate}
                                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-emerald-50 focus:text-emerald-600 transition-all"
                                >
                                    <LogIn className="h-4 w-4 text-slate-400 group-focus:text-emerald-500" />
                                    Connexion en tant que...
                                </DropdownMenuItem>
                            )}

                            {(canEdit) && (
                                <>
                                    <DropdownMenuSeparator className="my-1 border-slate-100" />
                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">Sécurité & Modération</DropdownMenuLabel>
                                    {!isAdmin ? (
                                        <DropdownMenuItem 
                                            onClick={handleToggleRole}
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-emerald-50 focus:text-emerald-600 transition-all"
                                        >
                                            <ShieldCheck className="h-4 w-4 text-slate-400 group-focus:text-emerald-500" />
                                            Passer Admin
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem 
                                            onClick={handleToggleRole}
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-amber-50 focus:text-amber-600 transition-all"
                                        >
                                            <ShieldX className="h-4 w-4 text-slate-400 group-focus:text-amber-500" />
                                            Rétrograder
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}

                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator className="my-1 border-slate-100" />
                                    <DropdownMenuItem 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl font-bold group focus:bg-destructive/10 focus:text-destructive transition-all"
                                    >
                                        <Trash2 className="h-4 w-4 text-slate-400 group-focus:text-destructive" />
                                        Supprimer définitivement
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Lecture seule</span>
                )}
            </td>
        </tr>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0">
                <div className="bg-rose-600 p-6 flex items-center gap-4 text-white">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <AlertDialogTitle className="text-xl font-black italic uppercase">Confirmation de suppression</AlertDialogTitle>
                        <p className="text-rose-100 text-xs font-bold uppercase tracking-widest opacity-80">Action irréversible</p>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <AlertDialogDescription className="text-slate-600 font-bold leading-relaxed">
                        Vous êtes sur le point de supprimer définitivement le compte de <span className="text-slate-900 font-black italic">"{user.full_name || user.email}"</span>.
                        <br /><br />
                        Toutes ses données, profil et accès associés à Menlyla seront effacés de la base de données.
                    </AlertDialogDescription>
                </div>

                <AlertDialogFooter className="p-6 pt-0 flex gap-3">
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-100 hover:bg-slate-50">
                            Annuler
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button 
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-rose-500/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}

