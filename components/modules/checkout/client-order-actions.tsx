'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentModal } from './payment-modal'
import { CreditCard, CheckCircle2 } from 'lucide-react'

interface ClientOrderActionsProps {
    orderId: string
    totalAmount: number
    restaurantName: string
    paymentStatus?: 'pending' | 'success' | 'failed'
    isPaid?: boolean
    isPaymentEnabled?: boolean
}

export function ClientOrderActions({
    orderId,
    totalAmount,
    restaurantName,
    isPaid = false,
    isPaymentEnabled = true
}: ClientOrderActionsProps) {
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    if (isPaid) {
        return (
            <div className="flex flex-col items-center gap-3 p-8 bg-emerald-500/10 text-emerald-500 rounded-[2rem] border border-emerald-500/20 animate-in fade-in zoom-in duration-700">
                <CheckCircle2 className="w-10 h-10" />
                <div className="text-center">
                    <p className="font-black uppercase tracking-widest text-[10px]">Statut</p>
                    <p className="font-bold text-lg italic tracking-tight">Commande Payée</p>
                </div>
            </div>
        )
    }

    if (!isPaymentEnabled) {
        return (
            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center space-y-2">
                <p className="text-white font-bold italic">Paiement Mobile Indisponible</p>
                <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest leading-relaxed">
                    Veuillez régler votre note directement au comptoir ou auprès de votre serveur.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-8 rounded-[2rem] shadow-2xl shadow-red-600/20 transform transition-all active:scale-95 group overflow-hidden relative"
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-widest">Payer {totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>

            <PaymentModal
                open={showPaymentModal}
                onOpenChange={setShowPaymentModal}
                orderId={orderId}
                amount={totalAmount}
                restaurantName={restaurantName}
            />
        </div>
    )
}
