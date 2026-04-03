import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatOrderId } from '@/lib/utils'
import { ClientOrderActions } from '@/components/modules/checkout/client-order-actions'
import { getSystemSettings } from '@/app/(super-admin)/admin/actions'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ slug: string, orderId: string }> }) {
    const { slug, orderId } = await params
    const supabase = await createClient()
    const systemSettings = await getSystemSettings()

    const { data: order } = await supabase
        .from('orders')
        .select(`
            *,
            restaurants (
                name,
                settings
            ),
            payments (status)
        `)
        .eq('id', orderId)
        .single()

    if (!order) {
        return <div>Commande non trouvée</div>
    }

    const simpleId = formatOrderId(order.id, order.created_at)
    const isPaid = order.payments?.some((p: any) => p.status === 'COMPLETED' || p.status === 'success')

    // Local restaurant setting vs Global platform setting
    const restaurantSettings = (order.restaurants as any)?.settings || {}
    const isRestaurantPaymentEnabled = restaurantSettings.payment_config?.enabled !== false
    const isGlobalPaymentEnabled = systemSettings.is_order_payments_enabled !== false

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 bg-black">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 w-full max-w-md space-y-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 h-48 w-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />
                
                <div className="mx-auto h-24 w-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-700">
                    <CheckCircle2 className="h-12 w-12" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white italic tracking-tight">C'est parti !</h1>
                    <p className="text-white/40 font-medium">
                        Commande <span className="text-emerald-500 font-black">#{simpleId}</span> transmise avec succès.
                    </p>
                </div>

                <div className="py-2">
                    <ClientOrderActions
                        orderId={order.id}
                        totalAmount={order.total_amount}
                        restaurantName={(order.restaurants as any)?.name || 'Restaurant'}
                        isPaid={isPaid}
                        isPaymentEnabled={isGlobalPaymentEnabled && isRestaurantPaymentEnabled}
                    />
                </div>

                <Link href={`/${slug}`} className="block relative z-10">
                    <Button variant="ghost" className="w-full text-white/40 hover:text-white hover:bg-white/5 rounded-2xl h-14 font-bold text-xs uppercase tracking-widest gap-3">
                        <ArrowLeft className="h-4 w-4" />
                        Reprendre mes commandes
                    </Button>
                </Link>
            </div>
        </div>
    )
}
