'use client'

import * as React from 'react'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getDishesByIds } from '@/components/modules/menu/actions'

type Props = {
    dish: {
        id: string
        name: string
        description?: string
        price: number
    }
    restaurantId: string
    currency?: string
    upsellIds?: string[]
}

export function AddToCartDrawer({ dish, restaurantId, currency = 'FCFA', upsellIds = [] }: Props) {
    const [open, setOpen] = React.useState(false)
    const [quantity, setQuantity] = React.useState(1)
    const [upsellDishes, setUpsellDishes] = useState<any[]>([])
    const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set())

    const addItem = useCartStore((state) => state.addItem)

    useEffect(() => {
        if (open && upsellIds.length > 0) {
            getDishesByIds(upsellIds).then(setUpsellDishes)
        }
    }, [open, upsellIds])

    const toggleUpsell = (id: string) => {
        const next = new Set(selectedUpsells)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedUpsells(next)
    }

    const handleAdd = () => {
        // Add main dish
        addItem({
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            quantity: quantity
        }, restaurantId)

        // Add selected upsells (quantity 1 for each)
        upsellDishes.filter(d => selectedUpsells.has(d.id)).forEach(u => {
            addItem({
                dishId: u.id,
                name: u.name,
                price: u.price,
                quantity: 1
            }, restaurantId)
        })

        toast.success(`${quantity}x ${dish.name} ajouté !`)
        setOpen(false)
        setQuantity(1)
        setSelectedUpsells(new Set())
    }

    const totalUpsellsPrice = upsellDishes
        .filter(d => selectedUpsells.has(d.id))
        .reduce((sum, d) => sum + d.price, 0)

    const totalPrice = (dish.price * quantity) + totalUpsellsPrice

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full shadow-sm hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-black">{dish.name}</DrawerTitle>
                        <DrawerDescription className="line-clamp-2">
                            {dish.description}
                        </DrawerDescription>
                        <div className="text-3xl font-black text-orange-600 mt-2">
                            {Math.round(dish.price).toLocaleString()} <span className="text-sm font-bold opacity-70">{currency}</span>
                        </div>
                    </DrawerHeader>

                    <div className="px-4 space-y-8 pb-8">
                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center space-x-6 bg-muted/30 p-4 rounded-[2rem]">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-full border-none bg-background shadow-sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-6 w-6" />
                            </Button>
                            <div className="flex-1 text-center">
                                <div className="text-5xl font-black tracking-tighter tabular-nums">
                                    {quantity}
                                </div>
                                <div className="text-[0.6rem] uppercase text-muted-foreground font-black tracking-widest mt-1">
                                    QUANTITÉ
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-full border-none bg-background shadow-sm text-orange-600"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Upsells Section */}
                        {upsellDishes.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-orange-500" /> S'accompagne bien avec...
                                </h4>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {upsellDishes.map((u) => (
                                        <button
                                            key={u.id}
                                            onClick={() => toggleUpsell(u.id)}
                                            className={cn(
                                                "flex-shrink-0 w-32 group relative text-left transition-all",
                                                selectedUpsells.has(u.id) ? "scale-95" : "hover:scale-105"
                                            )}
                                        >
                                            <div className={cn(
                                                "aspect-square rounded-2xl overflow-hidden mb-2 border-2 transition-colors relative",
                                                selectedUpsells.has(u.id) ? "border-orange-500 shadow-lg shadow-orange-100" : "border-transparent bg-muted"
                                            )}>
                                                {u.image_urls?.[0] ? (
                                                    <img src={u.image_urls[0]} alt={u.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                                        <Plus className="h-8 w-8" />
                                                    </div>
                                                )}
                                                {selectedUpsells.has(u.id) && (
                                                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                                        <div className="bg-orange-500 text-white rounded-full p-1 shadow-lg">
                                                            <Check className="h-4 w-4 stroke-[4]" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold line-clamp-1">{u.name}</p>
                                            <p className="text-[10px] text-orange-600 font-black">+{Math.round(u.price).toLocaleString()} {currency}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="pt-0">
                        <Button onClick={handleAdd} className="w-full text-lg h-14 rounded-2xl shadow-xl shadow-orange-100 bg-orange-600 hover:bg-orange-700 font-black">
                            Ajouter • {Math.round(totalPrice).toLocaleString()} {currency}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="font-bold text-muted-foreground">Annuler</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
