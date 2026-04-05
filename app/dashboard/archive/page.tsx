import { ArchiveView } from '@/components/modules/orders/components/archive-view'
import { createClient } from '@/lib/supabase/server'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { History, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ArchivePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: restaurant } = await supabase.from('restaurants').select('id, name').eq('owner_id', user?.id).single()

    if (!restaurant) return <NoRestaurantState />

    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            tables (name),
            order_items (
                *,
                dishes (name)
            )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="flex flex-col gap-10 p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[3.5rem] shadow-sm border border-black/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 rotate-12 opacity-[0.03]">
                    <History className="h-56 w-56 animate-spin-slow" />
                </div>
                <div className="relative z-10 space-y-4 text-center md:text-left">
                    <p className="text-[10px] tracking-[0.6em] text-orange-500 font-black uppercase italic">Comptabilité & Archives</p>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase underline decoration-emerald-500/20 decoration-8 underline-offset-4">Centre de <span className="text-emerald-600">Contrôle</span></h1>
                    <p className="text-slate-500 max-w-md font-bold text-sm tracking-tight leading-relaxed italic mx-auto md:mx-0">
                        Filtrez vos ventes, téléchargez les factures client et suivez vos encaissement avec une précision chirurgicale.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <Button variant="outline" className="h-16 rounded-3xl border-black/5 bg-slate-50 font-black uppercase tracking-widest text-[10px] gap-3 px-10 hover:bg-black hover:text-white transition-all shadow-sm">
                        <Download className="h-4 w-4" /> Rapport CSV
                    </Button>
                </div>
            </header>

            <section className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                    <div className="h-3 w-3 bg-emerald-500 rounded-full animate-ping" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Archives Digitales</h2>
                </div>
                
                <ArchiveView initialOrders={orders || []} restaurantName={restaurant.name} />
            </section>
        </div>
    )
}
