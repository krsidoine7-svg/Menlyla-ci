'use client'

import { useActionState } from 'react'
import { createTable } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function CreateTableForm() {
    const [state, formAction, isPending] = useActionState(createTable, null)

    useEffect(() => {
        if (state?.message) {
            if (state.message.includes('créée')) {
                toast.success(state.message)
            } else {
                toast.error(state.message)
            }
        }
    }, [state])

    return (
        <Card className="p-4">
            <form action={formAction} className="flex gap-4 items-end">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Nom de la table</label>
                    <Input name="name" type="text" required placeholder="Ex: 10 ou Terrasse 1" className="w-40" />
                </div>
                <Button type="submit" disabled={isPending}>
                    <Plus className="mr-2 h-4 w-4" /> {isPending ? 'Ajout...' : 'Ajouter Table'}
                </Button>
            </form>
        </Card>
    )
}
