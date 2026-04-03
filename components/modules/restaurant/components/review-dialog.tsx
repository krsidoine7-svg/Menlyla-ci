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
                <Button variant="default" size="sm" className="text-[10px] font-black uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-400 rounded-[1rem] h-9 px-4 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                    <MessageSquarePlus className="h-3.5 w-3.5 mr-2" /> Laisser un avis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border border-white/10 shadow-2xl bg-[#0F0F0F] text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">Votre avis compte <span className="text-orange-500">!</span></DialogTitle>
                    <DialogDescription className="font-medium text-slate-400">
                        {dishName ? `Que pensez-vous du plat "${dishName}" ?` : "Dites-nous ce que vous avez pensé de votre expérience."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Note Globale</Label>
                        <div className="flex gap-1 bg-[#1A1A1A] p-2 rounded-2xl border border-white/5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-110 duration-200 p-1"
                                >
                                    <Star
                                        className={cn(
                                            "h-7 w-7 transition-colors drop-shadow-md",
                                            (hover || rating) >= star ? "text-orange-500 fill-orange-500" : "text-white/10 fill-white/10"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Votre Nom (Optionnel)</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Jean D."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 h-12 text-white placeholder:text-slate-600 focus-visible:ring-orange-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Commentaire</Label>
                        <Textarea
                            id="comment"
                            placeholder="C'était délicieux..."
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 min-h-[100px] text-white placeholder:text-slate-600 focus-visible:ring-orange-500/50"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Photos (Optionnel)</Label>

                        <div className="grid grid-cols-4 gap-3">
                            {/* Bouton Upload / Appareil Photo */}
                            <label className={cn(
                                "aspect-square flex flex-col items-center justify-center border border-dashed rounded-2xl cursor-pointer transition-all active:scale-95",
                                "border-white/20 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 text-slate-400 hover:text-orange-400",
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
