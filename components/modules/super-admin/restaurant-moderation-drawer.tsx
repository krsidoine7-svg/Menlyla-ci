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
import { Store, Clock, User, Info, History } from 'lucide-react'
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
            <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-black border-l border-white/10 text-white p-10">
                <SheetHeader className="pb-10 border-b border-white/5 space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-600">
                        <History className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                        <SheetTitle className="text-3xl font-bold italic tracking-tighter text-white">
                            {restaurantName}
                        </SheetTitle>
                        <SheetDescription className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">
                            Journal d'audit & Historique
                        </SheetDescription>
                    </div>
                </SheetHeader>
                
                <div className="py-12">
                    {history.length > 0 ? (
                        <div className="relative border-l border-white/5 ml-3 pl-8 space-y-10">
                            {history.map((log: any) => (
                                <div key={log.id} className="relative group">
                                    <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full bg-black border border-white/20 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500 shadow-2xl" />
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-white/5 text-[9px] font-black tracking-widest uppercase border-white/10 text-white/40 px-3 py-1 rounded-full italic">
                                                {log.action}
                                            </Badge>
                                            <div className="text-[9px] font-medium text-white/20 flex items-center gap-2 uppercase tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                                            <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                                                "{log.reason || "Mise à jour du statut / visibilité de la boutique"}"
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 px-2">
                                            <div className="h-5 w-5 rounded-full bg-red-600/10 flex items-center justify-center">
                                                <User className="h-2.5 w-2.5 text-red-600" />
                                            </div>
                                            <span className="text-[9px] uppercase font-black text-white/20 tracking-tighter">
                                                Modérateur : <span className="text-white/60">{(log.app_admins as any)?.email || (Array.isArray(log.app_admins) ? (log.app_admins as any)[0]?.email : log.admin_id) || 'Système'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-16 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                            <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 text-white/10">
                                <Info className="h-10 w-10" />
                            </div>
                            <h4 className="text-xl font-bold text-white italic tracking-tight">Aucun passif</h4>
                            <p className="text-[10px] font-medium text-white/20 mt-4 max-w-[220px] uppercase tracking-widest leading-relaxed">
                                Cet établissement n'a subi aucune modification manuelle.
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
