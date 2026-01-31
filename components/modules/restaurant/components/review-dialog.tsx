'use client'

import { useState } from 'react'
import { Star, MessageSquarePlus, Loader2, X, Camera, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitReview } from '../review-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
    restaurantId: string
    dishId?: string
    dishName?: string
}

export function ReviewDialog({ restaurantId, dishId, dishName }: Props) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(5)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState('')
    const [name, setName] = useState('')
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [isPending, setIsPending] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const supabase = createClient()
        const newUrls = [...imageUrls]

        for (const file of Array.from(files)) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${restaurantId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('review-photos')
                .upload(filePath, file)

            if (uploadError) {
                toast.error("Erreur lors de l'upload d'une image")
                continue
            }

            const { data: { publicUrl } } = supabase.storage
                .from('review-photos')
                .getPublicUrl(filePath)

            newUrls.push(publicUrl)
        }

        setImageUrls(newUrls)
        setIsUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        const result = await submitReview({
            restaurant_id: restaurantId,
            dish_id: dishId,
            rating,
            comment,
            customer_name: name || 'Client Anonyme',
            image_urls: imageUrls
        })

        if (result.success) {
            toast.success("Avis envoyé ! Il sera visible après modération.")
            setOpen(false)
            // Reset form
            setRating(5)
            setComment('')
            setName('')
            setImageUrls([])
        } else {
            toast.error(result.message)
        }
        setIsPending(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs font-black uppercase tracking-widest text-orange-600 border-orange-100 hover:bg-orange-50 rounded-full h-9 px-4 shadow-sm active:scale-95 transition-all">
                    <MessageSquarePlus className="h-4 w-4 mr-2" /> Laisser un avis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Votre avis compte !</DialogTitle>
                    <DialogDescription className="font-medium">
                        {dishName ? `Que pensez-vous du plat "${dishName}" ?` : "Dites-nous ce que vous avez pensé de votre expérience."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Note</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-125 duration-200"
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            (hover || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted/30"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Votre Nom (Optionnel)</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Jean D."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Commentaire</Label>
                        <Textarea
                            id="comment"
                            placeholder="C'était délicieux..."
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-2xl border-muted bg-muted/20 focus:bg-background min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Photos de votre expérience</Label>

                        <div className="grid grid-cols-4 gap-3">
                            {/* Bouton Upload / Appareil Photo */}
                            <label className={cn(
                                "aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-95",
                                "border-orange-100 bg-orange-50/30 text-orange-600 hover:border-orange-300 hover:bg-orange-50",
                                isUploading && "opacity-50 pointer-events-none"
                            )}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="h-6 w-6 mb-1" />
                                        <span className="text-[10px] font-black uppercase">Ajouter</span>
                                    </>
                                )}
                            </label>

                            {/* Prévisualisations */}
                            {imageUrls.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-muted">
                                    <img src={url} className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                        Envoyer l'avis
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
