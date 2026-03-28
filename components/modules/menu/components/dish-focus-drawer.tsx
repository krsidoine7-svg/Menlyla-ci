import * as React from 'react'
import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, Check, X, Star, Flame, Leaf, FlameKindling, Wheat, Share2, Heart, Clock, MapPin } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { getDishesByIds } from '@/components/modules/menu/actions'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from './like-button'
import { FavoriteButton } from './favorite-button'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
    dish: any
    restaurant: any
    children?: React.ReactNode
}

export function DishFocusDrawer({ dish, restaurant, children }: Props) {
    const [open, setOpen] = React.useState(false)
    const [quantity, setQuantity] = React.useState(1)
    const [upsellDishes, setUpsellDishes] = useState<any[]>([])
    const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set())

    const addItem = useCartStore((state) => state.addItem)
    const currency = restaurant.currency || 'FCFA'
    const upsellIds = dish.upsell_ids || []

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
        addItem({
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            quantity: quantity
        }, restaurant.id)

        upsellDishes.filter(d => selectedUpsells.has(d.id)).forEach(u => {
            addItem({
                dishId: u.id,
                name: u.name,
                price: u.price,
                quantity: 1
            }, restaurant.id)
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
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
            <DrawerTrigger asChild>
                {children || (
                    <Button size="icon" className="h-10 w-10 rounded-full bg-orange-600 text-white shadow-lg">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="max-h-[95vh] h-[95vh] border-none bg-[#F9F9F9] md:max-w-[430px] md:mx-auto rounded-t-[2.5rem] shadow-2xl z-[150] inset-x-0 bottom-0 outline-none overflow-hidden flex flex-col">

                {/* 1. Header Section with Image - Fixed Height */}
                <div className="relative w-full h-[320px] shrink-0 bg-[#F9F9F9]">

                    {/* Top Controls */}
                    <div className="absolute top-6 left-6 z-50">
                        <DrawerClose asChild>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-900 hover:bg-slate-50">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                    <div className="absolute top-6 right-6 z-50">
                        <LikeButton dishId={dish.id} initialLikes={dish.likes_count} />
                    </div>

                    {/* Central Image */}
                    <div className="absolute inset-0 flex items-center justify-center top-8 z-40 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="w-72 h-72 rounded-full relative"
                        >
                            {/* Decorative blurred shadow/glow behind image */}
                            <div className="absolute inset-8 bg-orange-500/20 blur-[50px] rounded-full" />

                            <img
                                src={dish.image_urls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"}
                                alt={dish.name}
                                className="relative w-full h-full object-cover rounded-full mix-blend-multiply drop-shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* 2. Content Body (Curved overlap) */}
                <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-16 pt-12 px-8 pb-32 overflow-y-auto no-scrollbar relative z-30 flex flex-col">

                    {/* Rating & Quantity Row */}
                    <div className="absolute top-0 left-0 right-0 -translate-y-1/2 px-8 flex items-center justify-between pointer-events-none z-50">
                        <div className="bg-white shadow-lg shadow-slate-100 rounded-full py-2 px-4 flex items-center gap-2 pointer-events-auto">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-black text-slate-900 text-sm">5.0</span>
                        </div>

                        <div className="bg-[#FFC107] rounded-full py-2 px-4 flex items-center gap-4 shadow-lg shadow-orange-200 pointer-events-auto">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-900 hover:scale-110 transition-transform">
                                <Minus className="h-4 w-4 stroke-[3]" />
                            </button>
                            <span className="font-black text-slate-900 text-sm w-4 text-center">{quantity.toString().padStart(2, '0')}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-slate-900 hover:scale-110 transition-transform">
                                <Plus className="h-4 w-4 stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    {/* Title & Time */}
                    <div className="flex items-start justify-between gap-4 mb-2 mt-4">
                        <h2 className="text-2xl font-black text-slate-900 leading-tight flex-1">{dish.name}</h2>
                        <div className="flex items-center gap-1 text-slate-400 shrink-0 mt-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-bold">10-15 Min</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 font-medium leading-relaxed text-xs mb-8">
                        {dish.description || "Un mélange équilibré et savoureux, parfait pour une expérience culinaire mémorable."}
                    </p>

                    {/* Upsells (Toppings) */}
                    {upsellDishes.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900">Accompagnements</h3>
                                <button className="text-[10px] font-bold text-red-500 uppercase" onClick={() => setSelectedUpsells(new Set())}>Effacer</button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                                {upsellDishes.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => toggleUpsell(u.id)}
                                        className="flex flex-col items-center gap-2 shrink-0 group"
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center p-1 transition-all border relative overflow-hidden",
                                            selectedUpsells.has(u.id) ? "bg-white border-white shadow-xl scale-105" : "bg-slate-50 border-slate-50"
                                        )}>
                                            <img src={u.image_urls?.[0]} className="w-full h-full object-cover rounded-xl mix-blend-multiply" />
                                            {selectedUpsells.has(u.id) && (
                                                <div className="absolute top-1 right-1 h-4 w-4 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                                    <Check className="h-2.5 w-2.5" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Footer Price & Action */}
                <div className="absolute bottom-0 inset-x-0 bg-white p-6 pb-8 md:pb-6 flex items-center justify-between gap-6 border-t border-slate-50/50">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400">Prix Total</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-yellow-500">$</span>
                            <span className="text-3xl font-black text-slate-900">{Math.round(totalPrice).toLocaleString()}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleAdd}
                        className="h-14 px-8 rounded-[2rem] bg-black hover:bg-slate-800 text-white font-black text-sm shadow-xl flex items-center gap-3 active:scale-95 transition-all"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Ajouter au panier</span>
                    </Button>
                </div>

            </DrawerContent>
        </Drawer>
    )
}
