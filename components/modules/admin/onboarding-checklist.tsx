import { CheckCircle2, Circle, Store, Utensils, QrCode } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type OnboardingStatus = {
    restaurant: boolean
    menu: boolean
    tables: boolean
}

export function OnboardingChecklist({ status }: { status: OnboardingStatus }) {
    const steps = [
        {
            id: 'restaurant',
            title: 'Créer votre restaurant',
            description: 'Nom, logo et informations de base.',
            icon: Store,
            completed: status.restaurant,
            href: '/onboarding'
        },
        {
            id: 'menu',
            title: 'Ajouter vos plats',
            description: 'Créez vos catégories et vos premiers plats.',
            icon: Utensils,
            completed: status.menu,
            href: '/dashboard/menu'
        },
        {
            id: 'tables',
            title: 'Configurer vos tables',
            description: 'Ajoutez vos tables pour générer les QR codes.',
            icon: QrCode,
            completed: status.tables,
            href: '/dashboard/tables'
        }
    ]

    const completedCount = steps.filter(s => s.completed).length
    const progress = (completedCount / steps.length) * 100

    if (progress === 100) return null

    return (
        <Card className="border-orange-500/20 bg-orange-50/10">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Complétez votre configuration</CardTitle>
                        <CardDescription>Plus que quelques étapes pour lancer votre restaurant.</CardDescription>
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                        {completedCount}/{steps.length}
                    </div>
                </div>
                <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {steps.map((step) => (
                        <Link
                            key={step.id}
                            href={step.completed ? '#' : step.href}
                            className={cn(
                                "flex flex-col p-4 rounded-xl border transition-all",
                                step.completed
                                    ? "bg-muted/50 border-muted opacity-60"
                                    : "bg-white border-orange-200 hover:border-orange-500 shadow-sm"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    step.completed ? "bg-muted text-muted-foreground" : "bg-orange-100 text-orange-600"
                                )}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <h4 className="font-bold text-sm">{step.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
