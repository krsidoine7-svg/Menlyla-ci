'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
    const [isPending, startTransition] = useTransition()

    const handleCreate = async (formData: FormData) => {
        startTransition(async () => {
            const result = await signup(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Compte créé ! Vérifiez vos emails.")
            }
        })
    }

    return (
        <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email Professionnel</Label>
                <Input id="email" name="email" type="email" required placeholder="contact@restaurant.com" disabled={isPending} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required disabled={isPending} minLength={6} />
            </div>
            <div className="pt-2">
                <Button formAction={handleCreate} className="w-full bg-orange-600 hover:bg-orange-700" disabled={isPending}>
                    {isPending ? 'Création...' : 'Créer mon restaurant'}
                </Button>
            </div>
        </form>
    )
}
