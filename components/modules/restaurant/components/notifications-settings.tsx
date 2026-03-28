'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BellRing, Mail, Smartphone, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'


interface Props {
    restaurant: any
    settings?: any
    setSettings?: (settings: any) => void
}

export function NotificationsSettings({ restaurant, settings, setSettings }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                            <BellRing className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Notifications & Alertes</CardTitle>
                            <CardDescription>Gérez comment vous et vos clients êtes informés.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-8 px-8">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Live Orders - Active */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 transition-all hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none uppercase text-[10px] font-black tracking-widest pl-1.5 pr-2.5 py-1">
                                    <span className="relative flex h-2 w-2 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Actif par défaut
                                </Badge>
                            </div>

                            <div className="mb-4 h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Smartphone className="h-6 w-6" />
                            </div>

                            <h3 className="font-bold text-lg mb-2 text-slate-900">Commandes en direct</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Recevez une alerte sonore et visuelle pour chaque nouvelle commande.
                            </p>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Sonnerie activée</span>
                                <span className="mx-1">•</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Notification push</span>
                            </div>
                        </div>

                        {/* Summary Emails - Coming Soon */}
                        <div className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 p-6 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="outline" className="bg-white/50 text-slate-500 border-slate-200 uppercase text-[10px] font-black tracking-widest">
                                    Bientôt disponible
                                </Badge>
                            </div>

                            <div className="mb-4 h-12 w-12 rounded-2xl bg-white text-slate-400 shadow-sm flex items-center justify-center">
                                <Mail className="h-6 w-6" />
                            </div>

                            <h3 className="font-bold text-lg mb-2 text-slate-700">Emails Récapitulatifs</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Recevez un rapport quotidien détaillé de vos ventes et statistiques par email chaque soir après la fermeture.
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dev en cours</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
