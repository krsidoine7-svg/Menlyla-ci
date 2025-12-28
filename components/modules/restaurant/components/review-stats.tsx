'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, TrendingUp, MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    reviews: any[]
}

export function ReviewStats({ reviews }: Props) {
    if (reviews.length === 0) return null

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews

    // Calculate star distribution
    const distribution = [0, 0, 0, 0, 0] // for 1, 2, 3, 4, 5 stars
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating - 1]++
        }
    })

    return (
        <div className="grid gap-6 md:grid-cols-4 mb-8">
            {/* Main Score */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-orange-600 text-white overflow-hidden relative group">
                <CardContent className="p-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Moyenne Générale</span>
                        <div className="flex items-end gap-2">
                            <span className="text-6xl font-black leading-none">{averageRating.toFixed(1)}</span>
                            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400 mb-1" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">Basé sur {totalReviews} avis</p>
                    </div>
                </CardContent>
                {/* Visual Glow */}
                <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </Card>

            {/* Distribution Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card md:col-span-2 overflow-hidden">
                <CardContent className="p-8 space-y-3">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-4">Répartition des notes</span>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = distribution[star - 1]
                        const percentage = (count / totalReviews) * 100
                        return (
                            <div key={star} className="flex items-center gap-4 group">
                                <span className="text-[10px] font-black w-4">{star}</span>
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-600 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{count}</span>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Engagement Card */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden">
                <CardContent className="p-8 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Satisfaction</span>
                            <p className="text-2xl font-black">
                                {((distribution[3] + distribution[4]) / totalReviews * 100).toFixed(0)}% de Positifs
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Score Vitalité</span>
                        <div className="flex gap-1">
                            <div className="h-1 w-4 bg-orange-600 rounded-full" />
                            <div className="h-1 w-2 bg-muted rounded-full" />
                            <div className="h-1 w-1 bg-muted rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
