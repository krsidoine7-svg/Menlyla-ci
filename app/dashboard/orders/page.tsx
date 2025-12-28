import { OrderList } from '@/components/modules/orders/components/order-list'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Commandes en cours</h1>
            </div>
            <OrderList />
        </div>
    )
}
