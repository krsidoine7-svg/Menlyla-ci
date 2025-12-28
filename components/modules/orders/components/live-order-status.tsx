'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { formatOrderId } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, ChefHat, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { label: string, icon: any, color: string, voice: string }> = {
    pending: { label: 'Reçue', icon: Clock, color: 'bg-yellow-500', voice: 'Commande reçue par la cuisine.' },
    preparing: { label: 'En préparation', icon: ChefHat, color: 'bg-orange-500', voice: 'Votre commande est maintenant en préparation.' },
    ready: { label: 'Prête !', icon: CheckCircle2, color: 'bg-green-600', voice: 'Votre commande est prête !' },
    delivered: { label: 'Servie', icon: CheckCircle2, color: 'bg-blue-600', voice: 'Bon appétit !' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-red-600', voice: 'Votre commande a été annulée.' },
}

export function LiveOrderStatus() {
    const activeOrderIds = useCartStore((state) => state.activeOrderIds)
    const removeActiveOrder = useCartStore((state) => state.removeActiveOrder)
    const supabase = useMemo(() => createClient(), [])
    const [orders, setOrders] = useState<Record<string, string>>({}) // id -> status
    const [visibleNotifications, setVisibleNotifications] = useState<Record<string, boolean>>({})

    const announce = (text: string) => {
        if (typeof window !== 'undefined') {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'fr-FR'
            window.speechSynthesis.speak(utterance)
        }
    }

    const showNotification = (orderId: string) => {
        setVisibleNotifications(prev => ({ ...prev, [orderId]: true }))
        setTimeout(() => {
            setVisibleNotifications(prev => ({ ...prev, [orderId]: false }))
        }, 5000) // 5 seconds
    }

    useEffect(() => {
        if (activeOrderIds.length === 0) return

        // Initial fetch of statuses
        const fetchStatuses = async () => {
            const { data } = await supabase
                .from('orders')
                .select('id, status')
                .in('id', activeOrderIds)

            if (data) {
                const map: Record<string, string> = {}
                data.forEach((o: any) => {
                    map[o.id] = o.status
                    // When first landing/loading, if status is 'ready' or 'pending', show for 5s
                    // or maybe just don't show to avoid spamming on refresh.
                })
                setOrders(map)
            }
        }
        fetchStatuses()

        const channel = supabase
            .channel('customer-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    table: 'orders',
                    schema: 'public',
                },
                (payload: any) => {
                    if (activeOrderIds.includes(payload.new.id)) {
                        const oldStatus = orders[payload.new.id]
                        const newStatus = payload.new.status

                        if (oldStatus !== newStatus) {
                            setOrders(prev => ({ ...prev, [payload.new.id]: newStatus }))
                            showNotification(payload.new.id) // Show for 5 seconds

                            const config = STATUS_MAP[newStatus]
                            if (config) {
                                toast.success(`Commande #${payload.new.id.slice(-4).toUpperCase()}: ${config.label}`, {
                                    description: config.voice,
                                    duration: 5000 // 5 seconds
                                })
                                announce(config.voice)
                            }
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeOrderIds, supabase, orders])

    // Effect to trigger notification when a NEW order ID is added (initial validation)
    const prevIdsRef = useMemo(() => ({ current: [] as string[] }), [])
    useEffect(() => {
        const currentIds = activeOrderIds
        const newIds = currentIds.filter(id => !prevIdsRef.current.includes(id))

        newIds.forEach(id => {
            showNotification(id) // Special case: show when order is first validated/created
        })

        prevIdsRef.current = currentIds
    }, [activeOrderIds])

    const activeVisibleIds = activeOrderIds.filter(id => visibleNotifications[id])

    if (activeVisibleIds.length === 0) return null

    return (
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 max-w-[280px] w-full pointer-events-none">
            {activeVisibleIds.map(id => {
                const status = orders[id] || 'pending'
                const config = STATUS_MAP[status]
                if (!config) return null
                const Icon = config.icon

                return (
                    <div
                        key={id}
                        className="bg-white border-2 border-orange-100 shadow-2xl rounded-3xl p-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 pointer-events-auto"
                    >
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                            config.color
                        )}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                                Suivi Commande
                            </div>
                            <div className="font-black text-slate-900 truncate">
                                #{id.slice(-4).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.color)}></span>
                                    <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color)}></span>
                                </span>
                                <span className={cn("text-xs font-black uppercase tracking-tighter", status === 'pending' || status === 'ready' ? 'text-orange-600' : 'text-slate-500')}>
                                    {config.label}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
