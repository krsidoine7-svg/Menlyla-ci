'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutGrid, TrendingUp, Users, DollarSign } from 'lucide-react'

interface Props {
    restaurant: any
}

export function AnalyticsSettings({ restaurant }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Analytiques & Rapports</CardTitle>
                            <CardDescription>Configurez vos rapports et suivez vos performances.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 animate-pulse">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">Rapports Avancés en construction</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Nous travaillons sur un dashboard analytique complet incluant les ventes par heure, les plats les plus populaires et la rétention client.
                    </p>
                    <div className="flex justify-center gap-4 pt-4 opacity-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full"><Users className="h-3 w-3" /> CLIENTS</div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full"><DollarSign className="h-3 w-3" /> REVENUS</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
