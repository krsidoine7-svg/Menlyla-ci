'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { formatOrderId } from '@/lib/utils'

type Order = {
    id: string
    created_at: string
    status: string
    total_amount: number
    tables: any // Can be object or array depending on Supabase inference
}

export function RecentActivity({ initialOrders, currency, restaurantId }: { initialOrders: Order[], currency: string, restaurantId?: string }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    useEffect(() => {
        // Request notification permission once on mount
        if (typeof window !== 'undefined' && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission()
            }
        }
    }, [])

    useEffect(() => {
        if (!restaurantId) return

        const channel = supabase
            .channel(`dashboard-recent-activity-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    table: 'orders',
                    schema: 'public',
                    filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined
                },
                async (payload: any) => {
                    toast.info("🔔 Nouvelle commande reçue !")

                    // Browser notification
                    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                        new Notification("Nouvelle Commande ! 🍽️", {
                            body: `Une nouvelle commande de ${payload.new.total_amount} ${currency} vient d'arriver.`,
                            icon: "/favicon.ico"
                        })
                    }

                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    table: 'orders',
                    schema: 'public',
                    filter: restaurantId ? `restaurant_id=eq.${restaurantId}` : undefined
                },
                (payload: any) => {
                    // Status change
                    router.refresh()
                }
            )
            .subscribe((status: string) => {
                if (status !== 'SUBSCRIBED') {
                    console.warn("Recent Activity subscription status:", status)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router, restaurantId, currency])

    // Update local state when props change (due to router.refresh)
    useEffect(() => {
        setOrders(initialOrders)
    }, [initialOrders])

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold leading-none tracking-tight">Activité Récente</h3>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/orders" className="flex items-center gap-1">
                        Voir tout <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
                ) : (
                    orders.map((order) => {
                        const tableName = Array.isArray(order.tables)
                            ? order.tables[0]?.name
                            : order.tables?.name

                        return (
                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {tableName ? `Table ${tableName}` : 'Vente à emporter'}
                                        </span>
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                                            #{formatOrderId(order.id, order.created_at)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-sm">{order.total_amount} {currency}</span>
                                    <Badge variant={getStatusVariant(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'pending': return 'En attente'
        case 'confirmed': return 'Confirmée'
        case 'preparing': return 'En cuisine'
        case 'ready': return 'Prête'
        case 'delivered': return 'Servie'
        case 'completed': return 'Terminée'
        case 'paid': return 'Payée'
        case 'cancelled': return 'Annulée'
        default: return status
    }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case 'pending': return 'destructive'
        case 'confirmed': return 'default'
        case 'preparing': return 'secondary'
        case 'ready': return 'default'
        case 'delivered':
        case 'completed':
        case 'paid': return 'outline'
        case 'cancelled': return 'destructive'
        default: return 'outline'
    }
}
