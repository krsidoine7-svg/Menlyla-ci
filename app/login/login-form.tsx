'use client'

import { Suspense, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginFormContent() {
    const [isPending, startTransition] = useTransition()

    const searchParams = useSearchParams()
    const plan = searchParams.get('plan')

    const handleCreate = async (formData: FormData) => {
        // ... handled by signup link below but keeping for consistency if needed
    }

    const handleLogin = async (formData: FormData) => {
        startTransition(async () => {
            const result = await login(formData)
            if (result?.error) {
                toast.error(result.error)
            }
        })
    }

    return (
        <form className="space-y-4">
            <input type="hidden" name="plan" value={plan || ''} />
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="manager@resto.ci" disabled={isPending} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required disabled={isPending} />
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <Button formAction={handleLogin} disabled={isPending} className="w-full">
                    {isPending ? 'Connexion...' : 'Se connecter'}
                </Button>
            </div>
        </form>
    )
}

function LoginFormWrapper() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <LoginFormContent />
        </Suspense>
    )
}

export { LoginFormWrapper as LoginForm }
