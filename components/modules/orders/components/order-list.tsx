'use client'

import { useEffect, useState } from 'react'
import { getRestaurantOrders, updateOrderStatus } from '../actions'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChefHat, Clock, Truck, CreditCard, Wallet, Banknote, AlertCircle, FileText, Printer, Store } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatOrderId } from '@/lib/utils'

export function OrderList({ restaurantSettings }: { restaurantSettings?: any }) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [prevCount, setPrevCount] = useState(0)

    const fetchOrders = async () => {
        const data = await getRestaurantOrders()
        const newOrders = data || []
        const newPendingCount = newOrders.filter((o: any) => o.status === 'pending').length
        
        const vocalStyle = restaurantSettings?.notification_vocal_style || 'continuous'

        if (newPendingCount > prevCount && typeof window !== 'undefined') {
            // New orders arrived: Handle immediate announcements
            if (vocalStyle === 'twice') {
                for(let i=0; i<2; i++) {
                    const utterance = new SpeechSynthesisUtterance('Nouvelle commande arrivée !')
                    utterance.lang = 'fr-FR'
                    window.speechSynthesis.speak(utterance)
                }
            } else {
                // Continuous mode or default: just once on arrival
                const utterance = new SpeechSynthesisUtterance('Nouvelle commande arrivée !')
                utterance.lang = 'fr-FR'
                window.speechSynthesis.speak(utterance)
            }
            
            toast.info("🔔 Nouvelle commande reçue !")
        }

        setOrders(newOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        setPrevCount(newPendingCount)
        setLoading(false)
    }

    // Data Fetch Interval (10s)
    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 10000)
        return () => clearInterval(interval)
    }, [prevCount])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        toast.promise(updateOrderStatus(orderId, newStatus), {
            loading: 'Mise à jour...',
            success: () => {
                fetchOrders()
                return "Statut mis à jour"
            },
            error: (err) => err.message || "Erreur de mise à jour"
        })
    }

    const printInvoice = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=800,height=1000')
        if (!printWindow) return

        const itemsHtml = order.order_items?.map((item: any) => `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${item.quantity}x ${item.dishes?.name}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price.toLocaleString()} FCFA</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.unit_price).toLocaleString()} FCFA</td>
            </tr>
        `).join('')

        printWindow.document.write(`
            <html>
                <head>
                    <title>Facture #${formatOrderId(order.id, order.created_at)}</title>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .invoice-title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                        .restaurant-info { text-align: right; }
                        .details { margin-bottom: 40px; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .total { text-align: right; font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                        .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #777; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="invoice-title">Facture Client</div>
                            <div>N° #${formatOrderId(order.id, order.created_at)}</div>
                            <div>Date: ${new Date(order.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                        <div class="restaurant-info">
                            <strong style="font-size: 18px;">${order.restaurants?.name || 'Votre Restaurant'}</strong><br>
                            ${order.tables?.name ? `Table: ${order.tables?.name}` : ''}<br>
                            Mode: ${order.dining_type === 'take_away' ? 'À Emporter' : 'Sur Place'}
                        </div>
                    </div>
                    
                    <table class="table">
                        <thead>
                            <tr style="text-align: left; background: #f9f9f9;">
                                <th style="padding: 10px;">Désignation</th>
                                <th style="padding: 10px; text-align: right;">P.U</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="total">
                        TOTAL À RÉGLER : ${order.total_amount.toLocaleString()} FCFA
                    </div>

                    <div class="footer">
                        Merci de votre visite et à très bientôt !<br>
                        Document généré par Menlyla.com
                    </div>

                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    if (loading) return <div>Chargement...</div>

    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
    const historyOrders = orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.status))

    return (
        <div className="space-y-12">
            {activeOrders.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-orange-500">Commandes en cours</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeOrders.map(order => (
                            <OrderCard key={order.id} order={order} onAction={handleStatusChange} onPrint={() => printInvoice(order)} />
                        ))}
                    </div>
                </section>
            )}

            {historyOrders.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Archives & Terminées</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {historyOrders.map(order => (
                            <OrderCard key={order.id} order={order} onAction={handleStatusChange} onPrint={() => printInvoice(order)} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function OrderCard({ order, onAction, onPrint }: { order: any, onAction: (id: string, s: string) => void, onPrint: () => void }) {
    const statusColor = {
        pending: 'border-l-red-500',
        confirmed: 'border-l-blue-500',
        preparing: 'border-l-orange-500',
        ready: 'border-l-emerald-500',
        delivered: 'border-l-slate-400',
        cancelled: 'border-l-slate-200 opacity-50'
    }[order.status as string] || 'border-l-primary'

    return (
        <Card className={cn("border-l-4 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white", statusColor)}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                             <CardTitle className="text-lg font-black italic tracking-tighter">#{formatOrderId(order.id, order.created_at)}</CardTitle>
                             <Badge variant={order.status === 'delivered' ? 'secondary' : 'outline'} className="text-[9px] font-black uppercase">
                                {order.status === 'delivered' ? 'Servi' : order.status}
                             </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                             <Store className="w-3.5 h-3.5 text-slate-300" />
                             <span className="text-[10px] font-bold uppercase text-slate-400">Table: {order.tables?.name || 'Inconnue'}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onPrint} className="h-10 w-10 rounded-2xl bg-slate-50 hover:bg-orange-600 hover:text-white transition-all text-slate-400">
                        <FileText className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pb-4 pt-2">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {order.order_items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] font-bold italic">
                            <span>{item.quantity}x {item.dishes?.name}</span>
                            <span className="text-slate-400">{item.unit_price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-slate-50/50 px-6 py-4 border-t border-slate-100">
                <div className="text-sm font-black italic">{order.total_amount.toLocaleString()} FCFA</div>
                <div className="flex gap-2">
                    {order.status === 'ready' && (
                        <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] px-6" onClick={() => onAction(order.id, 'delivered')}>Servi</Button>
                    )}
                    {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-400 font-bold text-[10px]" disabled>Commandée Archivée</Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
