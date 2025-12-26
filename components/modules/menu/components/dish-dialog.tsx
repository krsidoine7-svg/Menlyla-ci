'use client'

import { useState, useEffect } from 'react'
import { createDish, getPossibleUpsells } from '../actions'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

type Props = {
    categoryId: string
    restaurantId?: string
}

export function DishDialog({ categoryId, restaurantId }: Props) {
    const [open, setOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | undefined>()
    const [possibleUpsells, setPossibleUpsells] = useState<any[]>([])
    const [selectedUpsells, setSelectedUpsells] = useState<string[]>([])

    useEffect(() => {
        if (open && restaurantId) {
            getPossibleUpsells(restaurantId).then(setPossibleUpsells)
        }
    }, [open, restaurantId])

    const toggleUpsell = (id: string) => {
        setSelectedUpsells(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (formData: FormData) => {
        formData.append('category_id', categoryId)
        if (imageUrl) formData.append('image_url', imageUrl)
        formData.append('upsell_ids', JSON.stringify(selectedUpsells))

        const result = await createDish(null, formData)
        if (result?.message) {
            if (result.message.includes('ajouté')) {
                toast.success(result.message)
                setOpen(false)
                setImageUrl(undefined)
                setSelectedUpsells([])
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nouveau Plat</DialogTitle>
                    <DialogDescription>
                        Ajoutez un plat à cette catégorie et configurez les suggestions.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pr-2">
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="grid items-center gap-2">
                                <Label htmlFor="new-name">Nom du plat</Label>
                                <Input id="new-name" name="name" required />
                            </div>
                            <div className="grid items-center gap-2">
                                <Label htmlFor="new-description">Description</Label>
                                <Textarea id="new-description" name="description" placeholder="Ingrédients, allergènes..." rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid items-center gap-2">
                                    <Label htmlFor="new-price">Prix Actuel (FCFA)</Label>
                                    <Input id="new-price" name="price" type="number" min="0" required />
                                </div>
                                <div className="grid items-center gap-2">
                                    <Label htmlFor="new-old-price">Ancien Prix (Optionnel)</Label>
                                    <Input id="new-old-price" name="old_price" type="number" min="0" placeholder="Ex: 5000" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
                            <DietaryToggle id="new-featured" name="is_featured" label="✨ Spécial" />
                            <DietaryToggle id="new-promo" name="is_promo" label="🔥 Promo" />
                            <DietaryToggle id="new-vege" name="is_vegetarian" label="🥬 Végé" />
                            <DietaryToggle id="new-spicy" name="is_spicy" label="🌶️ Pimenté" />
                            <DietaryToggle id="new-gf" name="is_gluten_free" label="🌾 Sans Gluten" />
                        </div>

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
                                                        id={`new-upsell-${u.id}`}
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
                        <Button type="submit" className="w-full sm:w-auto">Ajouter au menu</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function DietaryToggle({ id, name, label }: any) {
    return (
        <div className="flex items-center space-x-2">
            <input type="checkbox" id={id} name={name} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        </div>
    )
}
