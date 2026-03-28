import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default function OnboardingErrorPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <ErrorContent />
        </Suspense>
    )
}

function ErrorContent() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md border-t-8 border-t-destructive rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <CardHeader className="text-center pt-10">
                    <div className="mx-auto h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-4">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900">Oups ! Problème de paiement</CardTitle>
                    <CardDescription>Le paiement des frais de mise en service n'a pas pu être finalisé.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6 text-center">
                    <div className="bg-slate-100 p-4 rounded-2xl text-left space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Raisons possibles :</p>
                        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                            <li>Solde insuffisant sur votre compte</li>
                            <li>La transaction a été annulée</li>
                            <li>Délai d'attente dépassé</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/onboarding">
                            <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Réessayer
                            </Button>
                        </Link>

                        <Link href="/">
                            <Button variant="ghost" className="w-full text-slate-500">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour à l'accueil
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
