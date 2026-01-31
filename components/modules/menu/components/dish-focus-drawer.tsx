import * as React from 'react'
import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, Check, X, Star, Flame, Leaf, FlameKindling, Wheat, Share2, Heart } from 'lucide-react'
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
            <DrawerContent className="max-h-[94vh] border-none bg-white md:max-w-[500px] md:mx-auto rounded-t-[3.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)]">
                <div className="mx-auto w-full h-full flex flex-col overflow-hidden relative">
                    {/* Decorative Top Handle Background */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200/50 rounded-full z-50" />

                    <AnimatePresence>
                        {open && (
                            <div className="mx-auto w-full h-full flex flex-col overflow-hidden">
                                {/* Immersive Header Image with WOW Animation */}
                                <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden">
                                    <motion.div
                                        initial={{ scale: 1.2, filter: 'blur(10px)' }}
                                        animate={{ scale: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="w-full h-full"
                                    >
                                        <img
                                            src={dish.image_urls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"}
                                            alt={dish.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>

                                    {/* Advanced Glass Backdrop on bottom part */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Floating Buttons in Image - Glassmorphism */}
                                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                                        <DrawerClose asChild>
                                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                                <Button variant="secondary" size="icon" className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-white hover:bg-white/30 transition-all shadow-xl">
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </motion.div>
                                        </DrawerClose>
                                        <div className="flex gap-3">
                                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                                <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-1 shadow-xl">
                                                    <FavoriteButton dishId={dish.id} />
                                                </div>
                                            </motion.div>
                                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                                <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-1 text-white shadow-xl">
                                                    <LikeButton dishId={dish.id} initialLikes={dish.likes_count || 0} />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Title Overlay with staggered animation */}
                                    <div className="absolute bottom-10 left-8 right-8 text-white z-20">
                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.6 }}
                                            className="flex gap-2 mb-4"
                                        >
                                            {dish.is_featured && (
                                                <Badge className="bg-orange-500 text-white border-none py-1.5 px-4 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/30">
                                                    <Star className="h-3 w-3 mr-1.5 fill-current" /> Spécial
                                                </Badge>
                                            )}
                                            {dish.is_promo && (
                                                <Badge className="bg-red-500 text-white border-none py-1.5 px-4 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/30">
                                                    <Flame className="h-3 w-3 mr-1.5 fill-current" /> Promo
                                                </Badge>
                                            )}
                                        </motion.div>
                                        <motion.h2
                                            initial={{ y: 40, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5, duration: 0.6 }}
                                            className="text-3xl font-black uppercase tracking-tight leading-[0.9] drop-shadow-2xl"
                                        >
                                            {dish.name}
                                        </motion.h2>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="flex-1 overflow-y-auto no-scrollbar px-8 py-6 space-y-6"
                                >
                                    {/* Tags & Price Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            {dish.is_vegetarian && (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="h-12 w-12 rounded-[1.25rem] bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shadow-sm transition-transform active:scale-90">
                                                        <Leaf className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-green-700">Végé</span>
                                                </div>
                                            )}
                                            {dish.is_spicy && (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="h-12 w-12 rounded-[1.25rem] bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm transition-transform active:scale-90">
                                                        <FlameKindling className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-red-700">Pimenté</span>
                                                </div>
                                            )}
                                            {dish.is_gluten_free && (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="h-12 w-12 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm transition-transform active:scale-90">
                                                        <Wheat className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-blue-700">Sans Gluten</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {dish.old_price && (
                                                <div className="text-xs text-slate-300 line-through font-bold mb-[-2px]">{Math.round(dish.old_price).toLocaleString()} {currency}</div>
                                            )}
                                            <div className="text-2xl font-black text-orange-600 tabular-nums">
                                                {Math.round(dish.price).toLocaleString()} <span className="text-xs font-black opacity-40">{currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description with Glass effect background wrap */}
                                    <div className="space-y-3 relative">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Expérience Culinaire</h4>
                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-orange-100 rounded-full" />
                                            <p className="text-slate-600 font-bold leading-relaxed italic text-lg px-2">
                                                "{dish.description || "Une création artisanale préparée avec des ingrédients frais du jour pour une explosion de saveurs en bouche."}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Selector - Enhanced Style */}
                                    <div className="flex items-center justify-between bg-slate-50/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-100/50 shadow-sm">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ajustement</h4>
                                            <p className="text-xs font-black text-slate-900">Quantité</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 rounded-2xl border-none bg-white shadow-lg active:scale-95 transition-all text-slate-400 hover:text-orange-600"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xl font-black tabular-nums w-6 text-center text-slate-900">{quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 rounded-2xl border-none bg-orange-600 text-white shadow-[0_5px_15px_-5px_rgba(234,88,12,0.4)] active:scale-95 transition-all hover:bg-orange-700"
                                                onClick={() => setQuantity(quantity + 1)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Upsells Section with cascade */}
                                    {upsellDishes.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Pour accompagner</h4>
                                                <Badge variant="outline" className="rounded-full border-orange-100 bg-orange-50/50 text-orange-600 font-black text-[9px] px-3">CONSEILLÉ</Badge>
                                            </div>
                                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                                                {upsellDishes.map((u, idx) => (
                                                    <motion.button
                                                        key={u.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.8 + (idx * 0.1) }}
                                                        onClick={() => toggleUpsell(u.id)}
                                                        className={cn(
                                                            "flex-shrink-0 w-32 group relative text-left transition-all",
                                                            selectedUpsells.has(u.id) ? "scale-95" : "hover:translate-y-[-4px]"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "aspect-[4/5] rounded-[2rem] overflow-hidden mb-2 border-2 transition-all relative shadow-lg group-hover:shadow-2xl",
                                                            selectedUpsells.has(u.id) ? "border-orange-500 shadow-orange-200" : "border-transparent bg-slate-50 group-hover:border-slate-200"
                                                        )}>
                                                            {u.image_urls?.[0] ? (
                                                                <img src={u.image_urls[0]} alt={u.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200 uppercase font-black text-[8px] leading-tight text-center px-4">Image bientôt disponible</div>
                                                            )}
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <p className="text-[9px] text-white font-black italic">Ajouter ?</p>
                                                            </div>
                                                            {selectedUpsells.has(u.id) && (
                                                                <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                                    <div className="bg-orange-600 text-white rounded-full p-1.5 shadow-2xl scale-110">
                                                                        <Check className="h-4 w-4 stroke-[4]" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] font-black uppercase tracking-tight line-clamp-1 mb-0.5 px-2 text-slate-900">{u.name}</p>
                                                        <p className="text-xs text-orange-600 font-black px-2">+{Math.round(u.price).toLocaleString()} <span className="text-[9px] opacity-60">{currency}</span></p>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Footer with Main Action */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]"
                                >
                                    <Button
                                        onClick={handleAdd}
                                        className="w-full text-base h-14 py-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(234,88,12,0.4)] bg-orange-600 hover:bg-orange-700 font-black uppercase tracking-[0.1em] gap-3 transition-all active:scale-95 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                        <span className="relative z-10 flex items-center gap-2 text-sm">
                                            Ajouter • {Math.round(totalPrice).toLocaleString()} <span className="text-[10px] opacity-80">{currency}</span>
                                        </span>
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

