'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'


type Props = {
    defaultImage?: string
    onImageUploaded: (url: string) => void
    onImageRemoved: () => void
    label?: string
    id?: string
}

export function ImageUpload({ defaultImage, onImageUploaded, onImageRemoved, label, id = 'image-upload' }: Props) {
    const [image, setImage] = useState<string | undefined>(defaultImage)
    const [uploading, setUploading] = useState(false)

    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            // 1. Upload to Supabase
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // 2. Get Public URL
            const { data } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath)

            setImage(data.publicUrl)
            onImageUploaded(data.publicUrl)
            toast.success("Image téléchargée !")

        } catch (error: any) {
            console.error(error)
            toast.error("Erreur lors du téléchargement")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setImage(undefined)
        onImageRemoved()
    }

    return (
        <div className="grid gap-2">
            {label && <Label>{label}</Label>}

            {image ? (
                <div className="relative aspect-video w-full max-w-[200px] overflow-hidden rounded-md border">
                    <img
                        src={image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={handleRemove}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById(id)?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {uploading ? 'Téléchargement...' : 'Choisir une image'}
                    </Button>
                    <input
                        id={id}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            )}
        </div>
    )
}
