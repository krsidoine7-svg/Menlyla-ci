import { createClient } from '@/lib/supabase/server'
import { getRestaurantReviews } from '@/components/modules/restaurant/review-actions'
import { ReviewModeration } from '@/components/modules/restaurant/components/review-moderation'

export default async function ReviewsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    const reviews = restaurant ? await getRestaurantReviews(restaurant.id) : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Gestion des Avis</h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Modérez les retours de vos clients</p>
                </div>
            </div>

            <ReviewModeration initialReviews={reviews} />
        </div>
    )
}
