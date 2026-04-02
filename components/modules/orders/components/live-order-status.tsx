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
                    // Use the latest state-like check
                    if (activeOrderIds.includes(payload.new.id)) {
                        const newStatus = payload.new.status
                        
                        // We don't check prev status here to keep code simple and reactive
                        setOrders(prev => {
                            if (prev[payload.new.id] === newStatus) return prev
                            return { ...prev, [payload.new.id]: newStatus }
                        })
                        
                        showNotification(payload.new.id)

                        const config = STATUS_MAP[newStatus]
                        if (config) {
                            toast.success(
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${config.color}`}>
                                        <config.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-black text-sm">Commande #{payload.new.id.slice(-4).toUpperCase()}</div>
                                        <div className="text-xs font-semibold opacity-90">{config.voice}</div>
                                    </div>
                                </div>,
                                {
                                    duration: 5000,
                                    className: 'bg-white border-2 border-orange-100 shadow-2xl',
                                }
                            )
                            announce(config.voice)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeOrderIds, supabase]) // Removed 'orders' from dependency to avoid re-subscribing on every status update

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


    // Don't render any fixed UI card - only use toast notifications
    return null
}
