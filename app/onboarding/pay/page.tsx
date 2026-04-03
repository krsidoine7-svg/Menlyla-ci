'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { initiateOnboardingPayment } from '@/components/modules/restaurant/actions'
import { getSystemSettings } from '@/app/(super-admin)/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, ArrowLeft, CheckCircle2, Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

function PaymentPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan') || 'pro'
    const [isPaying, setIsPaying] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadSettings() {
            const data = await getSystemSettings()
            setSettings(data)
            setIsLoading(false)
        }
        loadSettings()
    }, [])

    const handlePayment = async () => {
        if (!settings?.is_saas_payments_enabled) {
            toast.error("Les paiements en ligne sont temporairement désactivés.")
            return
        }
        setIsPaying(true)
        try {
            await initiateOnboardingPayment('pro')
        } catch (err) {
            setIsPaying(false)
            toast.error("Erreur lors de l'initiation du paiement")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                    <p className="text-white/20 font-bold text-xs uppercase tracking-widest">Initialisation sécurisée...</p>
                </div>
            </div>
        )
    }

    const isEnabled = settings?.is_saas_payments_enabled !== false
    const price = settings?.monthly_pro_price_xof || 25000

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-lg space-y-10 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-xs font-bold text-white/30 hover:text-white transition-all uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à la configuration
                </button>

                {!isEnabled ? (
                    <Card className="bg-white/5 border-red-600/20 rounded-[3rem] p-10 text-center space-y-8 backdrop-blur-xl">
                        <div className="mx-auto h-20 w-20 bg-red-600/10 rounded-[2rem] flex items-center justify-center text-red-600 border border-red-600/20">
                            <AlertTriangle className="h-10 w-10" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-white italic">Paiements Désactivés</h2>
                            <p className="text-sm font-medium text-white/40 leading-relaxed">
                                La passerelle de paiement en ligne est actuellement en maintenance. 
                                Veuillez contacter l'administration de Menlyla pour activer votre compte manuellement.
                            </p>
                        </div>
                        <Button 
                            onClick={() => router.push('/')}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl h-14 w-full font-bold uppercase tracking-widest text-xs"
                        >
                            Quitter
                        </Button>
                    </Card>
                ) : (
                    <Card className="bg-white/5 border-white/10 shadow-3xl overflow-hidden rounded-[3rem] backdrop-blur-xl group">
                        <div className="bg-red-600 p-10 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-1 bg-white/40 w-12 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Offre Premium</span>
                                </div>
                                <h3 className="text-4xl font-bold italic tracking-tighter">Menlyla PRO</h3>
                                <p className="text-red-50/70 font-medium max-w-sm">
                                    Débloquez les commandes par QR code, la gestion en temps réel et votre dashboard complet.
                                </p>
                            </div>
                            <Zap className="absolute -bottom-10 -right-10 h-48 w-48 text-black opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <CardContent className="p-10 space-y-10">
                            <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 text-center space-y-2">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Abonnement Mensuel</p>
                                <div className="text-6xl font-bold text-white italic tracking-tighter flex items-center justify-center gap-3">
                                    {price.toLocaleString('fr-FR')} <span className="text-xl font-medium opacity-20 not-italic">XOF</span>
                                </div>
                                <p className="text-[10px] text-white/20 font-medium italic">Sans engagement, résiliable à tout moment.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    "Commandes QR Code illimitées",
                                    "Suivi Cuisine en temps réel",
                                    "Dashboard de statistiques",
                                    "Support prioritaire 24/7"
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm font-bold text-white/60">
                                        <div className="h-6 w-6 rounded-full bg-red-600/20 text-red-600 flex items-center justify-center border border-red-600/20">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <Button
                                    onClick={handlePayment}
                                    disabled={isPaying}
                                    className="w-full bg-red-600 hover:bg-red-700 h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {isPaying ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Redirection...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-5 w-5" />
                                                Activer mon accès PRO
                                            </>
                                        )}
                                    </div>
                                </Button>

                                <div className="flex items-center justify-center gap-6 pt-2">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                            <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Paiement 100% Sécurisé</span>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-20 grayscale hover:grayscale-0 transition-all duration-500">
                                            <span className="text-[8px] font-bold text-white">Wave</span>
                                            <span className="text-[8px] font-bold text-white">Orange</span>
                                            <span className="text-[8px] font-bold text-white">MTN</span>
                                            <span className="text-[8px] font-bold text-white">Visa/MC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                    <p className="text-white/20 font-bold text-xs uppercase tracking-widest">Chargement...</p>
                </div>
            </div>
        }>
            <PaymentPageContent />
        </Suspense>
    )
}

