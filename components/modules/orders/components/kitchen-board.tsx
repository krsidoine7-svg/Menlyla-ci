'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, CheckCircle2, PlayCircle, Loader2, AlertCircle, Volume2, Store, ShoppingBag, ShieldCheck, Zap, Printer } from 'lucide-react'
import { updateOrderStatus } from '../actions'
import { toast } from 'sonner'
import { cn, formatOrderId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'text-red-500', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'text-blue-500', icon: CheckCircle2 },
    preparing: { label: 'En cuisine', color: 'text-orange-500', icon: PlayCircle },
    ready: { label: 'Prêt', color: 'text-emerald-500', icon: CheckCircle2 },
    delivered: { label: 'Servi', color: 'text-slate-500', icon: CheckCircle2 },
    completed: { label: 'Terminé', color: 'text-slate-900', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'text-slate-300', icon: AlertCircle },
}

export function KitchenBoard({ initialOrders, restaurantId, restaurantSettings }: { initialOrders: any[], restaurantId: string, restaurantSettings?: any }) {
    const [orders, setOrders] = useState(initialOrders)
    const [loading, setLoading] = useState<string | null>(null)
    const [confirmCancel, setConfirmCancel] = useState<{ open: boolean, orderId: string | null }>({ open: false, orderId: null })
    const [lastOrderFlash, setLastOrderFlash] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    const vocalStyle = (restaurantSettings as any)?.notification_vocal_style || 'continuous'

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    }, [])

    useEffect(() => {
        if (vocalStyle !== 'continuous') return

        const interval = setInterval(() => {
            const hasPending = orders.some(o => o.status === 'pending')
            if (hasPending && typeof window !== 'undefined') {
                const utterance = new SpeechSynthesisUtterance('Nouvelle commande en attente !')
                utterance.lang = 'fr-FR'
                window.speechSynthesis.speak(utterance)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [orders, vocalStyle])

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play blocked by browser. Click anywhere to enable."))
        }
        
        if (vocalStyle === 'twice' && typeof window !== 'undefined') {
            for(let i=0; i<2; i++) {
                const utterance = new SpeechSynthesisUtterance('Nouvelle commande arrivée !')
                utterance.lang = 'fr-FR'
                window.speechSynthesis.speak(utterance)
            }
        } else if (vocalStyle === 'continuous' && typeof window !== 'undefined') {
            const utterance = new SpeechSynthesisUtterance('Nouvelle commande arrivée !')
            utterance.lang = 'fr-FR'
            window.speechSynthesis.speak(utterance)
        }

        setLastOrderFlash(true)
        setTimeout(() => setLastOrderFlash(false), 3000)

        toast("🔔 Nouvelle Commande !", {
            description: "Une nouvelle commande vient d'arriver en cuisine.",
            className: "border-slate-100 rounded-2xl",
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
            toast.success(`Statut mis à jour : ${STATUS_CONFIG[nextStatus].label}`)
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
                        <h2 style="margin: 0;">CUISINE</h2>
                    </div>
                    <div class="details">
                        <div style="font-weight: bold; font-size: 18px;">COMMANDE #${formatOrderId(order.id, order.created_at)}</div>
                        <div style="margin-top: 5px;">${type}</div>
                        <div style="font-size: 10px; margin-top: 5px;">${new Date(order.created_at).toLocaleString('fr-FR')}</div>
                    </div>
                    <div class="items">
                        ${itemsHtml}
                    </div>
                    <div class="footer">
                        Généré le ${new Date().toLocaleTimeString('fr-FR')} 
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
            <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Synchronisation</p>
                        <p className="text-sm font-bold text-slate-900">En direct avec la salle</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => audioRef.current?.play()}
                    className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 h-10 px-4 gap-2"
                >
                    <Volume2 className="h-4 w-4" /> <span className="hidden md:inline">Tester le son</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {sections.map((status) => (
                    <div 
                        key={status} 
                        className={cn(
                            "flex flex-col h-full bg-slate-50/50 border border-slate-100 rounded-3xl p-4 md:p-5 shadow-sm",
                            status === 'pending' && lastOrderFlash ? "ring-2 ring-red-300 bg-red-50/50" : ""
                        )}
                    >
                        <div className="flex items-center justify-between mb-5 px-1">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = STATUS_CONFIG[status].icon;
                                    return <Icon className={cn("h-5 w-5", STATUS_CONFIG[status].color)} />;
                                })()}
                                <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">{STATUS_CONFIG[status].label}</h3>
                            </div>
                            <Badge variant="secondary" className="rounded-lg px-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 shadow-sm">
                                {orders.filter(o => o.status === status).length}
                            </Badge>
                        </div>

                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-4">
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
                                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                        <div className="h-12 w-12 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-3">
                                            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-pulse" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">Aucune commande</p>
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
        <Card className="group relative rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="p-4 md:p-5 border-b border-slate-50 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cmde</span>
                             <span className="font-bold text-lg text-slate-900">#{formatOrderId(order.id, order.created_at)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {isTakeAway ? (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-semibold gap-1">
                                    <ShoppingBag className="h-3 w-3" /> Emporter
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold gap-1">
                                    <Store className="h-3 w-3" /> {order.tables?.name || 'Salle'}
                                </Badge>
                            )}
                            <Badge variant="outline" className={cn(
                                "font-semibold gap-1",
                                isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>
                                {isPaid ? <ShieldCheck className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                                {isPaid ? 'Payé' : 'À régler'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={cn(
                            "text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                            elapsed > 15 ? "bg-red-50 text-red-700 border-red-200 animate-pulse" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                            <Clock className="h-3.5 w-3.5" /> {elapsed} min
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onPrint}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-5 space-y-4">
                <div className="space-y-3">
                    {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                                <span className="h-7 w-7 min-w-[28px] rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200">{item.quantity}</span>
                                <div className="flex flex-col mt-0.5">
                                    <span className="font-semibold text-slate-900">{item.dishes?.name}</span>
                                    {item.notes && <span className="text-xs text-slate-500 mt-0.5">{item.notes}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                    {order.status === 'pending' && (
                        <Button
                            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all h-11"
                            onClick={() => onStatusUpdate(order.id, 'preparing')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lancer la préparation'}
                        </Button>
                    )}
                    {order.status === 'preparing' && (
                        <Button
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all h-11"
                            onClick={() => onStatusUpdate(order.id, 'ready')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Marquer comme prêt'}
                        </Button>
                    )}
                    {order.status === 'ready' && (
                        <Button
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-all h-11"
                            onClick={() => onStatusUpdate(order.id, 'delivered')}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Servi à table'}
                        </Button>
                    )}

                    {['pending', 'preparing'].includes(order.status) && (
                        <Button
                            variant="ghost"
                            className="w-full rounded-xl text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors h-10"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Annuler la commande
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
