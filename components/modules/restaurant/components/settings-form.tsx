'use client'

import { useActionState } from 'react'
import { updateRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { useEffect } from 'react'

type Props = {
    restaurant: any
}

export function SettingsForm({ restaurant }: Props) {
    const updateWithId = updateRestaurant.bind(null, restaurant.id)
    const [state, formAction, isPending] = useActionState(updateWithId, { message: null, errors: {} })

    useEffect(() => {
        if (state.message && !state.errors) {
            toast.success(state.message)
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil du Restaurant</CardTitle>
                <CardDescription>
                    Modifiez les informations visibles par vos clients.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du Restaurant</Label>
                            <Input id="name" name="name" defaultValue={restaurant.name} required />
                            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Identifiant URL (Slug)</Label>
                            <Input id="slug" name="slug" defaultValue={restaurant.slug} required />
                            {state?.errors?.slug && <p className="text-sm text-destructive">{state.errors.slug}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" name="phone" defaultValue={restaurant.phone} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={restaurant.description} />
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
