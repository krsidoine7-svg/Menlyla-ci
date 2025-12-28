'use client'

import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { submitOrder } from '@/components/modules/cart/actions'
import { toast } from 'sonner'

export default function CartPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const { items, removeItem, updateQuantity, getTotalPrice, clearCart, restaurantId, tableId, addActiveOrder } = useCartStore()
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
                <h1 className="text-xl font-bold">Votre panier est vide</h1>
                <Link href={`/${slug}`}>
                    <Button>Retour au menu</Button>
                </Link>
            </div>
        )
    }

    const handleOrder = async () => {
        if (!restaurantId) return

        setIsSubmitting(true)
        const result = await submitOrder({
            restaurant_id: restaurantId,
            items: items.map(i => ({ dish_id: i.dishId, quantity: i.quantity, price: i.price, name: i.name })),
            table_id: tableId,
        })

        if (result.success) {
            toast.success("Commande envoyée !")
            addActiveOrder(result.orderId)
            clearCart()
            router.push(`/${slug}/order/${result.orderId}`)
        } else {
            toast.error(result.message)
        }
        setIsSubmitting(false)
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4 pb-24">
            <header className="flex items-center gap-4 mb-6">
                <Link href={`/${slug}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Mon Panier</h1>
            </header>

            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.dishId}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="font-bold">{item.name}</div>
                                <div className="text-muted-foreground">{item.price} FCFA</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.dishId, item.quantity - 1)}>-</Button>
                                <span className="w-4 text-center">{item.quantity}</span>
                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.dishId, item.quantity + 1)}>+</Button>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.dishId)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-orange-600">{getTotalPrice().toLocaleString()} FCFA</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Helper Note for MVP */}
                <p className="text-xs text-muted-foreground text-center">
                    Note: Le paiement en ligne arrivera bientôt.
                </p>

                <Button className="w-full text-lg h-12 sticky bottom-4 shadow-xl" onClick={handleOrder} disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi...' : 'Commander'}
                </Button>
            </div>
        </div>
    )
}
