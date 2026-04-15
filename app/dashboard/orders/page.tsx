import { getRestaurantOrders } from '@/components/modules/orders/actions'
import { KitchenBoard } from '@/components/modules/orders/components/kitchen-board'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: restaurant } = await supabase.from('restaurants').select('id, name, settings').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const { data: orders } = await supabase
        .from('orders')
        .select('*, tables (name), order_items (*, dishes (name))')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="flex flex-col gap-8 p-2 md:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <p className="text-xs font-medium text-slate-600">Service en direct</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Commandes en cuisine
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl">
                        Gérez l'état de vos commandes en temps réel.
                    </p>
                </div>
            </header>

            <KitchenBoard initialOrders={orders || []} restaurantId={restaurant.id} restaurantSettings={restaurant.settings} />
        </div>
    )
}
