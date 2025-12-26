'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, User, Clock, Utensils } from 'lucide-react'
import { deleteReview } from '../review-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
    initialReviews: any[]
}

export function ReviewModeration({ initialReviews }: Props) {
    const [reviews, setReviews] = useState(initialReviews)

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return

        try {
            await deleteReview(id)
            setReviews(reviews.filter(r => r.id !== id))
            toast.success("Avis supprimé")
        } catch (error: any) {
            toast.error("Erreur lors de la suppression")
        }
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-[3rem] bg-muted/20 opacity-60">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-bold">Aucun avis pour le moment.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
                <Card key={review.id} className="rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden group">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase tracking-tight truncate max-w-[120px]">
                                        {review.customer_name}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                        <Clock className="h-3 w-3" />
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-destructive hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(review.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "h-4 w-4",
                                        review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted/20"
                                    )}
                                />
                            ))}
                        </div>

                        <p className="text-sm font-medium leading-relaxed italic text-slate-700">
                            "{review.comment}"
                        </p>

                        {review.dishes?.name && (
                            <div className="flex items-center gap-2 pt-3 border-t">
                                <Utensils className="h-3 w-3 text-orange-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                                    Plat : {review.dishes.name}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
