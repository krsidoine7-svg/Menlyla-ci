'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BellRing, Mail, Smartphone, Bell, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    restaurant: any
}

export function NotificationsSettings({ restaurant }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                            <BellRing className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Notifications & Alertes</CardTitle>
                            <CardDescription>Gérez comment vous et vos clients êtes informés.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-3xl bg-amber-50/30 border border-amber-100 space-y-4">
                            <div className="flex items-center gap-3 text-amber-900">
                                <Smartphone className="h-5 w-5" />
                                <h4 className="font-bold">Commandes en direct</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Recevez une alerte sonore et visuelle pour chaque nouvelle commande.</p>
                            <div className="flex items-center gap-2 pt-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Actif par défaut</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 opacity-75">
                            <div className="flex items-center gap-3 text-slate-700">
                                <Mail className="h-5 w-5" />
                                <h4 className="font-bold">Emails Récapitulatifs</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Recevez un rapport quotidien de vos ventes par email chaque soir.</p>
                            <div className="flex items-center gap-2 pt-2">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Bientôt disponible</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
