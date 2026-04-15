import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryDialog } from '@/components/modules/menu/components/category-dialog'
import { DishDialog } from '@/components/modules/menu/components/dish-dialog'
import { MenuDisplay } from '@/components/modules/menu/components/menu-display'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'

export default async function MenuPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: restaurant } = await supabase.from('restaurants').select('id, currency').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const { data: categories } = await supabase
        .from('categories')
        .select('*, dishes(*)').eq('restaurant_id', restaurant.id).order('rank', { ascending: true }).order('rank', { foreignTable: 'dishes', ascending: true })

    return (
        <div className="flex flex-col gap-8 p-2 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-700">
            <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Menu & Carte
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Gérez vos catégories et vos plats.
                    </p>
                </div>
                <div>
                    <CategoryDialog />
                </div>
            </header>

            <MenuDisplay categories={categories || []} restaurant={restaurant} />
        </div>
    )
}
