import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatOrderId } from '@/lib/utils'
import { ClientOrderActions } from '@/components/modules/checkout/client-order-actions'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ slug: string, orderId: string }> }) {
    const { slug, orderId } = await params
    const supabase = await createClient()

    const { data: order } = await supabase
        .from('orders')
        .select(`
            id, 
            created_at, 
            total_amount,
            restaurants (name),
            payments (status)
        `)
        .eq('id', orderId)
        .single()

    if (!order) {
        return <div>Commande non trouvée</div>
    }

    const simpleId = formatOrderId(order.id, order.created_at)
    // Check if any payment is successful
    const isPaid = order.payments?.some((p: any) => p.status === 'success')

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 bg-slate-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6">
                <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                    <CheckCircle2 className="h-10 w-10" />
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900">Commande Reçue !</h1>
                    <p className="text-slate-500 mt-2">
                        Votre commande <span className="font-bold text-slate-800">#{simpleId}</span> a bien été transmise en cuisine.
                    </p>
                </div>

                <div className="py-4 border-t border-b border-slate-100">
                    <ClientOrderActions
                        orderId={order.id}
                        totalAmount={order.total_amount}
                        restaurantName={Array.isArray(order.restaurants) ? order.restaurants[0]?.name : (order.restaurants as any)?.name || 'Restaurant'}
                        isPaid={isPaid}
                    />
                </div>

                <Link href={`/${slug}`} className="block">
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au menu
                    </Button>
                </Link>
            </div>
        </div>
    )
}
