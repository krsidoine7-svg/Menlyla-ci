import { CheckCircle2, Circle, Store, Utensils, QrCode, User, Palette, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type OnboardingStatus = {
    restaurant: boolean
    menu: boolean
    tables: boolean
    persona: boolean
    branding: boolean
}

export function OnboardingChecklist({ status }: { status: OnboardingStatus }) {
    const steps = [
        {
            id: 'restaurant',
            title: 'Configuration de base',
            description: 'Coordonnées et adresse du restaurant.',
            icon: Store,
            completed: status.restaurant,
            href: '/dashboard/settings?section=profile'
        },
        {
            id: 'persona',
            title: 'Votre Personnage',
            description: 'Créez votre Passport digital (optionnel).',
            icon: User,
            completed: status.persona,
            href: '/dashboard/settings?section=passport'
        },
        {
            id: 'branding',
            title: 'Identité Visuelle',
            description: 'Ajoutez votre logo et vos horaires.',
            icon: Palette,
            completed: status.branding,
            href: '/dashboard/settings?section=design'
        },
        {
            id: 'menu',
            title: 'Menu Digital',
            description: 'Ajoutez vos plats et vos prix.',
            icon: Utensils,
            completed: status.menu,
            href: '/dashboard/menu'
        },
        {
            id: 'tables',
            title: 'QR Codes & Tables',
            description: 'Générez les codes pour vos tables.',
            icon: QrCode,
            completed: status.tables,
            href: '/dashboard/tables'
        }
    ]

    const completedCount = steps.filter(s => s.completed).length
    const progress = (completedCount / steps.length) * 100

    if (progress === 100) return null

    return (
        <Card className="border-orange-500/30 bg-orange-50/20 shadow-xl shadow-orange-500/5 overflow-hidden">
            <div className="bg-orange-500 h-1.5 w-full" style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }} />
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                🚀 Lancez votre restaurant
                            </CardTitle>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {Math.round(progress)}% complété
                            </Badge>
                        </div>
                        <CardDescription className="text-sm font-medium">
                            {completedCount === steps.length - 1
                                ? "Presque fini ! Une dernière étape et vous êtes prêt."
                                : "Complétez ces étapes pour offrir la meilleure expérience à vos clients."}
                        </CardDescription>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-2xl font-black text-orange-600 leading-none">
                            {completedCount}/{steps.length}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">étapes</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {steps.map((step) => (
                        <Link
                            key={step.id}
                            href={step.completed ? '#' : step.href}
                            className={cn(
                                "group flex flex-col p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                step.completed
                                    ? "bg-muted/30 border-muted opacity-60 grayscale hover:grayscale-0"
                                    : "bg-white border-orange-200 hover:border-orange-500 shadow-md hover:shadow-lg hover:-translate-y-1"
                            )}
                        >
                            {!step.completed && (
                                <div className="absolute top-2 right-2">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-colors",
                                    step.completed
                                        ? "bg-muted text-muted-foreground"
                                        : "bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
                                )}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-orange-500 opacity-50 group-hover:opacity-100" />
                                )}
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-1">{step.title}</h4>
                            <p className="text-[11px] text-muted-foreground leading-snug">{step.description}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
