'use client'

import * as React from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
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
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
    dish: {
        id: string
        name: string
        description?: string
        price: number
    }
    restaurantId: string
}

export function AddToCartDrawer({ dish, restaurantId }: Props) {
    const [open, setOpen] = React.useState(false)
    const [quantity, setQuantity] = React.useState(1)
    const addItem = useCartStore((state) => state.addItem)

    const handleAdd = () => {
        addItem({
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            quantity: quantity
        }, restaurantId)

        toast.success(`${quantity}x ${dish.name} ajouté !`)
        setOpen(false)
        setQuantity(1)
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full shadow-sm">
                    <Plus className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{dish.name}</DrawerTitle>
                        <DrawerDescription className="line-clamp-3">
                            {dish.description}
                        </DrawerDescription>
                        <div className="text-2xl font-bold text-primary mt-2">
                            {dish.price} FCFA
                        </div>
                    </DrawerHeader>

                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-4">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 text-center">
                                <div className="text-5xl font-bold tracking-tighter">
                                    {quantity}
                                </div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                    Quantité
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button onClick={handleAdd} className="w-full text-lg h-12">
                            Ajouter • {dish.price * quantity} FCFA
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
