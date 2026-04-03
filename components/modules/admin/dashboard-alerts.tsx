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
        logo: boolean
        hours: boolean
    }
}

export function DashboardAlerts({ status }: Props) {
    const alerts = []

    if (!status.menu) {
        alerts.push({
            title: "Menu vide",
            msg: "Votre catalogue ne contient aucun plat. Ajoutez une catégorie et votre premier article dans la section **Menu** pour activer la prise de commande.",
            href: "/dashboard/menu",
            action: "Gérer le Menu"
        })
    }
    
    if (!status.tables) {
        alerts.push({
            title: "Tables non configurées",
            msg: "Aucune table n'est enregistrée. Sans tables, vous ne pouvez pas générer de QR Codes. Configurez vos tables dans la section **Tables**.",
            href: "/dashboard/tables",
            action: "Ajouter des Tables"
        })
    }
    
    if (!status.restaurant) {
        alerts.push({
            title: "Contact incomplet",
            msg: "Votre numéro de téléphone ou adresse est manquant. Complétez ces informations cruciales dans **Paramètres > Profil**.",
            href: "/dashboard/settings?section=profile",
            action: "Compléter le Profil"
        })
    }

    if (!status.logo) {
        alerts.push({
            title: "Identité visuelle",
            msg: "Votre logo n'est pas configuré. Importez votre image dans **Paramètres > Design** pour personnaliser vos QR codes et votre interface.",
            href: "/dashboard/settings?section=design",
            action: "Importer un Logo"
        })
    }

    if (!status.hours) {
        alerts.push({
            title: "Horaires non définis",
            msg: "Vos horaires d'ouverture ne sont pas configurés. Indiquez vos jours et heures dans **Paramètres > Horaires** pour vos clients.",
            href: "/dashboard/settings?section=hours",
            action: "Régler les Horaires"
        })
    }

    if (alerts.length === 0) return null

    return (
        <div className="space-y-4">
            {alerts.slice(0, 3).map((alert, i) => (
                <Alert key={i} variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2 flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <AlertTitle className="font-bold text-base flex items-center gap-2">
                                ⚠️ {alert.title}
                            </AlertTitle>
                            <AlertDescription className="text-sm opacity-90 mt-1 max-w-2xl">
                                {alert.msg.split('**').map((part, index) => 
                                    index % 2 === 0 ? part : <span key={index} className="font-bold underline decoration-orange-500/30">{part}</span>
                                )}
                            </AlertDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="shrink-0 border-destructive/20 hover:bg-destructive/10">
                            <Link href={alert.href} className="flex items-center gap-1 font-semibold">
                                {alert.action} <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </Alert>
            ))}
        </div>
    )
}
