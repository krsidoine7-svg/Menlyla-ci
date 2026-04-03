'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AlertCircle, Store, Utensils, QrCode, User, Palette, Clock3 } from 'lucide-react'

type OnboardingStatus = {
    restaurant: boolean
    menu: boolean
    tables: boolean
    persona: boolean
    branding: boolean
    logo: boolean
    hours: boolean
}

export function OnboardingNotifications({ status }: { status: OnboardingStatus }) {
    const router = useRouter()
    const notified = useRef(false)

    useEffect(() => {
        // Only run once per session/mount to avoid spam
        if (notified.current) return
        notified.current = true

        type MissingStep = {
            title: string
            description: string
            icon: any
            href: string
        }

        const missingSteps: MissingStep[] = []

        if (!status.restaurant) {
            missingSteps.push({
                title: "Configuration de base",
                description: "Ajoutez vos coordonnées de contact.",
                icon: Store,
                href: '/dashboard/settings?section=profile'
            })
        }

        if (!status.logo) {
            missingSteps.push({
                title: "Logo de marque",
                description: "Importez votre logo pour être reconnu.",
                icon: Palette,
                href: '/dashboard/settings?section=design'
            })
        }

        if (!status.hours) {
            missingSteps.push({
                title: "Horaires",
                description: "Définissez quand vous êtes ouvert.",
                icon: Clock3,
                href: '/dashboard/settings?section=hours'
            })
        }

        if (!status.menu) {
            missingSteps.push({
                title: "Menu Digital",
                description: "Ajoutez vos premiers plats pour vendre.",
                icon: Utensils,
                href: '/dashboard/menu'
            })
        }

        if (!status.tables) {
            missingSteps.push({
                title: "Tables & QR",
                description: "Générez vos QR codes pour les tables.",
                icon: QrCode,
                href: '/dashboard/tables'
            })
        }

        // Trigger toasts after a short delay
        if (missingSteps.length > 0) {
            setTimeout(() => {
                missingSteps.forEach((step, index) => {
                    setTimeout(() => {
                        toast(step.title, {
                            description: step.description,
                            action: {
                                label: "Configurer",
                                onClick: () => router.push(step.href)
                            },
                            icon: <step.icon className="h-4 w-4 text-orange-500" />
                        })
                    }, index * 1000) // Stagger toasts
                })
            }, 1500)
        }
    }, [status, router])

    return null
}
