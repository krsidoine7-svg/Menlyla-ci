import { redirect } from 'next/navigation'
import { getRestaurant } from '@/components/modules/restaurant/actions'
import { SettingsForm } from '@/components/modules/restaurant/components/settings-form'
import { DemoDataSection } from '@/components/modules/settings/components/demo-data-section'

export default async function SettingsPage() {
    const restaurant = await getRestaurant()

    if (!restaurant) {
        // Should not happen if middleware works, but specific restaurant check:
        redirect('/onboarding')
    }

    return (
        <div className="grid gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Paramètres</h1>
            </div>
            <SettingsForm restaurant={restaurant} />

            <DemoDataSection />
        </div>
    )
}
