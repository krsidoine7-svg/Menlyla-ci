'use client'

import { useState } from 'react'
import { updateCategory } from '../actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Props = {
    category: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditCategoryDialog({ category, open, onOpenChange }: Props) {
    const handleSubmit = async (formData: FormData) => {
        const result = await updateCategory(category.id, null, formData)
        if (result?.message) {
            if (result.message.includes('mise à jour')) {
                toast.success(result.message)
                onOpenChange(false)
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier la catégorie</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de cette catégorie.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={category.name}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rank" className="text-right">
                                Ordre
                            </Label>
                            <Input
                                id="rank"
                                name="rank"
                                type="number"
                                defaultValue={category.rank}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
