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
        <div className="space-y-8">
            <header className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.5em] text-orange-500 font-black">Dashboard</p>
                <h1 className="text-3xl font-black tracking-tight">Paramètres & Identité</h1>
                <p className="text-muted-foreground">Centralisez tout ce qui définit votre restaurant : profil, réseaux, options Passeport et design.</p>
            </header>
            <SettingsForm restaurant={restaurant} />

            <DemoDataSection />
        </div>
    )
}
