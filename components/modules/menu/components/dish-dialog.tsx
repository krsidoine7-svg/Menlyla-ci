'use client'

import { useState } from 'react'
import { createDish } from '../actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

type Props = {
    categoryId: string
}

export function DishDialog({ categoryId }: Props) {
    const [open, setOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | undefined>()

    const handleSubmit = async (formData: FormData) => {
        // Append category_id
        formData.append('category_id', categoryId)
        if (imageUrl) {
            formData.append('image_url', imageUrl)
        }

        const result = await createDish(null, formData)
        if (result?.message) {
            if (result.message.includes('ajouté')) {
                toast.success(result.message)
                setOpen(false)
                setImageUrl(undefined) // Reset image
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter Plat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nouveau Plat</DialogTitle>
                    <DialogDescription>
                        Ajoutez un plat à cette catégorie.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-2">
                            <Label htmlFor="name">Nom du plat</Label>
                            <Input id="name" name="name" required />
                        </div>
                        <div className="grid items-center gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Ingrédients, allergènes..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid items-center gap-2">
                                <Label htmlFor="price">Prix Actuel (FCFA)</Label>
                                <Input id="price" name="price" type="number" min="0" required />
                            </div>
                            <div className="grid items-center gap-2">
                                <Label htmlFor="old_price">Ancien Prix (Optionnel)</Label>
                                <Input id="old_price" name="old_price" type="number" min="0" placeholder="Ex: 5000" />
                            </div>
                        </div>

                        <div className="flex gap-6 py-2">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="is_featured" name="is_featured" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <Label htmlFor="is_featured" className="text-sm font-medium leading-none cursor-pointer">✨ Spécial (Favori)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="is_promo" name="is_promo" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                                <Label htmlFor="is_promo" className="text-sm font-medium leading-none cursor-pointer">🔥 Promotion</Label>
                            </div>
                        </div>

                        <div className="grid items-center gap-2">
                            <Label>Photo du plat</Label>
                            <ImageUpload
                                defaultImage={imageUrl}
                                onImageUploaded={setImageUrl}
                                onImageRemoved={() => setImageUrl(undefined)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Ajouter au menu</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
