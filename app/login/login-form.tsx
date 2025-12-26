'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
    const [isPending, startTransition] = useTransition()

    const handleCreate = async (formData: FormData) => {
        startTransition(async () => {
            const result = await signup(formData)
            if (result?.error) {
                toast.error(result.error)
            }
        })
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
