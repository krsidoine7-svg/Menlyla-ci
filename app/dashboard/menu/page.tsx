import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryDialog } from '@/components/modules/menu/components/category-dialog'
import { DishDialog } from '@/components/modules/menu/components/dish-dialog'
import { MenuDisplay } from '@/components/modules/menu/components/menu-display'


export default async function MenuPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <div>Configurez d'abord votre restaurant</div>

    const { data: categories } = await supabase
        .from('categories')
        .select('*, dishes(*)')
        .eq('restaurant_id', restaurant.id)
        .order('rank', { ascending: true })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Menu & Carte</h1>
                <CategoryDialog />
            </div>

            <MenuDisplay categories={categories || []} />
        </div>
    )
}
