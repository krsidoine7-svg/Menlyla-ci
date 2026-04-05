'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BellRing, Mail, Smartphone, Bell, AlertTriangle, CheckCircle2, Volume2, RotateCcw, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
    restaurant: any
    settings?: any
    setSettings?: (settings: any) => void
}

export function NotificationsSettings({ restaurant, settings, setSettings }: Props) {
    const vocalStyle = settings?.notification_vocal_style || 'continuous'

    const updateVocalStyle = (style: 'continuous' | 'twice') => {
        if (setSettings) {
             setSettings({ ...settings, notification_vocal_style: style })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-100">
                <CardHeader className="bg-slate-50/50 pb-10 border-b border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-3xl bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-600/20">
                            <BellRing className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase underline decoration-8 decoration-orange-100 underline-offset-4">Alertes <span className="text-orange-500 font-black">Vocales</span></CardTitle>
                            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Personnalisez l'ambiance sonore de votre cuisine.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-10 pt-10 px-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Continuous Mode */}
                        <div 
                            onClick={() => updateVocalStyle('continuous')}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] border-2 p-10 transition-all cursor-pointer",
                                vocalStyle === 'continuous' 
                                    ? "bg-orange-600 border-orange-600 text-white shadow-2xl shadow-orange-600/30 -translate-y-2 scale-[1.02]" 
                                    : "bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:shadow-xl opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            )}
                        >
                            {vocalStyle === 'continuous' && (
                                <div className="absolute -top-10 -right-10 opacity-10">
                                    <RotateCcw className="h-48 w-48 animate-spin-slow text-white" />
                                </div>
                            )}

                            <div className={cn("mb-6 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", vocalStyle === 'continuous' ? "bg-white/20" : "bg-slate-50")}>
                                <RotateCcw className={cn("h-7 w-7", vocalStyle === 'continuous' ? "text-white" : "text-slate-400")} />
                            </div>

                            <h3 className="font-black text-2xl mb-4 italic uppercase tracking-tight">Rappel Continu</h3>
                            <p className={cn("text-xs font-bold leading-relaxed mb-8", vocalStyle === 'continuous' ? "text-white/80" : "text-slate-400")}>
                                "Nouvelle commande arrivée" se répète tant qu'il y a des commandes en attente. Sécurité maximale.
                            </p>

                            <div className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-flex", vocalStyle === 'continuous' ? "bg-black/20 text-white" : "bg-slate-50 text-slate-300")}>
                                <Zap className="h-3 w-3" />
                                Recommandé pour cuisine bruyante
                            </div>
                        </div>

                        {/* Twice Mode */}
                        <div 
                            onClick={() => updateVocalStyle('twice')}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] border-2 p-10 transition-all cursor-pointer",
                                vocalStyle === 'twice' 
                                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/30 -translate-y-2 scale-[1.02]" 
                                    : "bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:shadow-xl opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            )}
                        >
                            <div className={cn("mb-6 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", vocalStyle === 'twice' ? "bg-white/20" : "bg-slate-50")}>
                                <Volume2 className={cn("h-7 w-7", vocalStyle === 'twice' ? "text-white" : "text-slate-400")} />
                            </div>

                            <h3 className="font-black text-2xl mb-4 italic uppercase tracking-tight">Signal Rapide (2x)</h3>
                            <p className={cn("text-xs font-bold leading-relaxed mb-8", vocalStyle === 'twice' ? "text-white/80" : "text-slate-400")}>
                                Annonce la commande 2 fois consécutivement au moment de l'arrivée, puis le système reste silencieux.
                            </p>

                            <div className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-flex", vocalStyle === 'twice' ? "bg-white/10 text-white" : "bg-slate-50 text-slate-300")}>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                Idéal pour ambiance calme
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email Settings - Future */}
            <div className="grid lg:grid-cols-2 gap-8 opacity-50 grayscale select-none">
                 <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-[2.5rem] flex items-center justify-between">
                     <div className="flex gap-4 items-center">
                        <Mail className="h-6 w-6 text-slate-400" />
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest text-slate-900 leading-none mb-1">Rapports par Email</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Bientôt disponible dans Menlyla Pro</p>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    )
}
