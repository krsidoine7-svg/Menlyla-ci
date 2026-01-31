'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, CheckCircle2, PlayCircle, Loader2, AlertCircle } from 'lucide-react'
import { updateOrderStatus } from '../actions'
import { toast } from 'sonner'
import { cn, formatOrderId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-blue-500', icon: CheckCircle2 },
    preparing: { label: 'En cuisine', color: 'bg-orange-500', icon: PlayCircle },
    ready: { label: 'Prêt', color: 'bg-green-500', icon: CheckCircle2 },
    delivered: { label: 'Servi', color: 'bg-slate-500', icon: CheckCircle2 },
    completed: { label: 'Terminé', color: 'bg-slate-900', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-red-500', icon: AlertCircle },
}

export function KitchenBoard({ initialOrders, restaurantId }: { initialOrders: any[], restaurantId: string }) {
    const [orders, setOrders] = useState(initialOrders)
    const [loading, setLoading] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const playNotificationSound = (order?: any) => {
        if (typeof window !== 'undefined') {
            const tableInfo = order?.tables?.name || 'Sur place'
            const text = `Nouvelle commande reçue. ${tableInfo}.`

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'fr-FR'
            utterance.rate = 1
            utterance.pitch = 1.1
            window.speechSynthesis.speak(utterance)

            toast.info("🔔 Nouvelle commande !", {
                description: tableInfo,
                duration: 5000
            })

            // Browser notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Nouvelle Commande ! 🍽️", {
                    body: `Une nouvelle commande vient d'arriver: ${tableInfo}`,
                    icon: "/favicon.ico"
                })
            }
        }
    }

    useEffect(() => {
        // Request notification permission once on mount
        if (typeof window !== 'undefined' && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission()
            }
        }
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel(`kitchen-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    table: 'orders',
                    schema: 'public',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                async (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        // Wait slightly for order_items and joins to be populated
                        setTimeout(async () => {
                            const { data: newOrder, error } = await supabase
                                .from('orders')
                                .select(`
                                    *,
                                    tables(name),
                                    order_items(
                                        quantity,
                                        unit_price,
                                        dishes(name)
                                    ),
                                    profiles(full_name)
                                `)
                                .eq('id', payload.new.id)
                                .single()

                            if (!error && newOrder) {
                                playNotificationSound(newOrder)
                                setOrders((current) => {
                                    if (current.find(o => o.id === newOrder.id)) return current
                                    return [newOrder, ...current]
                                })
                            }
                        }, 1500)
                    } else if (payload.eventType === 'UPDATE') {
                        router.refresh()
                    }
                }
            )
            .subscribe((status: string) => {
                if (status !== 'SUBSCRIBED') {
                    console.warn("Realtime subscription status:", status)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, restaurantId, router])

    // Sync local state when props change
    useEffect(() => {
        setOrders(initialOrders)
    }, [initialOrders])

    const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
        setLoading(orderId)
        try {
            await updateOrderStatus(orderId, nextStatus)
            toast.success(`Commande passée en : ${STATUS_CONFIG[nextStatus].label}`)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(null)
        }
    }

    const sections: OrderStatus[] = ['pending', 'preparing', 'ready']

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-10">
            {sections.map((status) => (
                <div key={status} className="flex flex-col h-full bg-muted/30 rounded-[2rem] p-4 border border-muted-foreground/10">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-full", STATUS_CONFIG[status].color)} />
                            <h3 className="font-black uppercase tracking-widest text-xs">{STATUS_CONFIG[status].label}</h3>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-2 font-black">
                            {orders.filter(o => o.status === status).length}
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1 pr-2">
                        <div className="space-y-4">
                            {orders
                                .filter(o => o.status === status)
                                .map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onStatusUpdate={handleStatusUpdate}
                                        loading={loading === order.id}
                                    />
                                ))}

                            {orders.filter(o => o.status === status).length === 0 && (
                                <div className="text-center py-10 opacity-30 italic text-sm">
                                    Aucune commande
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    )
}

function OrderCard({ order, onStatusUpdate, loading }: any) {
    const elapsed = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)

    return (
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-card">
            <CardHeader className="p-4 pb-2 border-b border-muted bg-muted/10">
                <div className="flex justify-between items-start">
                    <div className="font-black text-lg">#{formatOrderId(order.id, order.created_at)}</div>
                    <div className={cn(
                        "text-[10px] font-bold flex items-center gap-1",
                        elapsed > 15 ? "text-red-500 animate-pulse" : "text-muted-foreground"
                    )}>
                        <Clock className="h-3 w-3" /> {elapsed} min
                    </div>
                </div>
                <div className="text-xs font-black uppercase tracking-tighter text-orange-600 mt-1">
                    {order.tables?.name || 'Sur place'}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm items-center">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-md bg-muted flex items-center justify-center font-black text-xs text-muted-foreground">{item.quantity}</span>
                                <span className="font-bold">{item.dishes?.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2">
                    {order.status === 'pending' && (
                        <Button
                            className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 h-10 font-black text-xs uppercase"
                            onClick={() => onStatusUpdate(order.id, 'preparing')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lancer la préparation'}
                        </Button>
                    )}
                    {order.status === 'preparing' && (
                        <Button
                            className="w-full rounded-2xl bg-green-600 hover:bg-green-700 h-10 font-black text-xs uppercase"
                            onClick={() => onStatusUpdate(order.id, 'ready')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Marquer comme prêt'}
                        </Button>
                    )}
                    {order.status === 'ready' && (
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl h-10 font-black text-xs uppercase border-slate-200"
                            onClick={() => onStatusUpdate(order.id, 'delivered')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Servi à table'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
