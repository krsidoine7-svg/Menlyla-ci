import * as React from 'react'
import { useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'
import { getDishesByIds } from '@/components/modules/menu/actions'
import { motion, AnimatePresence } from 'framer-motion'

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
    children?: React.ReactNode
}

export function AddToCartDrawer({ dish, restaurantId, currency = 'FCFA', upsellIds = [], children }: Props) {
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
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
            <DrawerTrigger asChild>
                {children || (
                    <Button size="icon" className="h-8 w-8 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 hover:scale-110 transition-all border-none">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] border-none bg-white md:max-w-[430px] md:mx-auto rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-[150] inset-x-4 bottom-6 md:bottom-0 md:inset-x-0 outline-none">
                <div className="mx-auto w-full max-h-[90vh] overflow-y-auto no-scrollbar relative">
                    {/* Top Accent */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200/50 rounded-full" />

                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="p-6 md:p-8 space-y-8"
                            >
                                <div className="space-y-2 mt-4">
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-slate-900">{dish.name}</h3>
                                        <p className="text-slate-500 font-medium mt-3 leading-relaxed italic line-clamp-2">
                                            {dish.description || "Une spécialité maison préparée pour vous."}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="text-4xl font-black text-orange-600 tabular-nums mt-4"
                                    >
                                        {Math.round(dish.price).toLocaleString()} <span className="text-sm font-black opacity-40 uppercase tracking-tighter">{currency}</span>
                                    </motion.div>
                                </div>

                                {/* Quantity Selector - Enhanced */}
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center justify-between bg-slate-50/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100/50 shadow-inner"
                                >
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-14 w-14 rounded-full border-none bg-white shadow-xl active:scale-90 transition-all text-slate-400"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-6 w-6" />
                                    </Button>
                                    <div className="text-center">
                                        <div className="text-5xl font-black tracking-tighter tabular-nums text-slate-900 group">
                                            {quantity}
                                        </div>
                                        <div className="text-[0.6rem] uppercase text-slate-400 font-black tracking-widest mt-1">
                                            UNITÉS
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-14 w-14 rounded-full border-none bg-orange-600 text-white shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] active:scale-90 transition-all"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="h-6 w-6" />
                                    </Button>
                                </motion.div>

                                {/* Upsells Section */}
                                {upsellDishes.length > 0 && (
                                    <div className="space-y-5">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                            <div className="h-1 w-4 bg-orange-500 rounded-full" />
                                            Accompagnements
                                        </h4>
                                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                                            {upsellDishes.map((u, idx) => (
                                                <motion.button
                                                    key={u.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                                    onClick={() => toggleUpsell(u.id)}
                                                    className={cn(
                                                        "flex-shrink-0 w-32 group relative text-left transition-all",
                                                        selectedUpsells.has(u.id) ? "translate-y-1" : "hover:translate-y-[-4px]"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "aspect-square rounded-[2rem] overflow-hidden mb-3 border-2 transition-all relative shadow-md group-hover:shadow-xl",
                                                        selectedUpsells.has(u.id) ? "border-orange-500 ring-4 ring-orange-500/10" : "border-transparent bg-slate-50"
                                                    )}>
                                                        {u.image_urls?.[0] ? (
                                                            <img src={u.image_urls[0]} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                                                <Plus className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                        {selectedUpsells.has(u.id) && (
                                                            <div className="absolute inset-0 bg-orange-600/20 backdrop-blur-[1px] flex items-center justify-center">
                                                                <div className="bg-orange-600 text-white rounded-full p-1.5 shadow-2xl">
                                                                    <Check className="h-5 w-5 stroke-[4]" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 line-clamp-1 px-1">{u.name}</p>
                                                    <p className="text-xs text-orange-600 font-black px-1">+{Math.round(u.price).toLocaleString()} <span className="opacity-50 text-[10px]">{currency}</span></p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 pb-6">
                                    <Button
                                        onClick={handleAdd}
                                        className="w-full text-lg h-20 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(234,88,12,0.4)] bg-orange-600 hover:bg-orange-700 font-black uppercase tracking-widest gap-4 active:scale-95 transition-all group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                        <ShoppingCart className="h-6 w-6 transition-transform group-hover:rotate-12" />
                                        <span className="relative z-10">
                                            Ajouter • {Math.round(totalPrice).toLocaleString()} {currency}
                                        </span>
                                    </Button>
                                    <DrawerClose asChild>
                                        <Button variant="ghost" className="w-full font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] hover:bg-transparent hover:text-slate-600">
                                            Fermer
                                        </Button>
                                    </DrawerClose>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

