'use client'

import { useState } from 'react'
import { Star, MessageSquarePlus, Loader2 } from 'lucide-react'
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
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        const result = await submitReview({
            restaurant_id: restaurantId,
            dish_id: dishId,
            rating,
            comment,
            customer_name: name || 'Client Anonyme'
        })

        if (result.success) {
            toast.success(result.message)
            setOpen(false)
            // Reset form
            setRating(5)
            setComment('')
            setName('')
        } else {
            toast.error(result.message)
        }
        setIsPending(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full h-8 px-3">
                    <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" /> Laisser un avis
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
