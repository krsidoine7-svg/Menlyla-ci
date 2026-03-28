import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CartSummary } from '@/components/modules/cart/cart-summary'
import { TableSync } from '@/components/modules/qr-code/components/table-sync'
import { Suspense } from 'react'
import { MenuBrowser } from '@/components/modules/menu/components/menu-browser'
import { SocialLinks } from '@/components/modules/restaurant/components/social-links'
import { ReviewDialog } from '@/components/modules/restaurant/components/review-dialog'
import { ReviewsList } from '@/components/modules/restaurant/components/reviews-list'
import { getRestaurantReviews } from '@/components/modules/restaurant/review-actions'
import { MobileNavbar } from '@/components/modules/restaurant/components/mobile-navbar'

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
        <div className="relative pb-10 bg-white min-h-full">
            <Suspense>
                <TableSync />
            </Suspense>
            {/* Hero / Header */}
            <header className="sticky top-0 z-[40] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm overflow-hidden">
                {restaurantData.banner_url && (
                    <div className="absolute inset-0 -z-10 opacity-20">
                        <img src={restaurantData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}

                <div className="p-4 flex items-center gap-4">
                    {restaurantData.logo_url && (
                        <img src={restaurantData.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-background" />
                    )}
                    <div className="flex-1">
                        <h1 className="text-xl font-black tracking-tight">{restaurantData.name}</h1>
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{restaurantData.description}</p>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-6 px-4 gap-4 no-scrollbar pt-2">
                    {categories?.map((cat, i) => {
                        // Simple logic to extract emoji if present at start
                        const hasEmoji = cat.name.match(/^([\p{Emoji}\p{Extended_Pictographic}])/u)
                        const emoji = hasEmoji ? hasEmoji[0] : null
                        const label = hasEmoji ? cat.name.substring(emoji!.length).trim() : cat.name

                        // Alternating rotation direction (Left/Right)
                        const hoverEffects = i % 2 === 0
                            ? "group-hover:rotate-90 group-active:rotate-90"
                            : "group-hover:-rotate-90 group-active:-rotate-90"

                        return (
                            <a key={cat.id} href={`#cat-${cat.id}`} className="flex flex-col items-center gap-2 group min-w-[72px] cursor-pointer">
                                <div className={`w-[72px] h-[72px] rounded-[1.5rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-active:scale-95 transition-all duration-300 group-hover:shadow-[0_8px_30px_-10px_rgba(234,88,12,0.2)] group-hover:border-orange-200 overflow-hidden relative ${hoverEffects}`}>
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : emoji ? (
                                        <span className="filter grayscale group-hover:grayscale-0 transition-all">{emoji}</span>
                                    ) : (
                                        <span className="text-2xl font-black text-slate-300 group-hover:text-orange-500 transition-colors uppercase">
                                            {cat.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center leading-none group-hover:text-orange-600 transition-colors max-w-[80px] truncate">
                                    {label}
                                </span>
                            </a>
                        )
                    })}
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
