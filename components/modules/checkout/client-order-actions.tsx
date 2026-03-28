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
}

export function ClientOrderActions({
    orderId,
    totalAmount,
    restaurantName,
    isPaid = false
}: ClientOrderActionsProps) {
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    if (isPaid) {
        return (
            <div className="flex flex-col items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-8 h-8" />
                <span className="font-bold">Commande payée</span>
            </div>
        )
    }

    return (
        <>
            <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl shadow-lg transform transition hover:scale-105"
            >
                <CreditCard className="mr-2 h-5 w-5" />
                Payer {totalAmount.toLocaleString()} FCFA
            </Button>

            <PaymentModal
                open={showPaymentModal}
                onOpenChange={setShowPaymentModal}
                orderId={orderId}
                amount={totalAmount}
                restaurantName={restaurantName}
            />
        </>
    )
}
