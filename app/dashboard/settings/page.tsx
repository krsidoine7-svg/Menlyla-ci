import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getRestaurant, getProfile } from '@/components/modules/restaurant/actions'
import { getRestaurantReviews } from '@/components/modules/restaurant/review-actions'
import { UnifiedSettings } from '@/components/modules/restaurant/components/unified-settings'

export const metadata = {
    title: 'Paramètres - Menlyla Dashboard',
}

export default async function SettingsPage() {
    const restaurant = await getRestaurant()
    const profile = await getProfile()

    if (!restaurant) {
        redirect('/onboarding')
    }

    const reviews = await getRestaurantReviews(restaurant.id, true)

    return (
        <div className="container mx-auto max-w-7xl py-6 space-y-8">
            <Suspense fallback={null}>
                <UnifiedSettings restaurant={restaurant} initialProfile={profile} initialReviews={reviews} />
            </Suspense>
        </div>
    )
}
