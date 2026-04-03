import * as React from 'react'
import { useState, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, Check, Star, Sparkles, Loader2 } from 'lucide-react'
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
import { getDishesByIds, getPossibleUpsells } from '@/components/modules/menu/actions'
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
    const [isLoadingUpsells, setIsLoadingUpsells] = useState(false)
    const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set())

    const addItem = useCartStore((state) => state.addItem)

    useEffect(() => {
        if (open) {
            setIsLoadingUpsells(true)
            if (upsellIds.length > 0) {
                getDishesByIds(upsellIds).then(res => {
                    setUpsellDishes(res)
                    setIsLoadingUpsells(false)
                })
            } else {
                // Intelligent fallback: get drinks or popular items
                getPossibleUpsells(restaurantId, dish.id).then(res => {
                    setUpsellDishes(res.slice(0, 5)) // Top 5
                    setIsLoadingUpsells(false)
                })
            }
        }
    }, [open, upsellIds, restaurantId, dish.id])

    const toggleUpsell = (id: string) => {
        const next = new Set(selectedUpsells)
        if (next.has(id)) {
            next.delete(id)
            toast.info("Retiré des suggestions")
        } else {
            next.add(id)
            toast.success("Ajouté aux suggestions !", {
                icon: <Sparkles className="h-4 w-4 text-orange-500" />,
            })
        }
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

        // Add selected upsells
        upsellDishes.filter(d => selectedUpsells.has(d.id)).forEach(u => {
            addItem({
                dishId: u.id,
                name: u.name,
                price: u.price,
                quantity: 1
            }, restaurantId)
        })

        toast.success(`${quantity}x ${dish.name} ajouté !`, {
            className: "bg-black text-white border-none rounded-3xl",
        })
        setOpen(false)
        setQuantity(1)
        setSelectedUpsells(new Set())
    }

    const totalUpsellsPrice = upsellDishes
        .filter(d => selectedUpsells.has(d.id))
        .reduce((sum, d) => sum + d.price, 0)

    const totalPrice = (dish.price * quantity) + totalUpsellsPrice

    const tags = []
    if (dish.is_featured) tags.push("⭐ Spécialité")
    if (dish.is_promo) tags.push("🔥 Promo")
    if (dish.is_vegetarian) tags.push("🥗 Végé")
    
    const subtitle = tags.length > 0 ? tags.join('  ') : "Exclusivité Maison"

    return (
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
            <DrawerTrigger asChild>
                {children || (
                    <Button size="icon" className="h-10 w-10 rounded-2xl shadow-xl bg-orange-600 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all border-none">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="border-none bg-[#080808] md:max-w-[430px] md:mx-auto rounded-t-[3rem] md:rounded-[3rem] shadow-[0_-20px_100px_rgba(0,0,0,0.8)] z-[200] outline-none flex flex-col max-h-[92vh]">
                <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full my-4 shrink-0" />
                <AnimatePresence>
                    {open && (
                        <>
                            <div className="flex-1 overflow-y-auto no-scrollbar relative px-6 md:px-8 pb-40">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className="space-y-10"
                                >
                                    {/* Hero Header */}
                                    <div className="pt-4 text-center space-y-6">
                                        {dish.image_urls?.[0] ? (
                                            <motion.div
                                                initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                                                className="w-56 h-56 mx-auto relative group"
                                            >
                                                <div className="absolute inset-0 bg-orange-600/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                                                <img src={dish.image_urls[0]} alt={dish.name} className="w-full h-full object-cover rounded-[3rem] drop-shadow-2xl border-4 border-white/5 relative z-10" />
                                            </motion.div>
                                        ) : (
                                            <div className="h-16 w-16 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                                                <Sparkles className="h-8 w-8 text-orange-500" />
                                            </div>
                                        )}

                                        <div className="space-y-3 px-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] bg-orange-600/10 text-orange-500 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] mb-3">
                                                    {subtitle}
                                                </span>
                                                <h3 className="text-3xl font-black tracking-tighter text-white italic leading-none">{dish.name}</h3>
                                            </div>
                                            
                                            <div className="flex justify-center pt-2">
                                                <div className="flex items-center bg-white/5 backdrop-blur-md rounded-3xl p-1.5 border border-white/5 gap-4">
                                                    <button
                                                        className="h-10 w-10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all font-black"
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-5 w-5" />
                                                    </button>
                                                    <span className="w-8 text-center text-white font-black text-xl italic">{quantity}</span>
                                                    <button
                                                        className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
                                                        onClick={() => setQuantity(quantity + 1)}
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white/[0.02] rounded-[2.5rem] p-6 border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                            <Star className="h-3 w-3" /> Note du Chef
                                        </div>
                                        <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                                            {dish.description || "Une recette artisanale préparée avec des produits frais pour une explosion de saveurs authentiques."}
                                        </p>
                                    </div>

                                    {/* Upsells */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 italic">
                                                Souvent acheté avec
                                            </h4>
                                            {isLoadingUpsells && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
                                        </div>

                                        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
                                            {upsellDishes.map((u, idx) => (
                                                <motion.div
                                                    key={u.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                                    className="flex-shrink-0 w-44"
                                                >
                                                    <div className={cn(
                                                        "group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-4 transition-all duration-500 hover:bg-white/[0.06] hover:border-orange-500/30",
                                                        selectedUpsells.has(u.id) ? "border-orange-600 bg-orange-600/[0.05] ring-2 ring-orange-600/20" : ""
                                                    )}>
                                                        {/* Recommendation Tag */}
                                                        {idx === 0 && (
                                                            <div className="absolute -top-2 left-4 z-20 bg-orange-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                                                                Recommandé
                                                            </div>
                                                        )}

                                                        <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 relative z-10 border border-white/5">
                                                            {u.image_urls?.[0] ? (
                                                                <img src={u.image_urls[0]} alt={u.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                                    <Sparkles className="h-6 w-6 text-orange-500/30" />
                                                                </div>
                                                            )}
                                                            <div className={cn(
                                                                "absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300",
                                                                selectedUpsells.has(u.id) ? "opacity-100" : "opacity-0"
                                                            )}>
                                                                <Check className="h-8 w-8 text-white stroke-[4px]" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 px-1">
                                                            <p className="text-xs font-black uppercase tracking-tight text-white line-clamp-1 italic">{u.name}</p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] text-orange-500 font-black">+{Math.round(u.price).toLocaleString()} <span className="opacity-40 uppercase text-[8px]">XOF</span></p>
                                                                <button 
                                                                    onClick={() => toggleUpsell(u.id)}
                                                                    className={cn(
                                                                        "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                                                                        selectedUpsells.has(u.id) ? "bg-orange-600 text-white" : "bg-white/10 text-white/40 hover:bg-white/20"
                                                                    )}
                                                                >
                                                                    {selectedUpsells.has(u.id) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Floating Action Bar */}
                            <div className="absolute bottom-6 left-6 right-6 z-[201] pointer-events-none">
                                <div className="bg-[#121212]/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 pointer-events-auto">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Sélection</p>
                                        <div className="text-2xl font-black text-white italic tracking-tighter">
                                            {Math.round(totalPrice).toLocaleString()} <span className="text-xs opacity-20 not-italic ml-1">XOF</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAdd}
                                        className="h-16 px-10 rounded-[1.8rem] shadow-2xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all group gap-2"
                                    >
                                        <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        Confirmer l'ajout
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

