import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { AddToCartDrawer } from '@/components/modules/menu/components/add-to-cart-drawer'
import { CartSummary } from '@/components/modules/cart/cart-summary'

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
        <div className="relative pb-24">
            {/* Hero / Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
                <div className="p-4">
                    <h1 className="text-xl font-bold">{restaurant.name}</h1>
                    <p className="text-sm text-muted-foreground line-clamp-1">{restaurant.description}</p>
                </div>
                <div className="flex overflow-x-auto pb-2 px-4 gap-2 no-scrollbar">
                    {categories?.map(cat => (
                        <a key={cat.id} href={`#cat-${cat.id}`} className="flex-shrink-0">
                            <Badge variant="secondary" className="px-3 py-1 text-sm whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                                {cat.name}
                            </Badge>
                        </a>
                    ))}
                </div>
            </header>

            <main className="p-4 space-y-8">
                {categories?.map((cat) => (
                    <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
                        <h2 className="text-lg font-bold mb-4">{cat.name}</h2>
                        <div className="grid gap-4">
                            {cat.dishes?.map((dish: any) => (
                                <div key={dish.id} className="flex gap-4 p-3 border rounded-lg shadow-sm bg-card">
                                    <div className="flex-1 space-y-1">
                                        <div className="font-semibold">{dish.name}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-2">{dish.description}</div>
                                        <div className="font-bold text-primary mt-2">{dish.price} FCFA</div>
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <AddToCartDrawer dish={dish} restaurantId={restaurant.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {(!categories || categories.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">
                        Le menu est en cours de préparation.
                    </div>
                )}
            </main>

            <CartSummary />
        </div>
    )
}
