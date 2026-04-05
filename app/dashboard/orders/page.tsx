import { getRestaurantOrders } from '@/components/modules/orders/actions'
import { KitchenBoard } from '@/components/modules/orders/components/kitchen-board'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { UtensilsCrossed } from 'lucide-react'

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
        <div className="flex flex-col gap-12 p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <header className="p-10 md:p-14 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 rotate-45 opacity-[0.03] transition-transform duration-1000 group-hover:scale-110">
                    <UtensilsCrossed className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-600 animate-ping" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-600 italic">Direct Kitchen</p>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 italic leading-none">
                        Tableau de <span className="text-orange-600 underline decoration-orange-100 decoration-8 underline-offset-8">Cuisine</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-tight italic max-w-sm">
                        Gérez vos commandes en temps réel et assurez un service d'excellence. 🍲☕🔥
                    </p>
                </div>
            </header>

            <KitchenBoard initialOrders={orders || []} restaurantId={restaurant.id} restaurantSettings={restaurant.settings} />
        </div>
    )
}
