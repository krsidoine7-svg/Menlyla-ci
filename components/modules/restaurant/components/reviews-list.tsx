'use client'

import { Star, Reply, CheckCheck, BadgeCheck } from 'lucide-react'
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
            <div className="flex items-center justify-between px-6">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">Avis clients <span className="text-orange-500">.</span></h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ce que nos clients pensent</p>
                </div>
                <ReviewDialog restaurantId={restaurantId} />
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-6 -mx-6">
                {reviews.map((review) => {
                    return (
                        <Card
                            key={review.id}
                            className="flex-shrink-0 w-[280px] rounded-[2rem] border border-white/5 shadow-2xl shadow-black/50 bg-[#121212] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2"
                        >
                            <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-[1rem] flex items-center justify-center font-black text-sm bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border border-white/5 text-orange-500 shadow-inner">
                                            {review.customer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-black tracking-tight truncate max-w-[120px] text-white">
                                                    {review.customer_name}
                                                </span>
                                                {review.is_verified && (
                                                    <div className="bg-green-500/20 p-0.5 rounded-full ml-1">
                                                        <CheckCheck className="h-2.5 w-2.5 text-green-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                {new Date(review.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "h-3.5 w-3.5",
                                                review.rating >= star ? "text-orange-500 fill-orange-500" : "text-white/10 fill-white/10"
                                            )}
                                        />
                                    ))}
                                </div>

                                <p className="text-sm font-medium leading-relaxed text-slate-300 line-clamp-4 flex-1">
                                    "{review.comment}"
                                </p>

                                {review.dishes?.name && (
                                    <div className="pt-4 mt-auto">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/60 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                                            🍽️ {review.dishes.name}
                                        </span>
                                    </div>
                                )}

                                {review.owner_reply && (
                                    <div className="bg-orange-500/10 rounded-2xl p-4 mt-4 space-y-2 relative overflow-hidden group/reply">
                                        <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
                                            <Reply className="h-12 w-12 -rotate-12" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-500">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500/50" />
                                            Réponse du restaurant
                                        </div>
                                        <p className="text-xs font-bold text-orange-100/80 leading-relaxed relative z-10">
                                            {review.owner_reply}
                                        </p>
                                    </div>
                                )}

                                {review.platform_reply && (
                                    <div className="bg-red-500/10 rounded-2xl p-4 mt-4 space-y-2 relative overflow-hidden border border-red-500/10">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500">
                                            <BadgeCheck className="h-3 w-3" />
                                            Support Menlyla
                                        </div>
                                        <p className="text-xs font-bold text-red-100/80 leading-relaxed italic">
                                            "{review.platform_reply}"
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
