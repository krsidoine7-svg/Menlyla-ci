// Payment Success Page
// Displayed after successful payment redirect from GeniusPay

import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SuccessContent() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-900">
                        Paiement réussi !
                    </CardTitle>
                    <CardDescription className="text-base">
                        Votre commande a été confirmée et le restaurant a été notifié.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Receipt className="w-5 h-5 text-green-700 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-green-900">Prochaines étapes</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Le restaurant prépare votre commande. Vous recevrez une notification lorsqu'elle sera prête.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard/orders">
                                <Receipt className="w-4 h-4 mr-2" />
                                Voir mes commandes
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour au menu
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Chargement...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
