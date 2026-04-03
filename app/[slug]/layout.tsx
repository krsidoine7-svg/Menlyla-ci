import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ slug: string }>
    children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, description')
        .eq('slug', slug)
        .single()

    if (!restaurant) {
        return {
            title: 'Restaurant Introuvable'
        }
    }

    return {
        title: `${restaurant.name} | Menu Digital`,
        description: restaurant.description || `Découvrez le menu de ${restaurant.name}`,
    }
}

import { LiveOrderStatus } from '@/components/modules/orders/components/live-order-status'
import { MobileNavbar } from '@/components/modules/restaurant/components/mobile-navbar'
import { CartSummary } from '@/components/modules/cart/cart-summary'
import { ThemeInjector } from '@/components/modules/restaurant/components/theme-injector'

export default async function RestaurantLayout({
    children,
    params,
}: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // Verify restaurant exists
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, slug, settings')
        .eq('slug', slug)
        .single()

    if (error || !restaurant) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-orange-500/30 overflow-x-hidden relative flex items-center justify-center py-0 md:py-10">
            <ThemeInjector theme={{
                primaryColor: restaurant.settings?.primary_color,
                secondaryColor: restaurant.settings?.secondary_color,
                useGradient: restaurant.settings?.use_gradient
            }} />
            {/* Dark Mode Background Accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[120px] animate-float-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-slate-800/10 blur-[120px] animate-float-medium" />
            </div>

            {/* Main Application Container - Mobile Simulator on Desktop (Clean View) */}
            <div className="w-full min-h-screen md:min-h-0 md:h-[932px] md:max-h-[95vh] md:w-[430px] bg-[#080808] relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden md:rounded-[40px] md:[transform:translate3d(0,0,0)] md:ring-1 md:ring-white/10">

                <main className="flex-1 relative z-0 md:overflow-y-auto no-scrollbar scroll-smooth">
                    {children}

                    {/* Add padding at bottom for navbar */}
                    <div className="h-28" />
                </main>

                <LiveOrderStatus />
                <CartSummary />
                <MobileNavbar restaurantSlug={restaurant.slug} />
            </div>
        </div>
    )
}
