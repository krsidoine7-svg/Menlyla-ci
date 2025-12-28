'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, ArrowRight, Settings } from "lucide-react"
import Link from "next/link"

export function NoRestaurantState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-md border-2 border-dashed shadow-none bg-muted/10">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Store className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Restaurant non configuré</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Vous devez configurer les informations de votre établissement avant d'accéder à cette fonctionnalité.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                    <p className="text-sm text-center text-muted-foreground px-4">
                        Nom, logo, slug URL et devise sont nécessaires pour générer vos menus et QR codes.
                    </p>
                    <Button asChild size="lg" className="w-full bg-orange-600 hover:bg-orange-700 rounded-2xl h-14 text-lg font-bold shadow-xl shadow-orange-500/10">
                        <Link href="/onboarding" className="flex items-center gap-2">
                            Configurer mon restaurant
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="text-muted-foreground">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            Retour à l'accueil
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
