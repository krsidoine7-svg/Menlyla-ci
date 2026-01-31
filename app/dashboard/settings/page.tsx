import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getRestaurant } from '@/components/modules/restaurant/actions'
import { UnifiedSettings } from '@/components/modules/restaurant/components/unified-settings'

export const metadata = {
    title: 'Paramètres - Manly Dashboard',
}

export default async function SettingsPage() {
    const restaurant = await getRestaurant()

    if (!restaurant) {
        redirect('/onboarding')
    }

    return (
        <div className="container mx-auto max-w-7xl py-6 space-y-8">
            <Suspense fallback={null}>
                <UnifiedSettings restaurant={restaurant} />
            </Suspense>
        </div>
    )
}
