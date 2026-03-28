import { AlertCircle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
    status: {
        restaurant: boolean
        menu: boolean
        tables: boolean
        persona: boolean
        branding: boolean
    }
}

export function DashboardAlerts({ status }: Props) {
    const missing = []

    if (!status.menu) missing.push("Votre menu est vide. Ajoutez au moins un plat pour recevoir des commandes.")
    if (!status.tables) missing.push("Aucune table configurée. Vous ne pouvez pas encore générer de QR codes.")
    if (!status.restaurant) missing.push("Les informations de contact (téléphone, adresse) sont incomplètes.")

    if (missing.length === 0) return null

    return (
        <div className="space-y-4">
            {missing.map((msg, i) => (
                <Alert key={i} variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <div className="flex flex-1 items-center justify-between">
                        <div>
                            <AlertTitle className="font-bold">Action requise</AlertTitle>
                            <AlertDescription className="text-sm opacity-90">
                                {msg}
                            </AlertDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-destructive/10">
                            <Link href="/dashboard/settings" className="flex items-center gap-1 font-semibold">
                                Régler maintenant <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </Alert>
            ))}
        </div>
    )
}
