import { getRestaurantOrders } from '@/components/modules/orders/actions'
import { KitchenBoard } from '@/components/modules/orders/components/kitchen-board'
import { OrderList } from '@/components/modules/orders/components/order-list'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, ListOrdered } from 'lucide-react'

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const orders = await getRestaurantOrders()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Gestion des Commandes</h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Cuisine & Historique</p>
                </div>
            </div>

            <Tabs defaultValue="kitchen" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
                    <TabsTrigger value="kitchen" className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        Cuisine
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Liste / Archive
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kitchen" className="mt-0 border-none p-0 focus-visible:ring-0">
                    <KitchenBoard initialOrders={orders} restaurantId={restaurant.id} />
                </TabsContent>

                <TabsContent value="list" className="mt-0 border-none p-0 focus-visible:ring-0">
                    <OrderList />
                </TabsContent>
            </Tabs>
        </div>
    )
}
