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
        .select('*, dishes(*)').eq('restaurant_id', restaurantData.id).order('rank', { ascending: true })

    const reviews = await getRestaurantReviews(restaurantData.id)

    return (
        <div className="relative pb-24 bg-muted/5">
            <Suspense>
                <TableSync />
            </Suspense>
            {/* Hero / Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm overflow-hidden">
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

                <div className="flex overflow-x-auto pb-4 px-4 gap-2 no-scrollbar">
                    {categories?.map(cat => (
                        <a key={cat.id} href={`#cat-${cat.id}`} className="flex-shrink-0">
                            <Badge variant="secondary" className="px-5 py-2 text-sm whitespace-nowrap hover:bg-orange-600 hover:text-white transition-all cursor-pointer rounded-full border-none bg-slate-100 text-slate-900 font-black shadow-sm">
                                {cat.name}
                            </Badge>
                        </a>
                    ))}
                </div>
            </header>

            <div className="p-4">
                <MenuBrowser categories={categories || []} restaurant={restaurantData} />
            </div>

            <div className="p-4 pt-0">
                <ReviewsList reviews={reviews || []} />
                <div className="flex justify-center mt-4">
                    <ReviewDialog restaurantId={restaurantData.id} />
                </div>
            </div>

            <SocialLinks socialLinks={restaurantData.social_links} restaurantName={restaurantData.name} />
            <CartSummary />
            <MobileNavbar restaurantSlug={restaurantData.slug} />
        </div>
    )
}
