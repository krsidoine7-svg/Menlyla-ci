import { ArchiveView } from '@/components/modules/orders/components/archive-view'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ArchivePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: restaurant } = await supabase.from('restaurants').select('id, name').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const { data: orders } = await supabase
        .from('orders')
        .select(`*, tables (name), order_items (*, dishes (name))`)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="flex flex-col gap-8 p-2 md:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Comptabilité & Archives
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl">
                        Filtrez vos ventes, téléchargez les factures et suivez vos encaissements avec précision.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-medium text-slate-700 gap-2 px-6 h-11 hover:bg-slate-50 transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Exporter en CSV
                    </Button>
                </div>
            </header>

            <section className="space-y-6">
                <ArchiveView initialOrders={orders || []} restaurantName={restaurant.name} />
            </section>
        </div>
    )
}
