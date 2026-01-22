import { getRestaurantOrders } from '@/components/modules/orders/actions'
import { KitchenBoard } from '@/components/modules/orders/components/kitchen-board'
import { OrderList } from '@/components/modules/orders/components/order-list'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const orders = await getRestaurantOrders()

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-2">
                <p className="text-xs tracking-[0.5em] text-orange-500 font-black uppercase">Cuisine & Commandes</p>
                <h1 className="text-3xl font-black tracking-tight">Cuisine Commandes</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Suivez vos commandes en temps réel, faites avancer les plats et consultez l’historique complet sans changer d’écran.
                </p>
            </header>

            <KitchenBoard initialOrders={orders} restaurantId={restaurant.id} />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-[0.3em] text-slate-500">Historique & Archive</h2>
                </div>
                <OrderList />
            </section>
        </div>
    )
}
