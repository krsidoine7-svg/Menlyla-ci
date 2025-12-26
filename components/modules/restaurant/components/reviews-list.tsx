'use client'

import { Star, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Props = {
    reviews: any[]
}

export function ReviewsList({ reviews }: Props) {
    if (!reviews || reviews.length === 0) return null

    return (
        <section className="space-y-6 mt-12 pb-10">
            <div className="flex items-center gap-3 px-1">
                <div className="h-1 w-8 bg-orange-500 rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-wider">Avis de nos clients</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                {reviews.map((review) => (
                    <Card key={review.id} className="flex-shrink-0 w-[280px] rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-tighter truncate max-w-[120px]">
                                            {review.customer_name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-bold">
                                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "h-3 w-3",
                                                review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted/20"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm font-medium leading-relaxed italic text-slate-600 line-clamp-3">
                                "{review.comment}"
                            </p>

                            {review.dishes?.name && (
                                <div className="pt-2 border-t border-muted">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                                        Plat : {review.dishes.name}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
