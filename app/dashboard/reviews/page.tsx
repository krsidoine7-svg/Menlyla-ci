import { createClient } from '@/lib/supabase/server'
import { getRestaurantReviews } from '@/components/modules/restaurant/review-actions'
import { ReviewModeration } from '@/components/modules/restaurant/components/review-moderation'
import { ReviewStats } from '@/components/modules/restaurant/components/review-stats'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'

export default async function ReviewsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    if (!restaurant) return <NoRestaurantState />

    const reviews = await getRestaurantReviews(restaurant.id, true)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Gestion des Avis</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 space-x-2 flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                        <span>Analysez & Modérez les retours clients</span>
                    </p>
                </div>
            </div>

            <ReviewStats reviews={reviews} />
            <ReviewModeration initialReviews={reviews} />
        </div>
    )
}
