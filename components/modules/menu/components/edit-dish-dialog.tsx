'use client'

import { useState } from 'react'
import { updateDish } from '../actions'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

type Props = {
    dish: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditDishDialog({ dish, open, onOpenChange }: Props) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(dish.image_urls?.[0])

    const handleSubmit = async (formData: FormData) => {
        // Append image_url if present
        if (imageUrl) {
            formData.append('image_url', imageUrl)
        }
        // Always include category because schema requires it, though we don't change it here yet (could add selector)
        formData.append('category_id', dish.category_id)

        const result = await updateDish(dish.id, null, formData)
        if (result?.message) {
            if (result.message.includes('mis à jour')) {
                toast.success(result.message)
                onOpenChange(false)
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Modifier le plat</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de ce plat.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-2">
                            <Label htmlFor="name">Nom du plat</Label>
                            <Input id="name" name="name" defaultValue={dish.name} required />
                        </div>
                        <div className="grid items-center gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={dish.description}
                                placeholder="Ingrédients, allergènes..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid items-center gap-2">
                                <Label htmlFor="price">Prix Actuel (FCFA)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    defaultValue={dish.price}
                                    required
                                />
                            </div>
                            <div className="grid items-center gap-2">
                                <Label htmlFor="old_price">Ancien Prix (Optionnel)</Label>
                                <Input
                                    id="old_price"
                                    name="old_price"
                                    type="number"
                                    min="0"
                                    defaultValue={dish.old_price || ''}
                                />
                            </div>
                        </div>

                        <div className="flex gap-6 py-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    name="is_featured"
                                    defaultChecked={dish.is_featured}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="is_featured" className="text-sm font-medium leading-none cursor-pointer">✨ Spécial (Favori)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_promo"
                                    name="is_promo"
                                    defaultChecked={dish.is_promo}
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
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
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
