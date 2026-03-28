// Payment Error Page
// Displayed after failed/cancelled payment redirect from GeniusPay

import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ErrorContent() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-900">
                        Paiement échoué
                    </CardTitle>
                    <CardDescription className="text-base">
                        Le paiement n'a pas pu être complété. Votre commande n'a pas été confirmée.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800">
                            <span className="font-semibold">Raisons possibles :</span>
                        </p>
                        <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Solde insuffisant</li>
                            <li>Paiement annulé</li>
                            <li>Problème de connexion</li>
                            <li>Délai d'attente dépassé</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Réessayer
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour au menu
                            </Link>
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Besoin d'aide ? Contactez le restaurant directement.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Chargement...</div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    )
}
