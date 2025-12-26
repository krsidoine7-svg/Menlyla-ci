import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { AddToCartDrawer } from '@/components/modules/menu/components/add-to-cart-drawer'
import { CartSummary } from '@/components/modules/cart/cart-summary'
import { TableSync } from '@/components/modules/qr-code/components/table-sync'
import { LikeButton } from '@/components/modules/menu/components/like-button'
import { Suspense } from 'react'
import { Star, Flame } from 'lucide-react'

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name, description, phone')
        .eq('slug', slug)
        .single()

    if (!restaurant) notFound()

    const { data: categories } = await supabase
        .from('categories')
        .select('*, dishes(*)').eq('restaurant_id', restaurant.id).order('rank', { ascending: true })

    return (
        <div className="relative pb-24 bg-muted/5">
            <Suspense>
                <TableSync />
            </Suspense>
            {/* Hero / Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
                <div className="p-4">
                    <h1 className="text-xl font-bold">{restaurant.name}</h1>
                    <p className="text-sm text-muted-foreground line-clamp-1">{restaurant.description}</p>
                </div>
                <div className="flex overflow-x-auto pb-4 px-4 gap-2 no-scrollbar">
                    {categories?.map(cat => (
                        <a key={cat.id} href={`#cat-${cat.id}`} className="flex-shrink-0">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer rounded-full border-none bg-muted font-bold">
                                {cat.name}
                            </Badge>
                        </a>
                    ))}
                </div>
            </header>

            <main className="p-4 space-y-10">
                {categories?.map((cat) => (
                    <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1 w-8 bg-orange-500 rounded-full" />
                            <h2 className="text-xl font-black uppercase tracking-wider">{cat.name}</h2>
                        </div>
                        <div className="grid gap-6">
                            {cat.dishes?.filter((d: any) => d.is_available).map((dish: any) => (
                                <div key={dish.id} className="flex flex-col gap-0 border rounded-3xl shadow-sm bg-card overflow-hidden transition-all hover:shadow-md border-orange-100/50">
                                    {/* Image Section */}
                                    {dish.image_urls?.[0] && (
                                        <div className="relative w-full aspect-[16/9] overflow-hidden">
                                            <img
                                                src={dish.image_urls[0]}
                                                alt={dish.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                                {dish.is_featured && (
                                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 py-1 px-3 shadow-lg font-black text-[10px] uppercase">
                                                        <Star className="h-3 w-3 mr-1 fill-current" /> Spécial
                                                    </Badge>
                                                )}
                                                {dish.is_promo && (
                                                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 py-1 px-3 shadow-lg font-black text-[10px] uppercase">
                                                        <Flame className="h-3 w-3 mr-1 fill-current" /> Promo
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-1">
                                                {!dish.image_urls?.[0] && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {dish.is_featured && (
                                                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50/50 font-black text-[9px] uppercase">
                                                                Spécial
                                                            </Badge>
                                                        )}
                                                        {dish.is_promo && (
                                                            <Badge variant="outline" className="text-red-600 border-red-100 bg-red-50/50 font-black text-[9px] uppercase">
                                                                Promo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-lg leading-tight">{dish.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{dish.description}</p>
                                            </div>
                                            <LikeButton dishId={dish.id} initialLikes={dish.likes_count || 0} />
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex flex-col">
                                                {dish.is_promo && dish.old_price && (
                                                    <span className="text-xs text-muted-foreground line-through opacity-60">
                                                        {Math.round(dish.old_price).toLocaleString()} FCFA
                                                    </span>
                                                )}
                                                <span className="text-xl font-black text-orange-600 tabular-nums">
                                                    {Math.round(dish.price).toLocaleString()} <span className="text-xs font-bold opacity-70">FCFA</span>
                                                </span>
                                            </div>
                                            <AddToCartDrawer dish={dish} restaurantId={restaurant.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {(!categories || categories.length === 0) && (
                    <div className="text-center py-20 px-6">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                            <UtensilsCrossed className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Menu vide</h3>
                        <p className="text-sm text-muted-foreground">Le menu est en cours de préparation.</p>
                    </div>
                )}
            </main>

            <CartSummary />
        </div>
    )
}
import { UtensilsCrossed } from 'lucide-react'
