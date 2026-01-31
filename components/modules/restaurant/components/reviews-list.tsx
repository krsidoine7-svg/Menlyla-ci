'use client'

import { Star, Reply, CheckCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReviewDialog } from './review-dialog'

type Props = {
    reviews: any[]
    restaurantId: string
}

export function ReviewsList({ reviews, restaurantId }: Props) {
    if (!reviews) return null

    return (
        <section className="space-y-6 mt-12 pb-10">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-orange-600 rounded-full" />
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">Avis clients</h2>
                </div>
                <ReviewDialog restaurantId={restaurantId} />
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
                {reviews.map((review) => {
                    // Generate a simple color based on name for the avatar
                    const colors = ['bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600'];
                    const colorIndex = review.customer_name.charCodeAt(0) % colors.length;
                    const avatarColor = colors[colorIndex];

                    return (
                        <Card
                            key={review.id}
                            className="flex-shrink-0 w-[280px] rounded-[2.5rem] border border-white/40 shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        >
                            <CardContent className="p-6 space-y-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm", avatarColor)}>
                                            {review.customer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[100px] text-slate-900">
                                                    {review.customer_name}
                                                </span>
                                                {review.is_verified && (
                                                    <div className="bg-green-100 p-0.5 rounded-full">
                                                        <CheckCheck className="h-2.5 w-2.5 text-green-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                {new Date(review.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-2.5 w-2.5",
                                                    review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm font-bold leading-relaxed italic text-slate-600 line-clamp-4">
                                    "{review.comment}"
                                </p>

                                {review.dishes?.name && (
                                    <div className="pt-3 border-t border-slate-100/50">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                            PLAT : {review.dishes.name}
                                        </span>
                                    </div>
                                )}

                                {review.owner_reply && (
                                    <div className="bg-slate-900/5 backdrop-blur-md rounded-[1.5rem] p-4 mt-2 space-y-1.5 border border-white/20 relative overflow-hidden group/reply">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Reply className="h-8 w-8 -rotate-12" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-900">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            Réponse du resto
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700 leading-snug relative z-10">
                                            {review.owner_reply}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    )
}
