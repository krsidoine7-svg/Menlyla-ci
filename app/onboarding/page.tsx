import { OnboardingForm } from '@/components/modules/restaurant/components/restaurant-form'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const urlPlan = params.plan as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    let initialRestaurant = null
    if (user) {
        const { data } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle()
        initialRestaurant = data

        // Force redirect to payment if URL says pro OR DB says pro/pending
        if (urlPlan === 'pro' || (data?.plan === 'pro' && data?.subscription_status === 'pending')) {
            // Only redirect if not already paid (checked via data status)
            if (data?.subscription_status !== 'active') {
                redirect('/onboarding/pay?plan=pro')
            }
        }
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4">
            <Suspense fallback={<div>Chargement...</div>}>
                <OnboardingForm initialRestaurant={initialRestaurant} />
            </Suspense>
        </div>
    )
}
