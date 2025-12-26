'use client'

import { useState, useEffect } from 'react'
import { updateDish, getPossibleUpsells } from '../actions'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

type Props = {
    dish: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditDishDialog({ dish, open, onOpenChange }: Props) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(dish.image_urls?.[0])
    const [possibleUpsells, setPossibleUpsells] = useState<any[]>([])
    const [selectedUpsells, setSelectedUpsells] = useState<string[]>(dish.upsell_ids || [])

    useEffect(() => {
        if (open) {
            getPossibleUpsells(dish.restaurant_id, dish.id).then(setPossibleUpsells)
            setSelectedUpsells(dish.upsell_ids || [])
        }
    }, [open, dish])

    const toggleUpsell = (id: string) => {
        setSelectedUpsells(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (formData: FormData) => {
        if (imageUrl) formData.append('image_url', imageUrl)
        formData.append('category_id', dish.category_id)
        formData.append('upsell_ids', JSON.stringify(selectedUpsells))

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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Modifier le plat</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations de ce plat et gérez les suggestions de vente.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pr-2">
                    <div className="grid gap-6 py-4">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <div className="grid items-center gap-2">
                                <Label htmlFor="edit-name">Nom du plat</Label>
                                <Input id="edit-name" name="name" defaultValue={dish.name} required />
                            </div>
                            <div className="grid items-center gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea id="edit-description" name="description" defaultValue={dish.description} rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid items-center gap-2">
                                    <Label htmlFor="edit-price">Prix Actuel (FCFA)</Label>
                                    <Input id="edit-price" name="price" type="number" min="0" defaultValue={dish.price} required />
                                </div>
                                <div className="grid items-center gap-2">
                                    <Label htmlFor="edit-old-price">Ancien Prix</Label>
                                    <Input id="edit-old-price" name="old_price" type="number" min="0" defaultValue={dish.old_price || ''} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Dietary Flags */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
                            <DietaryToggle id="edit-featured" name="is_featured" label="✨ Spécial" defaultChecked={dish.is_featured} />
                            <DietaryToggle id="edit-promo" name="is_promo" label="🔥 Promo" defaultChecked={dish.is_promo} />
                            <DietaryToggle id="edit-vege" name="is_vegetarian" label="🥬 Végé" defaultChecked={dish.is_vegetarian} />
                            <DietaryToggle id="edit-spicy" name="is_spicy" label="🌶️ Pimenté" defaultChecked={dish.is_spicy} />
                            <DietaryToggle id="edit-gf" name="is_gluten_free" label="🌾 Sans Gluten" defaultChecked={dish.is_gluten_free} />
                        </div>

                        {/* Section 3: Upsells (Recommendations) */}
                        {possibleUpsells.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-orange-600 font-bold uppercase text-[10px] tracking-widest">
                                    S'accompagne bien avec (Suggestions)
                                </Label>
                                <div className="grid grid-cols-1 gap-2 border rounded-xl p-3">
                                    <ScrollArea className="h-32">
                                        <div className="grid gap-2">
                                            {possibleUpsells.map(u => (
                                                <div key={u.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                                    <Checkbox
                                                        id={`upsell-${u.id}`}
                                                        checked={selectedUpsells.includes(u.id)}
                                                        onCheckedChange={() => toggleUpsell(u.id)}
                                                    />
                                                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleUpsell(u.id)}>
                                                        {u.image_urls?.[0] && (
                                                            <img src={u.image_urls[0]} alt="" className="h-8 w-8 rounded object-cover" />
                                                        )}
                                                        <div className="flex-1 text-sm font-medium leading-none">{u.name}</div>
                                                        <div className="text-xs text-muted-foreground">{u.price} FCFA</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        <div className="grid items-center gap-2">
                            <Label>Photo du plat</Label>
                            <ImageUpload defaultImage={imageUrl} onImageUploaded={setImageUrl} onImageRemoved={() => setImageUrl(undefined)} />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" className="w-full sm:w-auto">Enregistrer les modifications</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function DietaryToggle({ id, name, label, defaultChecked }: any) {
    return (
        <div className="flex items-center space-x-2">
            <input type="checkbox" id={id} name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        </div>
    )
}
