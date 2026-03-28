'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { initiateOnboardingPayment } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'


function PaymentPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan') || 'pro'
    const [isPaying, setIsPaying] = useState(false)

    const handlePayment = async () => {
        setIsPaying(true)
        try {
            await initiateOnboardingPayment('pro')
        } catch (err) {
            setIsPaying(false)
            toast.error("Erreur lors de l'initiation du paiement")
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header / Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la configuration
                </button>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Activation Menlyla PRO</h1>
                    <p className="text-muted-foreground">La dernière étape pour lancer votre restaurant digital</p>
                </div>

                <Card className="border-4 border-orange-500 shadow-[0_32px_64px_-12px_rgba(249,115,22,0.2)] overflow-hidden rounded-[2.5rem] bg-white">
                    <div className="bg-orange-500 p-8 text-white text-center pb-12 relative overflow-hidden">
                        {/* Motif de fond subtil */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                        <h3 className="text-4xl font-black mb-3">Compte Pro</h3>
                        <p className="text-orange-50 font-medium max-w-sm mx-auto relative z-10">
                            Débloquez les QR codes par table et la gestion complète des commandes.
                        </p>
                    </div>

                    <CardContent className="p-8 -mt-8 space-y-8 bg-white rounded-t-[2.5rem] relative z-10">
                        {/* Price Display */}
                        <div className="bg-orange-50/50 p-8 rounded-[2rem] border-2 border-orange-100 text-center">
                            <div className="text-[10px] text-orange-900/60 font-black uppercase tracking-[0.2em] mb-2">Paiement unique d'activation</div>
                            <div className="text-6xl font-black text-orange-600 flex items-center justify-center gap-2">
                                11.900 <span className="text-2xl font-bold uppercase">FCFA</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-4">
                                <p className="text-xs text-orange-800/60 font-medium">9.900 FCFA (Forfait PRO)</p>
                                <p className="text-xs text-orange-800/60 font-medium">+ 2.000 FCFA (Frais de service & QR Codes)</p>
                            </div>
                        </div>

                        {/* Benefits list */}
                        <ul className="space-y-3">
                            {[
                                "QR Codes illimités par table",
                                "Gestion des commandes en temps réel",
                                "Statistiques de vente avancées",
                                "Support client prioritaire"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Button
                                onClick={handlePayment}
                                disabled={isPaying}
                                size="lg"
                                className="w-full bg-orange-600 hover:bg-orange-700 h-16 text-lg font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Redirection...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-3 h-6 w-6" />
                                        Payer maintenant
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
                                <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-tighter">Wave</span>
                                <span className="text-[10px] font-bold px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 uppercase tracking-tighter">Orange Money</span>
                                <span className="text-[10px] font-bold px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100 uppercase tracking-tighter">MTN Money</span>
                                <span className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100 uppercase tracking-tighter">Carte Visa/MC</span>
                            </div>

                            <p className="text-[10px] text-center text-muted-foreground pt-2">
                                Paiement sécurisé via <span className="font-bold">GeniusPay</span>.
                                <br />Activation immédiate après confirmation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <PaymentPageContent />
        </Suspense>
    )
}

