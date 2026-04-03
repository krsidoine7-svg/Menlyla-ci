'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, CheckCircle2, PlayCircle, Loader2, AlertCircle, Volume2, Store, ShoppingBag, ShieldCheck, Zap, Printer, TrendingUp } from 'lucide-react'
import { updateOrderStatus } from '../actions'
import { toast } from 'sonner'
import { cn, formatOrderId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-red-600', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-blue-500', icon: CheckCircle2 },
    preparing: { label: 'En cuisine', color: 'bg-orange-500', icon: PlayCircle },
    ready: { label: 'Prêt', color: 'bg-emerald-500', icon: CheckCircle2 },
    delivered: { label: 'Servi', color: 'bg-slate-500', icon: CheckCircle2 },
    completed: { label: 'Terminé', color: 'bg-black', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-slate-300', icon: AlertCircle },
}

export function KitchenBoard({ initialOrders, restaurantId }: { initialOrders: any[], restaurantId: string }) {
    const [orders, setOrders] = useState(initialOrders)
    const [loading, setLoading] = useState<string | null>(null)
    const [confirmCancel, setConfirmCancel] = useState<{ open: boolean, orderId: string | null }>({ open: false, orderId: null })
    const [lastOrderFlash, setLastOrderFlash] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    }, [])

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play blocked by browser. Click anywhere to enable."))
        }
        
        setLastOrderFlash(true)
        setTimeout(() => setLastOrderFlash(false), 3000)

        toast("🔔 Nouvelle Commande !", {
            description: "Une nouvelle commande vient d'arriver en cuisine.",
            className: "bg-red-600 text-white border-none rounded-3xl",
            duration: 10000
        })
    }

    useEffect(() => {
        const channel = supabase
            .channel(`kitchen-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    table: 'orders',
                    schema: 'public',
                },
                async (payload: any) => {
                    if (payload.new && payload.new.restaurant_id === restaurantId) {
                        if (payload.eventType === 'INSERT') {
                            setOrders((current) => {
                                if (current.find(o => o.id === payload.new.id)) return current
                                return [payload.new, ...current]
                            })
                            router.refresh()
                            playNotificationSound()
                        } else if (payload.eventType === 'UPDATE') {
                            router.refresh()
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, restaurantId, router])

    useEffect(() => {
        setOrders(initialOrders)
    }, [initialOrders])

    const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
        setLoading(orderId)
        try {
            await updateOrderStatus(orderId, nextStatus)
            toast.info(`Status mis à jour : ${STATUS_CONFIG[nextStatus].label}`)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(null)
        }
    }

    const printTicket = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (!printWindow) return

        const itemsHtml = order.order_items?.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-family: monospace;">
                <span>${item.quantity}x ${item.dishes?.name}</span>
            </div>
        `).join('')

        const type = order.dining_type === 'take_away' ? 'À EMPORTER' : `TABLE: ${order.tables?.name || 'SUR PLACE'}`

        printWindow.document.write(`
            <html>
                <head>
                    <title>Ticket #${order.id.slice(0, 5)}</title>
                    <style>
                        body { font-family: monospace; padding: 20px; color: black; }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .details { margin-bottom: 10px; font-size: 14px; }
                        .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .footer { text-align: center; font-size: 10px; margin-top: 20px; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin: 0;">MENLYLA</h2>
                        <div style="font-size: 12px;">Ticket Cuisine</div>
                    </div>
                    <div class="details">
                        <div style="font-weight: bold; font-size: 18px;">ORDRE #${formatOrderId(order.id, order.created_at)}</div>
                        <div style="margin-top: 5px;">${type}</div>
                        <div style="font-size: 10px; margin-top: 5px;">${new Date(order.created_at).toLocaleString('fr-FR')}</div>
                    </div>
                    <div class="items">
                        ${itemsHtml}
                    </div>
                    <div class="footer">
                        Bon appétit !<br>Généré par Menlyla.com
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

    const sections: OrderStatus[] = ['pending', 'preparing', 'ready']

    return (
        <div className="flex flex-col gap-6 h-full pb-10">
            <div className="flex items-center justify-between bg-black/5 p-4 rounded-[2.5rem] border border-black/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-600 border border-orange-600/20">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Flux Direct</p>
                        <p className="text-sm font-bold italic">Synchronisation cuisine active</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => audioRef.current?.play()}
                    className="rounded-2xl border-black/10 bg-white shadow-sm hover:bg-black hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest h-10 px-6 gap-2"
                >
                    <Volume2 className="h-3 w-3" /> Tester le son
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                {sections.map((status) => (
                    <div 
                        key={status} 
                        className={cn(
                            "flex flex-col h-full bg-white border border-black/5 rounded-[3rem] p-6 shadow-sm transition-all duration-500",
                            status === 'pending' && lastOrderFlash ? "ring-4 ring-red-600/20 bg-red-600/[0.02] border-red-600/20" : ""
                        )}
                    >
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-4 w-4 rounded-full border-2 border-white shadow-sm", STATUS_CONFIG[status].color)} />
                                <h3 className="font-black uppercase tracking-widest text-[10px] text-black/40">{STATUS_CONFIG[status].label}</h3>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-4 h-6 font-black text-[10px] bg-black text-white">
                                {orders.filter(o => o.status === status).length}
                            </Badge>
                        </div>

                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-6">
                                {orders
                                    .filter(o => o.status === status)
                                    .map((order) => {
                                        return (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                onStatusUpdate={handleStatusUpdate}
                                                onPrint={() => printTicket(order)}
                                                onCancel={() => setConfirmCancel({ open: true, orderId: order.id })}
                                                loading={loading === order.id}
                                            />
                                        )
                                    })}

                                {orders.filter(o => o.status === status).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-10">
                                        <div className="h-16 w-16 border-2 border-dashed border-black rounded-full flex items-center justify-center">
                                            <div className="h-2 w-2 bg-black rounded-full animate-ping" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-4">Aucun flux</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                open={confirmCancel.open}
                onOpenChange={(open) => setConfirmCancel({ open, orderId: null })}
                title="Annuler la commande ?"
                description="Cette action est irréversible et le client sera informé immédiatement."
                confirmLabel="Confirmer l'annulation"
                variant="destructive"
                onConfirm={() => {
                    if (confirmCancel.orderId) {
                        handleStatusUpdate(confirmCancel.orderId, 'cancelled')
                        setConfirmCancel({ open: false, orderId: null })
                    }
                }}
            />
        </div>
    )
}

function OrderCard({ order, onStatusUpdate, onPrint, onCancel, loading }: any) {
    const elapsed = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)
    const isTakeAway = order.dining_type === 'take_away'
    const isPaid = order.payment_status === 'paid'

    return (
        <Card className="group relative rounded-[2rem] border border-black/[0.03] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
            <CardHeader className="p-6 pb-4 border-b border-black/[0.02] space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest leading-none">Bon</span>
                             <div className="font-bold text-xl tracking-tight text-slate-900">#{formatOrderId(order.id, order.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isTakeAway ? (
                                <div className="bg-orange-50 text-orange-600 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1.5">
                                    <ShoppingBag className="h-2.5 w-2.5" /> Emporter
                                </div>
                            ) : (
                                <div className="bg-slate-100 text-slate-600 text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                                    <Store className="h-2.5 w-2.5" /> {order.tables?.name || 'Salle'}
                                </div>
                            )}
                            <div className={cn(
                                "text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5 border",
                                isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-600/5"
                            )}>
                                {isPaid ? <ShieldCheck className="h-2.5 w-2.5" /> : <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                {isPaid ? 'Payé' : 'À régler'}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onPrint}
                            className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <div className={cn(
                            "text-[10px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl uppercase tracking-tighter border",
                            elapsed > 15 ? "bg-red-600 text-white animate-pulse border-red-600" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                            <Clock className="h-3 w-3" /> {elapsed} min
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                    {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm items-center">
                            <div className="flex items-center gap-3">
                                <span className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-lg">{item.quantity}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-black italic tracking-tight">{item.dishes?.name}</span>
                                    <span className="text-[9px] font-black uppercase text-black/20 tracking-widest">Préparation standard</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-black/5">
                    {order.status === 'pending' && (
                        <Button
                            className="w-full rounded-[1.5rem] bg-orange-600 hover:bg-orange-700 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 transition-all active:scale-95"
                            onClick={() => onStatusUpdate(order.id, 'preparing')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lancer la préparation'}
                        </Button>
                    )}
                    {order.status === 'preparing' && (
                        <Button
                            className="w-full rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                            onClick={() => onStatusUpdate(order.id, 'ready')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Marquer comme prêt'}
                        </Button>
                    )}
                    {order.status === 'ready' && (
                        <Button
                            className="w-full rounded-[1.5rem] bg-black hover:bg-slate-900 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 transition-all active:scale-95 text-white"
                            onClick={() => onStatusUpdate(order.id, 'delivered')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Servi à table'}
                        </Button>
                    )}

                    {['pending', 'preparing'].includes(order.status) && (
                        <Button
                            variant="ghost"
                            className="w-full rounded-2xl h-10 font-bold text-[10px] uppercase text-black/20 hover:text-red-600 hover:bg-red-50 transition-all"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Annuler cette commande
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
