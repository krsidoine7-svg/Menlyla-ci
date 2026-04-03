'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { initiateOnboardingPayment } from '../actions'
import { toast } from 'sonner'

export function SubscriptionSettings({ restaurant }: { restaurant: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const currentPlan = restaurant.plan || 'solo'
    const status = restaurant.subscription_status || 'active'

    const handleUpgrade = async () => {
        setIsLoading(true)
        try {
            await initiateOnboardingPayment('pro')
        } catch (err) {
            toast.error("Erreur lors de l'initiation du paiement.")
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Current Plan Overview */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black italic uppercase tracking-tight">Mon Forfait <span className="text-orange-500">{currentPlan.toUpperCase()}</span></h2>
                            <Badge className={cn(
                                "font-black uppercase text-[10px] py-1 px-3 rounded-full border-none",
                                status === 'active' ? "bg-emerald-500" : "bg-orange-500"
                            )}>
                                {status === 'active' ? 'Actif' : 'En attente'}
                            </Badge>
                        </div>
                        <p className="text-slate-400 font-medium max-w-md">
                            {currentPlan === 'pro' 
                                ? "Vous profitez de toutes les fonctionnalités de Menlyla pour booster votre restaurant." 
                                : "Votre restaurant est en mode gratuit. Donnez-lui une autre dimension avec Menlyla PRO."}
                        </p>
                    </div>
                    {currentPlan === 'solo' && (
                        <Button 
                            onClick={handleUpgrade}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
                            Passer à Menlyla Pro
                        </Button>
                    )}
                </div>
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan details */}
                <Card className={cn(
                    "rounded-[2.5rem] border-none shadow-sm transition-all overflow-hidden",
                    currentPlan === 'solo' ? "ring-2 ring-slate-200 bg-white" : "bg-slate-50 opacity-60"
                )}>
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-slate-400" />
                            </div>
                            <CardTitle className="text-2xl font-black">Plan Solo</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium">L'essentiel pour commencer gratuitement et durablement.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="text-4xl font-black">Gratuit <span className="text-sm font-bold text-slate-400 uppercase">À vie</span></div>
                        <ul className="space-y-4">
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="Menu Digital en ligne" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="1 QR Code Générique" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="Partage sur les réseaux" />
                            <BenefitNoItem text="Pas de commande par table" />
                            <BenefitNoItem text="Pas de statistiques de vente" />
                        </ul>
                    </CardContent>
                </Card>

                {/* Pro Plan details */}
                <Card className={cn(
                    "rounded-[2.5rem] border-none shadow-xl transition-all overflow-hidden relative",
                    currentPlan === 'pro' ? "ring-2 ring-orange-500 bg-white" : "bg-white"
                )}>
                    {currentPlan === 'solo' && (
                        <div className="absolute top-4 right-4 z-20">
                            <Badge className="bg-emerald-500 font-bold uppercase text-[9px] tracking-widest px-3 py-1">Recommandé</Badge>
                        </div>
                    )}
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-orange-600" />
                            </div>
                            <CardTitle className="text-2xl font-black">Plan PRO</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium whitespace-pre-wrap">La puissance de Menlyla pour votre autonomie totale.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="text-4xl font-black">9.900 <span className="text-sm font-bold text-slate-400 uppercase">FCFA / mois</span></div>
                        <ul className="space-y-4">
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} text="QR Codes illimités par Table" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} text="Prise de commande en direct" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} text="Tableau de bord de cuisine" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} text="Paiement Mobile intégré" />
                            <BenefitItem icon={<CheckCircle2 className="h-4 w-4 text-orange-500" />} text="Analytiques & Rapport de ventes" />
                        </ul>
                        {currentPlan === 'solo' && (
                            <Button 
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl group transition-all"
                            >
                                Commencer Menlyla Pro
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <li className="flex items-center gap-3 text-sm font-bold text-slate-700 leading-tight">
            <div className="shrink-0">{icon}</div>
            {text}
        </li>
    )
}

function BenefitNoItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-sm font-bold text-slate-300 leading-tight">
            <div className="h-4 w-4 rounded-full border-2 border-slate-100 shrink-0" />
            <span className="line-through">{text}</span>
        </li>
    )
}
