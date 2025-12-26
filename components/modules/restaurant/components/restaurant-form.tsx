'use client'

import { useActionState } from 'react'
import { createRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(createRestaurant, { message: null, errors: {} })

    return (
        <Card className="w-full max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle>Créez votre Restaurant</CardTitle>
                <CardDescription>
                    Une dernière étape avant d'accéder à votre dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du Restaurant</Label>
                        <Input id="name" name="name" placeholder="Maquis Le Baron" required />
                        {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Identifiant URL (Slug)</Label>
                        <Input id="slug" name="slug" placeholder="maquis-le-baron" required />
                        <p className="text-xs text-muted-foreground">Sera utilisé pour votre QR Code : manly.ci/maquis-le-baron</p>
                        {state?.errors?.slug && <p className="text-sm text-destructive">{state.errors.slug}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone (Mobile Money)</Label>
                        <Input id="phone" name="phone" placeholder="07 00 00 00 00" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description courte</Label>
                        <Textarea id="description" name="description" placeholder="Le meilleur poulet braisé..." />
                    </div>

                    {state?.message && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                            {state.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Création...' : 'Lancer mon Restaurant 🚀'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
