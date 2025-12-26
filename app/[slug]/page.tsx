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

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name, description, phone, currency, banner_url, logo_url, slug, social_links')
        .eq('slug', slug)
        .single()

    if (!restaurant) notFound()

    const { data: categories } = await supabase
        .from('categories')
        .select('*, dishes(*)').eq('restaurant_id', restaurant.id).order('rank', { ascending: true })

    const reviews = await getRestaurantReviews(restaurant.id)

    return (
        <div className="relative pb-24 bg-muted/5">
            <Suspense>
                <TableSync />
            </Suspense>
            {/* Hero / Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm overflow-hidden">
                {restaurant.banner_url && (
                    <div className="absolute inset-0 -z-10 opacity-20">
                        <img src={restaurant.banner_url} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}

                <div className="p-4 flex items-center gap-4">
                    {restaurant.logo_url && (
                        <img src={restaurant.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-background" />
                    )}
                    <div className="flex-1">
                        <h1 className="text-xl font-black tracking-tight">{restaurant.name}</h1>
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{restaurant.description}</p>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-4 px-4 gap-2 no-scrollbar">
                    {categories?.map(cat => (
                        <a key={cat.id} href={`#cat-${cat.id}`} className="flex-shrink-0">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer rounded-full border-none bg-muted/80 backdrop-blur-sm font-bold">
                                {cat.name}
                            </Badge>
                        </a>
                    ))}
                </div>
            </header>

            <div className="p-4">
                <MenuBrowser categories={categories || []} restaurant={restaurant} />
            </div>

            <div className="p-4 pt-0">
                <ReviewsList reviews={reviews || []} />
                <div className="flex justify-center mt-4">
                    <ReviewDialog restaurantId={restaurant.id} />
                </div>
            </div>

            <SocialLinks socialLinks={restaurant.social_links} restaurantName={restaurant.name} />
            <CartSummary />
            <MobileNavbar restaurantSlug={restaurant.slug} />
        </div>
    )
}
