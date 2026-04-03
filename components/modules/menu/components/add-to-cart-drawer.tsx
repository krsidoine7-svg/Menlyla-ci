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
        image_urls?: string[]
        is_featured?: boolean
        is_promo?: boolean
        is_vegetarian?: boolean
        is_spicy?: boolean
        is_gluten_free?: boolean
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

    // Determine subtitle from real data
    const tags = []
    if (dish.is_featured) tags.push("Spécialité")
    if (dish.is_promo) tags.push("Promo")
    if (dish.is_vegetarian) tags.push("Végétarien")
    if (dish.is_spicy) tags.push("Pimenté")
    if (dish.is_gluten_free) tags.push("Sans Gluten")
    
    const subtitle = tags.length > 0 ? tags.join(' • ') : "Sur le menu"

    return (
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
            <DrawerTrigger asChild>
                {children || (
                    <Button size="icon" className="h-8 w-8 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 hover:scale-110 transition-all border-none">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="border-none bg-[#121212] md:max-w-[430px] md:mx-auto rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] z-[150] inset-x-0 bottom-0 outline-none flex flex-col max-h-[92vh]">
                <AnimatePresence>
                    {open && (
                        <>
                            <div className="flex-1 overflow-y-auto no-scrollbar relative px-6 md:px-8 pb-32">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-8 pt-6"
                                >
                                    {/* Image floating */}
                                    {dish.image_urls?.[0] && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, type: "spring" }}
                                            className="w-40 h-40 mx-auto mb-4 relative z-10"
                                        >
                                            <img src={dish.image_urls[0]} alt={dish.name} className="w-full h-full object-cover rounded-[2rem] drop-shadow-[0_15px_30px_rgba(255,122,0,0.15)] border border-white/5" />
                                        </motion.div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="flex-1"
                                            >
                                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">{dish.name}</h3>
                                                <p className="text-orange-500 text-[10px] mt-1.5 uppercase font-black tracking-[0.2em]">{subtitle}</p>
                                            </motion.div>

                                            <motion.div
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="flex items-center bg-[#1A1A1A] rounded-full p-1 border border-white/5 shrink-0"
                                            >
                                                <button
                                                    className="h-8 w-8 rounded-full flex items-center justify-center text-white disabled:opacity-50 active:scale-95 transition-transform"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-6 text-center text-white font-black text-sm">{quantity}</span>
                                                <button
                                                    className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-[0_5px_15px_rgba(234,88,12,0.4)] active:scale-95 transition-transform"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="pt-2"
                                        >
                                            <h4 className="text-sm font-bold text-white mb-2">Description</h4>
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                                {dish.description || "Une spécialité maison préparée avec soin pour révéler toutes ses saveurs."}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Upsells Section */}
                                    {upsellDishes.length > 0 && (
                                        <div className="space-y-5">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                                                Accompagnements
                                            </h4>
                                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
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
                                                            "aspect-square rounded-[1.5rem] overflow-hidden mb-3 border transition-all relative shadow-md group-hover:shadow-lg",
                                                            selectedUpsells.has(u.id) ? "border-orange-500 ring-2 ring-orange-500/20" : "border-white/5 bg-[#1A1A1A]"
                                                        )}>
                                                            {u.image_urls?.[0] ? (
                                                                <img src={u.image_urls[0]} alt={u.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                                                                    <Plus className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                            {selectedUpsells.has(u.id) && (
                                                                <div className="absolute inset-0 bg-orange-600/20 backdrop-blur-[1px] flex items-center justify-center">
                                                                    <div className="bg-orange-600 text-white rounded-full p-1.5 shadow-2xl">
                                                                        <Check className="h-4 w-4 stroke-[4]" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] font-black uppercase tracking-tight text-white line-clamp-1 px-1">{u.name}</p>
                                                        <p className="text-xs text-orange-500 font-black px-1">+{Math.round(u.price).toLocaleString()} <span className="opacity-50 text-[10px]">{currency}</span></p>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Sticky Bottom Action Bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 px-6 py-6 pb-8 md:pb-6 pointer-events-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Montant Total</span>
                                        <span className="text-2xl font-black text-orange-500 tabular-nums leading-none">
                                            {Math.round(totalPrice).toLocaleString()} <span className="text-sm opacity-60 text-white">{currency}</span>
                                        </span>
                                    </div>
                                    <Button
                                        onClick={handleAdd}
                                        className="h-14 px-8 rounded-[1.5rem] shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] bg-orange-600 hover:bg-orange-500 font-black text-white active:scale-95 transition-all text-sm uppercase tracking-widest"
                                    >
                                        Ajouter
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </DrawerContent>
        </Drawer>
    )
}

