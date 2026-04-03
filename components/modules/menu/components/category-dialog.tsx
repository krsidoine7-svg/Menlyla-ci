'use client'

import { useState } from 'react'
import { createCategory } from '../actions'
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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

export function CategoryDialog() {
    const [open, setOpen] = useState(false)
    const [iconUrl, setIconUrl] = useState<string | undefined>()

    const handleSubmit = async (formData: FormData) => {
        if (iconUrl) {
            formData.append('icon_url', iconUrl)
        }
        const result = await createCategory(null, formData)
        if (result?.message) {
            if (result.message.includes('ajoutée') || result.message.includes('succès')) {
                toast.success(result.message)
                setOpen(false)
                setIconUrl(undefined)
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter Catégorie
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle Catégorie</DialogTitle>
                    <DialogDescription>
                        Créez une section pour votre menu (ex: Entrées, Boissons) avec une image d'illustration.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rank" className="text-right">
                                Ordre
                            </Label>
                            <Input id="rank" name="rank" type="number" defaultValue="0" className="col-span-3" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Icône / Image (Optionnel)</Label>
                            <ImageUpload
                                defaultImage={iconUrl}
                                onImageUploaded={setIconUrl}
                                onImageRemoved={() => setIconUrl(undefined)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Créer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
