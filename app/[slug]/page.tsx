import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CartSummary } from '@/components/modules/cart/cart-summary'
import { TableSync } from '@/components/modules/qr-code/components/table-sync'
import { Suspense } from 'react'
import { MenuBrowser } from '@/components/modules/menu/components/menu-browser'
import { CategoryNav } from '@/components/modules/menu/components/category-nav'
import { RestaurantInfoDrawer } from '@/components/modules/menu/components/restaurant-info-drawer'
import { MapPin, ChevronDown, ShoppingBag } from 'lucide-react'
import { SocialLinks } from '@/components/modules/restaurant/components/social-links'
import { ReviewDialog } from '@/components/modules/restaurant/components/review-dialog'
import { ReviewsList } from '@/components/modules/restaurant/components/reviews-list'
import { getRestaurantReviews } from '@/components/modules/restaurant/review-actions'
import { MobileNavbar } from '@/components/modules/restaurant/components/mobile-navbar'
import { cn } from '@/lib/utils'

import { WaiterFAB } from '@/components/modules/restaurant/components/waiter-fab'

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name, description, phone, currency, banner_url, logo_url, slug, social_links, address, email, settings')
        .eq('slug', slug)
        .single()

    // If the column 'settings' doesn't exist, Supabase returns an error and null data.
    // Let's try again without 'settings' if it failed.
    let finalRestaurant = restaurant
    if (restaurantError || !restaurant) {
        const { data: fallbackRestaurant } = await supabase
            .from('restaurants')
            .select('id, name, description, phone, currency, banner_url, logo_url, slug, social_links, address, email')
            .eq('slug', slug)
            .single()

        if (!fallbackRestaurant) notFound()
        finalRestaurant = { ...fallbackRestaurant, settings: {} }
    }

    const restaurantData = finalRestaurant as any

    const { data: categories } = await supabase
        .from('categories')
        .select('*, dishes(*)').eq('restaurant_id', restaurantData.id).order('rank', { ascending: true }).order('rank', { foreignTable: 'dishes', ascending: true })

    const reviews = await getRestaurantReviews(restaurantData.id)

    // Fetch owner passport if restaurant has owner_id
    let ownerPassport = null
    if (restaurantData.owner_id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, bio, phone, email, profile_image, social_links, custom_links')
            .eq('id', restaurantData.owner_id)
            .single()

        ownerPassport = profile
    }

    return (
        <div className="relative pb-10 bg-[#080808] min-h-full overflow-x-hidden">
            <Suspense>
                <TableSync />
            </Suspense>
            {/* Hero / Header */}
            <header className="sticky top-0 z-[40] bg-[#080808]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl overflow-hidden">
                {restaurantData.banner_url && (
                    <div className="absolute inset-0 -z-10 opacity-20">
                        <img src={restaurantData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent" />
                    </div>
                )}

                <div className="p-6 pb-2 flex flex-col relative">
                    <div className="flex items-center justify-between mb-8">
                        <RestaurantInfoDrawer restaurant={restaurantData} />
                    </div>

                    {/* Categories Navigation */}
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Catégories</h3>
                    </div>
                    <CategoryNav categories={categories || []} />
                </div>

            </header>

            <div className="p-4">
                <MenuBrowser categories={categories || []} restaurant={restaurantData} ownerPassport={ownerPassport} />
            </div>

            <div className="p-1 pt-0">
                <ReviewsList
                    reviews={reviews || []}
                    restaurantId={restaurantData.id}
                />
            </div>

            <SocialLinks socialLinks={restaurantData.social_links} restaurantName={restaurantData.name} />
        </div >
    )
}
