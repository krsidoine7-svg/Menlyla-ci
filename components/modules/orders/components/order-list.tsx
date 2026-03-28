'use client'

import { useEffect, useState } from 'react'
import { getRestaurantOrders, updateOrderStatus } from '../actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChefHat, Clock, Truck, CreditCard, Wallet, Banknote, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function OrderList() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // State to track previous count to trigger sound
    const [prevCount, setPrevCount] = useState(0)

    const fetchOrders = async () => {
        const data = await getRestaurantOrders()
        const newOrders = data || []

        // Check for new pending orders to trigger sound
        const newPendingCount = newOrders.filter((o: any) => o.status === 'pending').length
        // Ideally compare identifiers, but count increase of pending is decent proxy for MVP
        if (newPendingCount > prevCount && typeof window !== 'undefined') {
            const utterance = new SpeechSynthesisUtterance('Nouvelle commande arrivée !')
            utterance.lang = 'fr-FR'
            window.speechSynthesis.speak(utterance)
            toast.info("🔔 Nouvelle commande reçue !")
        }

        setOrders(newOrders)
        setPrevCount(newPendingCount)
        setLoading(false)
    }

    // Polling every 10 seconds
    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        toast.promise(updateOrderStatus(orderId, newStatus), {
            loading: 'Mise à jour...',
            success: () => {
                fetchOrders() // Refresh immediately
                return "Statut mis à jour"
            },
            error: (err) => err.message || "Erreur de mise à jour"
        })
    }

    if (loading) return <div>Chargement des commandes...</div>

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 border-2 border-dashed rounded-3xl bg-muted/20 opacity-60">
                <div className="bg-background p-4 rounded-full shadow-sm animate-bounce">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold">Le calme plat...</h3>
                    <p className="text-muted-foreground">Aucune commande en cours pour le moment.</p>
                </div>
            </div>
        )
    }

    const pendingOrders = orders.filter(o => o.status === 'pending')
    const inProgressOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status))
    const readyOrders = orders.filter(o => o.status === 'ready')

    // Group display logic could be better (columns or sections)
    // For MVP: Simple list

    return (
        <div className="space-y-8">
            {/* PENDING */}
            {pendingOrders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
                        <Clock className="h-6 w-6" /> Nouvelles Commandes ({pendingOrders.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingOrders.map(order => (
                            <OrderCard key={order.id} order={order} onAction={handleStatusChange} />
                        ))}
                    </div>
                </section>
            )}

            {/* IN KITCHEN */}
            {inProgressOrders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
                        <ChefHat className="h-6 w-6" /> En Cuisine ({inProgressOrders.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inProgressOrders.map(order => (
                            <OrderCard key={order.id} order={order} onAction={handleStatusChange} />
                        ))}
                    </div>
                </section>
            )}

            {/* READY */}
            {readyOrders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-6 w-6" /> Prêt à servir ({readyOrders.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {readyOrders.map(order => (
                            <OrderCard key={order.id} order={order} onAction={handleStatusChange} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function OrderCard({ order, onAction }: { order: any, onAction: (id: string, s: string) => void }) {
    return (
        <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <CardTitle>Table {order.tables?.name || '?'}</CardTitle>
                        {order.payments && order.payments.some((p: any) => p.status === 'success') ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 w-fit">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Payé ({order.payments.find((p: any) => p.status === 'success').provider})
                            </Badge>
                        ) : order.payments && order.payments.length > 0 ? (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 w-fit">
                                <Wallet className="w-3 h-3 mr-1" />
                                {order.payments[0].status === 'pending' ? 'Paiement en cours' : 'Paiement échoué'}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground w-fit">
                                <Banknote className="w-3 h-3 mr-1" />
                                Sur place
                            </Badge>
                        )}
                    </div>
                    <Badge variant="outline">{new Date(order.created_at).toLocaleTimeString().slice(0, 5)}</Badge>
                </div>
                <CardDescription>
                    Total: {order.total_amount} FCFA
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm">
                <ul className="list-disc pl-4 space-y-1">
                    {order.order_items.map((item: any, idx: number) => (
                        <li key={idx}>
                            <span className="font-bold">{item.quantity}x</span> {item.dishes?.name}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
                {order.status === 'pending' && (
                    <>
                        <Button size="sm" variant="destructive" onClick={() => onAction(order.id, 'cancelled')}>Refuser</Button>
                        <Button size="sm" onClick={() => onAction(order.id, 'confirmed')}>Accepter</Button>
                    </>
                )}
                {order.status === 'confirmed' && (
                    <Button size="sm" onClick={() => onAction(order.id, 'preparing')}>Lancer Cuisson</Button>
                )}
                {order.status === 'preparing' && (
                    <Button size="sm" onClick={() => onAction(order.id, 'ready')}>Prêt !</Button>
                )}
                {order.status === 'ready' && (
                    <Button size="sm" variant="secondary" onClick={() => onAction(order.id, 'delivered')}>Servi</Button>
                )}
            </CardFooter>
        </Card>
    )
}
