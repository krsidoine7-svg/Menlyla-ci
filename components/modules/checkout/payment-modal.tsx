// Payment Modal Component
// Handles payment initiation and redirects to GeniusPay checkout

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, CreditCard, Smartphone, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
    amount: number
    restaurantName: string
}

const PAYMENT_METHODS = [
    { id: 'wave', name: 'Wave', icon: Wallet, color: 'bg-blue-500' },
    { id: 'orange_money', name: 'Orange Money', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'mtn_money', name: 'MTN Money', icon: Smartphone, color: 'bg-yellow-500' },
    { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'bg-slate-700' },
]

export function PaymentModal({ open, onOpenChange, orderId, amount, restaurantName }: PaymentModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')

    const handlePayment = async () => {
        // Validate inputs
        if (!customerName.trim()) {
            toast.error('Veuillez entrer votre nom')
            return
        }

        if (!customerPhone.trim()) {
            toast.error('Veuillez entrer votre numéro de téléphone')
            return
        }

        setIsLoading(true)

        try {
            // Call payment initiation API
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: orderId,
                    amount,
                    payment_method: selectedMethod,
                    customer: {
                        name: customerName,
                        phone: customerPhone,
                        email: customerEmail || undefined,
                    },
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Échec de l\'initiation du paiement')
            }

            // Redirect to GeniusPay checkout
            if (data.checkout_url) {
                window.location.href = data.checkout_url
            } else {
                throw new Error('URL de paiement non reçue')
            }
        } catch (error) {
            console.error('Payment initiation error:', error)
            toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'initiation du paiement')
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paiement de la commande</DialogTitle>
                    <DialogDescription>
                        {restaurantName} • {amount.toLocaleString()} FCFA
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="customer-name">Nom complet *</Label>
                            <Input
                                id="customer-name"
                                placeholder="Jean Kouassi"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer-phone">Téléphone *</Label>
                            <Input
                                id="customer-phone"
                                type="tel"
                                placeholder="+225 07 48 12 34 56"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer-email">Email (optionnel)</Label>
                            <Input
                                id="customer-email"
                                type="email"
                                placeholder="jean@example.com"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                        <Label>Moyen de paiement (optionnel)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon
                                const isSelected = selectedMethod === method.id

                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedMethod(isSelected ? null : method.id)}
                                        disabled={isLoading}
                                        className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                    >
                                        <div className={`p-1.5 rounded ${method.color} text-white`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{method.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Laissez vide pour choisir sur la page de paiement
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Redirection...
                                </>
                            ) : (
                                'Payer maintenant'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
