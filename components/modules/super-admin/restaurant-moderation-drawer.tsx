'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Store, Clock, User, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function RestaurantModerationDrawer({ 
    restaurantId, 
    restaurantName,
    history 
}: { 
    restaurantId: string;
    restaurantName: string;
    history: any[];
}) {
    const router = useRouter()
    
    // Si la modale est fermée par l'utilisateur (clique à côté ou bouton croix), on retire le paramètre de l'URL
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            router.push('/admin/moderation', { scroll: false })
        }
    }

    return (
        <Sheet open={true} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-slate-50 border-l border-slate-200">
                <SheetHeader className="pb-6 border-b border-slate-200">
                    <SheetTitle className="flex items-center gap-2 font-black italic uppercase text-slate-900 text-xl">
                        <Store className="h-5 w-5 text-indigo-600" />
                        {restaurantName}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Historique de modération et actions système
                    </SheetDescription>
                </SheetHeader>
                
                <div className="py-8 space-y-6">
                    {history.length > 0 ? (
                        <div className="relative border-l-2 border-indigo-100 ml-3 pl-6 space-y-8">
                            {history.map((log: any) => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-indigo-50 border-2 border-indigo-500 shadow-sm" />
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative group hover:border-indigo-200 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="bg-slate-50 text-[10px] font-black tracking-widest uppercase border-slate-200">
                                                {log.action}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 italic">
                                            "{log.reason || "Mise à jour du statut / visibilité de la boutique"}"
                                        </p>
                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Modérateur : <span className="text-slate-600">{(log.app_admins as any)?.email || (Array.isArray(log.app_admins) ? (log.app_admins as any)[0]?.email : log.admin_id) || 'Système'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                <Info className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="font-black text-slate-900 text-lg italic uppercase">Aucun Historique</p>
                            <p className="text-xs font-medium text-slate-500 mt-2 max-w-[250px]">
                                Ce restaurant n'a jamais été suspendu ou modifié manuellement par un membre de l'équipe d'administration.
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
