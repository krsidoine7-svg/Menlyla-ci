import { getRestaurantOrders } from '@/components/modules/orders/actions'
import { KitchenBoard } from '@/components/modules/orders/components/kitchen-board'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'

export default async function KitchenPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const orders = await getRestaurantOrders()

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Dashboard Cuisine</h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Direct Live • Commandes en temps réel</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KitchenBoard initialOrders={orders} restaurantId={restaurant.id} />
            </div>
        </div>
    )
}
