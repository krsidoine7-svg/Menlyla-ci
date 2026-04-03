'use client'

import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Trash2, ShoppingBag, Store, Zap, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { submitOrder } from '@/components/modules/cart/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CartPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const { items, removeItem, updateQuantity, getTotalPrice, clearCart, restaurantId, tableId, addActiveOrder } = useCartStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [diningType, setDiningType] = useState<'dine_in' | 'take_away'>('dine_in')

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 bg-[#080808] text-white">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-white/20" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight">Votre panier est vide</h1>
                <Link href={`/${slug}`}>
                    <Button className="bg-orange-600 hover:bg-orange-700 font-bold px-8 rounded-full">Explorer le menu</Button>
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
            dining_type: diningType
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
        <div className="min-h-screen bg-[#080808] p-4 pb-32 text-white">
            <header className="flex items-center gap-4 mb-10 sticky top-0 bg-[#080808]/80 backdrop-blur-md z-20 py-4 -mx-4 px-4 border-b border-white/5">
                <Link href={`/${slug}`}>
                    <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold italic tracking-tight">Mon Panier</h1>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">{items.length} articles sélectionnés</p>
                </div>
            </header>

            <div className="max-w-md mx-auto space-y-8">
                {/* Dining Type Selection */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Mode de consommation</h3>
                    <div className="grid grid-cols-2 gap-3 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                        <button 
                            onClick={() => setDiningType('dine_in')}
                            className={cn(
                                "flex flex-col items-center justify-center py-4 rounded-2xl gap-2 transition-all border border-transparent",
                                diningType === 'dine_in' 
                                    ? "bg-white text-black shadow-xl scale-100" 
                                    : "text-white/40 hover:bg-white/5 scale-95"
                            )}
                        >
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", diningType === 'dine_in' ? "bg-black text-white" : "bg-white/5")}>
                                <Store className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">Sur place</span>
                        </button>
                        <button 
                            onClick={() => setDiningType('take_away')}
                            className={cn(
                                "flex flex-col items-center justify-center py-4 rounded-2xl gap-2 transition-all border border-transparent",
                                diningType === 'take_away' 
                                    ? "bg-white text-black shadow-xl scale-100" 
                                    : "text-white/40 hover:bg-white/5 scale-95"
                            )}
                        >
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", diningType === 'take_away' ? "bg-black text-white" : "bg-white/5")}>
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">À emporter</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Votre sélection</h3>
                    {items.map((item) => (
                        <div key={item.dishId} className="group bg-white/5 border border-white/5 rounded-3xl p-5 hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="flex-1 space-y-1">
                                    <div className="font-bold text-lg text-white group-hover:text-orange-500 transition-colors">{item.name}</div>
                                    <div className="text-xs font-bold text-white/20 uppercase tracking-widest tabular-nums">{item.price.toLocaleString()} FCFA</div>
                                </div>
                                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-xl hover:bg-white/5 text-white/40"
                                        onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                    >-</Button>
                                    <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-xl hover:bg-white/5 text-white/40"
                                        onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                    >+</Button>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-2xl text-white/10 hover:text-red-500 hover:bg-red-500/10" 
                                    onClick={() => removeItem(item.dishId)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Total Commande</span>
                        <div className="text-3xl font-black text-white italic tracking-tighter">
                            {getTotalPrice().toLocaleString()} <span className="text-sm opacity-20 not-italic">FCFA</span>
                        </div>
                    </div>
                    
                    <div className="h-px bg-white/5 w-full" />
                    
                    <div className="flex items-center gap-3 text-orange-500">
                        <Zap className="h-4 w-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Paiement ultra-sécurisé via GeniusPay</p>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-30">
                    <Button 
                        className="w-full max-w-md mx-auto block text-lg font-black uppercase tracking-widest h-16 rounded-[2rem] bg-orange-600 hover:bg-orange-700 shadow-[0_20px_50px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:grayscale" 
                        onClick={handleOrder} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Transmission...</span>
                            </div>
                        ) : 'Confirmer la commande'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
