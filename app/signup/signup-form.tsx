'use client'

import { Suspense, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignupFormContent() {
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan')

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
            <input type="hidden" name="plan" value={plan || ''} />
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

export function SignupForm() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <SignupFormContent />
        </Suspense>
    )
}
