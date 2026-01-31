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
import { WaiterFAB } from '@/components/modules/restaurant/components/waiter-fab'
import { CartSummary } from '@/components/modules/cart/cart-summary'

export default async function RestaurantLayout({
    children,
    params,
}: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // Verify restaurant exists
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id, slug')
        .eq('slug', slug)
        .single()

    if (error || !restaurant) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 md:flex md:justify-center relative overflow-x-hidden">
            {/* WOW Effects: Animated Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[100px] animate-mesh" />
                <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-100/20 rounded-full blur-[80px] animate-mesh [animation-delay:2s]" />
                <div className="absolute top-[40%] right-[10%] w-[25%] h-[25%] bg-pink-100/20 rounded-full blur-[60px] animate-mesh [animation-delay:4s]" />
            </div>

            <LiveOrderStatus />
            <CartSummary />
            <MobileNavbar restaurantSlug={restaurant.slug} />
            <WaiterFAB restaurantId={restaurant.id} />

            <div className="w-full md:max-w-[500px] min-h-screen bg-background/80 backdrop-blur-sm md:shadow-2xl relative z-10">
                {children}
            </div>
        </div>
    )
}
