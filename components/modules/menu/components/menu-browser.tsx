'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, Star, Flame, Leaf, FlameKindling, Wheat, UtensilsCrossed, Trophy, Heart, Share2, Bookmark, Receipt, User, History, MapPin, Phone, Mail, LogOut, Loader2, ChevronRight, Clock, Calendar, Instagram, Twitter, MessageCircle, Facebook, Video, Wifi, CreditCard, Navigation, ShieldCheck, StarHalf, Plus, Copy, Check, MessageSquare } from 'lucide-react'
import { AddToCartDrawer } from '@/components/modules/menu/components/add-to-cart-drawer'
import { LikeButton } from '@/components/modules/menu/components/like-button'
import { EventFocusDrawer } from '@/components/modules/menu/components/event-focus-drawer'
import { FavoriteButton } from '@/components/modules/menu/components/favorite-button'
import { toast } from 'sonner'
import { useFavoritesStore } from '@/lib/store/favorites'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui-store'
import { cn, formatOrderId } from '@/lib/utils'
import { getOrdersByIds } from '../actions'
import { createClient } from '@/lib/supabase/client'

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'À ne pas manquer'
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    } catch {
        return dateStr
    }
}

import { OwnerPassportSection } from '@/components/modules/passport/owner-passport-section'

type Props = {
    categories: any[]
    restaurant: any
    ownerPassport?: any | null
}

export function MenuBrowser({ categories, restaurant, ownerPassport }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const { activeTab: activeFilter, setActiveTab: setActiveFilter } = useUIStore()
    const { dishIds: favoriteIds } = useFavoritesStore()
    const searchRef = useMemo(() => ({ current: null as HTMLInputElement | null }), [])



    // Focus search when tab is 'search'
    useEffect(() => {
        if (activeFilter === 'search') {
            setTimeout(() => {
                const searchInput = document.getElementById('menu-search-input')
                if (searchInput) {
                    searchInput.focus()
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 100)
        }
    }, [activeFilter])

    const filteredCategories = useMemo(() => {
        if (!categories) return []

        return categories.map(cat => {
            const dishes = cat.dishes?.filter((dish: any) => {
                if (!dish.is_available) return false

                const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dish.description?.toLowerCase().includes(searchQuery.toLowerCase())

                if (!matchesSearch) return false

                if (activeFilter === 'featured') return dish.is_featured
                if (activeFilter === 'favorites') return favoriteIds.includes(dish.id)
                if (activeFilter === 'promo') return dish.is_promo
                if (activeFilter === 'vegetarian') return dish.is_vegetarian
                if (activeFilter === 'spicy') return dish.is_spicy
                if (activeFilter === 'gluten_free') return dish.is_gluten_free

                return true
            })

            return { ...cat, dishes }
        }).filter(cat => cat.dishes && cat.dishes.length > 0)
    }, [categories, searchQuery, activeFilter])

    const popularDishes = useMemo(() => {
        if (!categories) return []
        const allDishes = categories.flatMap(cat => cat.dishes || [])
        return allDishes
            .filter(d => d.is_available && (d.likes_count || 0) > 0)
            .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
            .slice(0, 5)
    }, [categories])

    const toggleFilter = (filter: string) => {
        setActiveFilter(activeFilter === filter ? null : filter)
    }

    const { activeOrderIds } = useCartStore()

    return (
        <div className="flex flex-col gap-6">
            {/* Contextual Header: Only show search/filters if NOT in a special view */}
            {!['orders', 'profile', 'favorites'].includes(activeFilter || '') && (
                <div className="sticky top-16 z-20 bg-background/60 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-white/10 shadow-sm support-[backdrop-filter]:bg-background/60">
                    {activeFilter === 'search' && (
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="menu-search-input"
                                placeholder="Rechercher un plat..."
                                className="pl-10 rounded-full bg-slate-100 border-none h-11 placeholder:text-slate-500 placeholder:font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <FilterBadge
                            active={activeFilter === 'promo'}
                            onClick={() => toggleFilter('promo')}
                            icon={<Flame className="h-3 w-3" />}
                            label="Promos"
                            color="bg-red-500"
                        />
                        <FilterBadge
                            active={activeFilter === 'featured'}
                            onClick={() => toggleFilter('featured')}
                            icon={<Star className="h-3 w-3" />}
                            label="Spéciaux"
                            color="bg-slate-900"
                        />
                        <FilterBadge
                            active={activeFilter === 'vegetarian'}
                            onClick={() => toggleFilter('vegetarian')}
                            icon={<Leaf className="h-3 w-3" />}
                            label="Végé"
                            color="bg-green-600"
                        />
                        <FilterBadge
                            active={activeFilter === 'spicy'}
                            onClick={() => toggleFilter('spicy')}
                            icon={<FlameKindling className="h-3 w-3" />}
                            label="Pimenté"
                            color="bg-red-700"
                        />
                        <FilterBadge
                            active={activeFilter === 'gluten_free'}
                            onClick={() => toggleFilter('gluten_free')}
                            icon={<Wheat className="h-3 w-3" />}
                            label="Sans Gluten"
                            color="bg-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* View Indicator for special sections */}
            {activeFilter && ['orders', 'profile', 'favorites'].includes(activeFilter) && (
                <div className="flex items-center justify-between py-2 border-b border-orange-100 mb-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                            {activeFilter === 'orders' ? <Receipt className="h-5 w-5" /> :
                                activeFilter === 'profile' ? <User className="h-5 w-5" /> :
                                    <Heart className="h-5 w-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">
                                {activeFilter === 'orders' ? 'Suivi Cuisine' :
                                    activeFilter === 'profile' ? 'Mon Passeport' :
                                        'Mes Favoris'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                {activeFilter === 'orders' ? 'Vos commandes en cours' :
                                    activeFilter === 'profile' ? 'Vos informations' :
                                        'Vos plats préférés'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full font-bold text-xs text-orange-600 hover:bg-orange-50"
                        onClick={() => { window.location.hash = ''; setActiveFilter(null); }}
                    >
                        Fermer
                    </Button>
                </div>
            )}

            <main className="space-y-10 pb-20">
                {activeFilter === 'orders' ? (
                    <OrdersView activeOrderIds={activeOrderIds} currency={restaurant.currency} />
                ) : activeFilter === 'profile' ? (
                    <ProfileView restaurant={restaurant} ownerPassport={ownerPassport} />
                ) : (
                    <>
                        {/* Popular Section (only show if no search/filter) */}
                        {!searchQuery && !activeFilter && popularDishes.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
                                    <h2 className="text-xl font-black uppercase tracking-wider">Les Incontournables</h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4 -mx-4">
                                    {popularDishes.map((dish, idx) => (
                                        <motion.div
                                            key={`pop-${dish.id}`}
                                            className="flex-shrink-0 w-[70%] group relative"
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: false }}
                                            transition={{ duration: 0.6, delay: idx * 0.15, type: "spring" }}
                                        >
                                            <div className="absolute top-3 left-3 z-10">
                                                <Badge className="bg-white/90 backdrop-blur-md text-orange-600 border-none shadow-sm font-black text-[10px] uppercase">
                                                    <Heart className="h-3 w-3 mr-1 fill-orange-600" /> Top {dish.likes_count}
                                                </Badge>
                                            </div>
                                            <DishCard dish={dish} restaurant={restaurant} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Events Section in Menu */}
                        <EventsSection settings={restaurant.settings} />

                        {filteredCategories.map((cat) => (
                            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-48">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-1 w-8 bg-orange-500 rounded-full" />
                                    <h2 className="text-xl font-black uppercase tracking-wider">{cat.name}</h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar px-4 -mx-4">
                                    {cat.dishes.map((dish: any, idx: number) => (
                                        <motion.div
                                            key={dish.id}
                                            className="min-w-[calc(50%-0.5rem)] snap-center"
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                            viewport={{ once: false }}
                                            transition={{
                                                duration: 0.5,
                                                delay: idx * 0.1,
                                                type: "spring",
                                                stiffness: 100
                                            }}
                                            whileHover={{ y: -5 }}
                                        >
                                            <DishCard dish={dish} restaurant={restaurant} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {filteredCategories.length === 0 && (
                            <div className="text-center py-20 px-6">
                                <div className="opacity-30 mb-4">
                                    {activeFilter === 'favorites' ? (
                                        <Heart className="h-16 w-16 mx-auto" />
                                    ) : (
                                        <UtensilsCrossed className="h-16 w-16 mx-auto" />
                                    )}
                                </div>
                                <h3 className="text-xl font-black uppercase mb-2">
                                    {activeFilter === 'favorites' ? "Aucun favori" : "Aucun résultat"}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {activeFilter === 'favorites'
                                        ? "Cliquez sur le petit cœur des plats pour les retrouver ici plus tard !"
                                        : "Aucun plat ne correspond à vos critères de recherche."}
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter(null); window.location.hash = '' }}
                                    className="px-6 py-3 bg-orange-100 text-orange-600 rounded-full font-black uppercase text-xs tracking-widest hover:bg-orange-200 transition-colors"
                                >
                                    Explorer le menu
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

function OrdersView({ activeOrderIds, currency }: { activeOrderIds: string[], currency: string }) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true)
            const data = await getOrdersByIds(activeOrderIds)
            setOrders(data)
            setLoading(false)
        }
        fetchOrders()

        if (activeOrderIds.length === 0) return
        
        const supabase = createClient()
        const channel = supabase
            .channel('customer-orders-view')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    table: 'orders',
                    schema: 'public',
                },
                (payload: any) => {
                    if (activeOrderIds.includes(payload.new.id)) {
                        setOrders(current => {
                            // Check if status changed
                            const existing = current.find(o => o.id === payload.new.id)
                            if (existing && existing.status !== payload.new.status) {
                                return current.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
                            }
                            return current
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeOrderIds])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin" />
                    <Receipt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-orange-600" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-black uppercase tracking-widest text-orange-950">Vérification...</p>
                    <p className="text-xs text-muted-foreground font-bold">Nous récupérons vos dernières commandes</p>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 px-8 space-y-6">
                <div className="h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                    <History className="h-10 w-10 text-orange-200" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase text-orange-950">Aucune commande</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        C'est ici que vous pourrez suivre vos commandes en temps réel dès qu'elles seront envoyées en cuisine.
                    </p>
                </div>
                <Button
                    className="rounded-full h-12 px-8 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 font-black uppercase text-xs tracking-widest"
                    onClick={() => { window.location.hash = ''; window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                    Voir le menu
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="relative px-1">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-orange-600 rounded-r-full" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-orange-950">Suivi Cuisine</h2>
                <p className="text-xs font-bold text-orange-600/60 uppercase tracking-widest leading-none mt-1">Vos plats en préparation</p>
            </div>

            <div className="grid gap-6">
                {orders.map((order) => {
                    const statusConfig = {
                        pending: { label: 'Reçue', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
                        preparing: { label: 'En Cuisine', icon: Flame, color: 'bg-orange-500 text-white shadow-orange-500/30' },
                        ready: { label: 'Prête !', icon: Star, color: 'bg-green-600 text-white shadow-green-600/30' },
                        completed: { label: 'Servie', icon: Receipt, color: 'bg-slate-900 text-white' }
                    }[order.status as string] || { label: order.status, icon: Clock, color: 'bg-slate-100 text-slate-600' }

                    return (
                        <div key={order.id} className="group relative bg-white border border-orange-100 rounded-[2.5rem] p-6 shadow-[0_15px_40px_-15px_rgba(234,88,12,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(234,88,12,0.15)] transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1.5">
                                    <Badge variant="outline" className="rounded-full border-orange-100 bg-orange-50/50 text-orange-600 font-black text-[10px] px-3">
                                        #{formatOrderId(order.id, order.created_at)}
                                    </Badge>
                                    <div className="text-xl font-black uppercase tracking-tight text-slate-900">
                                        {order.tables?.name || 'Sur place'}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <Badge className={cn(
                                        "rounded-full font-black text-[10px] uppercase py-1.5 px-4 flex items-center gap-1.5 border-0",
                                        statusConfig.color
                                    )}>
                                        <statusConfig.icon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 py-4 border-t border-dashed border-orange-100">
                                {order.order_items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-sm">
                                                {item.quantity}
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover/item:text-orange-600 transition-colors">
                                                {item.dishes?.name}
                                            </span>
                                        </div>
                                        <span className="tabular-nums font-black text-slate-400 text-sm italic">
                                            {(item.unit_price * item.quantity).toLocaleString()} <small className="not-italic text-[10px] opacity-70">{currency}</small>
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total payé</span>
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {order.total_amount.toLocaleString()} <span className="text-sm font-bold opacity-30">{currency}</span>
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


function ProfileView({ restaurant, ownerPassport }: { restaurant: any, ownerPassport?: any | null }) {
    const socialLinks = restaurant.social_links || {}
    const settings = restaurant.settings || {}

    // Default to true if setting is not explicitly false
    const showHours = settings.show_hours !== false
    const showGps = settings.show_gps !== false
    const showWifi = settings.show_wifi !== false
    const showPayments = settings.show_payments !== false
    const showLabels = settings.show_labels !== false
    const showRating = settings.show_rating !== false

    const SOCIAL_CONFIG: Record<string, { icon: any, color: string, prefix: string }> = {
        whatsapp: { icon: MessageCircle, color: 'text-green-600 bg-green-50/50', prefix: 'https://wa.me/' },
        instagram: { icon: Instagram, color: 'text-pink-600 bg-pink-50/50', prefix: 'https://instagram.com/' },
        facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50/50', prefix: 'https://facebook.com/' },
        tiktok: { icon: Video, color: 'text-black bg-slate-50/50', prefix: 'https://tiktok.com/@' },
    }

    // --- OPENING HOURS LOGIC ---
    const now = new Date()
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toLowerCase()
    
    const hours = settings.hours || {}
    const isBreak = hours.is_on_break || hours.is_closed
    const schedule = hours.schedule || hours.advanced || {}
    const todaySchedule = schedule[today] || { open: '09:00', close: '22:00', closed: false }

    const isOpen = useMemo(() => {
        if (isBreak || todaySchedule.closed) return false
        
        try {
            const currentTime = now.getHours() * 60 + now.getMinutes()
            const [openH, openM] = (todaySchedule.open || '00:00').split(':').map(Number)
            const [closeH, closeM] = (todaySchedule.close || '23:59').split(':').map(Number)
            
            const openTime = openH * 60 + (openM || 0)
            const closeTime = closeH * 60 + (closeM || 0)
            
            return currentTime >= openTime && currentTime <= closeTime
        } catch (e) {
            return true // Fallback if time format is invalid
        }
    }, [isBreak, todaySchedule, now])

    const [showAllHours, setShowAllHours] = useState(false)
    const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const DAY_LABELS: Record<string, string> = {
        monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi',
        friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
    }

    return (
        <div className="space-y-8 pb-32 animate-in fade-in zoom-in duration-500">
            {/* ... hero ... */}
            <div className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl group transition-all duration-700 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-slate-900 animate-pulse bg-opacity-10" />
                <img
                    src={restaurant.banner_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800"}
                    alt="Banner"
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Content */}
                <div className="absolute top-6 right-6">
                    {showRating && (
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-black text-white">4.8</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/30 blur-lg rounded-full animate-pulse" />
                            <div className="h-20 w-20 relative rounded-[1.5rem] border-2 border-white/50 bg-white/20 backdrop-blur-md shadow-2xl overflow-hidden p-1 rotate-[-6deg] transition-all duration-500 group-hover:rotate-0">
                                <img
                                    src={restaurant.logo_url || "https://images.unsplash.com/photo-1595113340153-23a3341d6d13?q=80&w=100"}
                                    alt="Logo"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="text-white space-y-1">
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none decoration-orange-500/50">{restaurant.name}</h2>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] pl-1"> Official Space</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LOYALTY CARD (Holographic Effect) --- */}
            {settings.show_passport === true && (
                <div className="perspective-1000 group/card relative z-10 -mt-12 mx-4">
                    <div className="relative w-full aspect-[1.586] rounded-[2.5rem] transition-all duration-700 transform-style-3d shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] hover:rotate-x-6 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8">
                        {/* Card Background with Mesh Gradient */}
                        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-slate-950 border border-white/10">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-orange-500/30 via-purple-600/20 to-blue-600/30 blur-[80px] animate-mesh opacity-60" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                        </div>

                        {/* Card Content */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Membre Premium</p>
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tighter">Passeport Fidélité</h3>
                                </div>
                                <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
                                    <span>Progression</span>
                                    <span>3 / {settings.passport_goal || 10}</span>
                                </div>

                                {/* Stamps Flex */}
                                <div className="flex justify-between gap-1">
                                    {Array.from({ length: settings.passport_goal || 10 }).map((_, i) => (
                                        <div key={i} className={cn(
                                            "h-2 flex-1 rounded-full transition-all duration-500",
                                            i < 3 ? "bg-orange-500 shadow-[0_0_10px_#f97316]" : "bg-white/10"
                                        )} />
                                    ))}
                                </div>

                                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg">
                                        <Trophy className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Prochaine Récompense</p>
                                        <p className="text-xs font-bold text-white">"{settings.passport_reward || "Une surprise du chef !"}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- OWNER PASSPORT --- */}
            {ownerPassport && (
                <OwnerPassportSection passport={ownerPassport} />
            )}

            {/* --- INFO GRID --- */}
            <div className="grid gap-3">
                {/* HOURS & STATUS CARD */}
                <div 
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => showHours && !isBreak && setShowAllHours(!showAllHours)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Actuel</h4>
                                {showHours ? (
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", isOpen ? "bg-green-400" : "bg-red-400")} />
                                            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isOpen ? "bg-green-500" : "bg-red-500")} />
                                        </span>
                                        <span className="font-black text-slate-900">
                                            {isBreak ? 'En Congés' : (todaySchedule.closed ? 'Fermé aujourd\'hui' : (isOpen ? 'Ouvert' : 'Fermé actuellement'))}
                                        </span>
                                    </div>
                                ) : <span className="font-bold text-slate-900">Horaires non disponibles</span>}
                            </div>
                        </div>
                        {showHours && !isBreak && (
                            <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10 bg-slate-50 transition-transform", showAllHours && "rotate-90")}>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Button>
                        )}
                    </div>

                    {showHours && !isBreak && !showAllHours && !todaySchedule.closed && (
                        <div className="pl-16 space-y-1.5 opacity-60 text-xs font-bold text-slate-900 tabular-nums">
                            {todaySchedule.open} — {todaySchedule.close}
                        </div>
                    )}

                    {showAllHours && (
                        <div className="pl-16 space-y-3 pt-2 border-t border-dashed border-slate-100 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            {DAYS_ORDER.map(day => {
                                const daySched = schedule[day] || { open: '09:00', close: '22:00', closed: true }
                                return (
                                    <div key={day} className={cn("flex justify-between items-center text-xs font-bold", day === today ? "text-orange-600" : "text-slate-500")}>
                                        <span className="capitalize">{DAY_LABELS[day]}</span>
                                        <span className="tabular-nums">
                                            {daySched.closed ? 'Fermé' : `${daySched.open} — ${daySched.close}`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* LOCATION CARD */}
                <div 
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-2 pr-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group cursor-pointer" 
                    onClick={() => {
                        if (!showGps) return;
                        const mapsUrl = restaurant.maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address || restaurant.name)}`;
                        window.open(mapsUrl, '_blank');
                    }}
                >
                    <div className="h-20 w-24 bg-slate-100 rounded-[2rem] overflow-hidden relative border border-white shadow-inner">
                        {/* Mini Map Placeholder Art */}
                        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Abidjan&zoom=13&size=200x200&sensor=false')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 animate-bounce">
                                <MapPin className="h-4 w-4 fill-current" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 py-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nous Trouver</h4>
                        <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{restaurant.address || "Abidjan, Côte d'Ivoire"}</p>
                        {showGps && <span className="text-[10px] font-bold text-orange-600 mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">Lancer l'itinéraire <Navigation className="h-3 w-3" /></span>}
                    </div>
                </div>

                {/* CONTACT GRID */}
                <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${restaurant.phone || ''}`} className="bg-slate-900 text-white p-5 rounded-[2.5rem] flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg shadow-slate-900/20">
                        <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <Phone className="h-6 w-6 text-white" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Appel Direct</p>
                            <p className="font-bold text-sm tracking-tight">{restaurant.phone || "---"}</p>
                        </div>
                    </a>

                    {restaurant.whatsapp ? (
                        <a 
                            href={`https://wa.me/${restaurant.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} 
                            target="_blank"
                            className="bg-[#25D366] text-white p-5 rounded-[2.5rem] flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg shadow-green-500/20"
                        >
                            <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            <MessageSquare className="h-6 w-6 text-white" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">WhatsApp</p>
                                <p className="font-bold text-sm tracking-tight">Chat Direct</p>
                            </div>
                        </a>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(socialLinks).slice(0, 2).map(([platform, username]) => {
                                const config = SOCIAL_CONFIG[platform] || { icon: Share2, color: 'text-slate-600 bg-slate-50', prefix: '' }
                                const Icon = config.icon
                                return (
                                    <a key={platform} href={`${config.prefix}${username}`} target="_blank" className={cn("flex items-center gap-3 p-3.5 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 border-none", config.color.replace('bg-', 'bg-opacity-20 '))} style={{ backgroundColor: '' }}>
                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm", config.color.split(' ')[0])}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{platform}</span>
                                    </a>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Services & Labels */}
            {(showWifi || showPayments || showLabels) && (
                <div className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100/50 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {showWifi && (
                            <div onClick={() => {
                                if (settings.wifi_password) {
                                    navigator.clipboard.writeText(settings.wifi_password);
                                    toast.success("Mot de passe copié !");
                                }
                            }} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Copy className="h-3 w-3 text-orange-500" />
                                </div>
                                <Wifi className="h-6 w-6 text-slate-900 mb-3" />
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Wi-Fi Gratuit</p>
                                <p className="font-bold text-xs truncate">{settings.wifi_name || "WiFi-Guest"}</p>
                            </div>
                        )}

                        {showPayments && (
                            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-2">
                                <p className="text-[9px] font-black uppercase text-slate-400">Paiements</p>
                                <div className="flex flex-wrap gap-1">
                                    {(settings.payment_methods_list || ['orange', 'wave', 'cash']).slice(0, 3).map((m: any) => (
                                        <div key={m} className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-500 border border-slate-200" title={m}>
                                            {m[0].toUpperCase()}
                                        </div>
                                    ))}
                                    {(settings.payment_methods_list?.length > 3) && <span className="text-[9px] font-bold text-slate-400">+{settings.payment_methods_list.length - 3}</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {showLabels && (settings.labels_text) && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {settings.labels_text.split(',').map((label: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-wider shadow-sm">
                                    {label.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer Professionnel */}
            <div className="pt-8 pb-4 text-center space-y-4 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Données sécurisées & confidentialité</span>
                </div>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-auto" />
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
                    Powered by MENLYLA
                </p>
            </div>
        </div>
    )
}

function ProfileItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-5 group">
            <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm border border-orange-100/50">
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</div>
                <div className="font-bold text-slate-900 truncate text-base">{value}</div>
            </div>
        </div>
    )
}

function FilterBadge({ active, onClick, icon, label, color, inactiveColor }: any) {
    return (
        <Badge
            variant={active ? 'default' : 'secondary'}
            className={cn(
                "px-4 py-1.5 rounded-full cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 border-none font-bold text-xs shadow-sm",
                active ? cn(color, "text-white shadow-md scale-105") : (inactiveColor || "bg-white/40 backdrop-blur-md border border-white/20 text-slate-700 hover:bg-white/60")
            )}
            onClick={onClick}
        >
            {icon}
            {label}
        </Badge>
    )
}

import { DishFocusDrawer } from '@/components/modules/menu/components/dish-focus-drawer'

function DishCard({ dish, restaurant }: any) {
    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation()
        const url = typeof window !== 'undefined' ? `${window.location.origin}/${restaurant.slug}#cat-${dish.category_id}` : ''
        const text = `Découvrez ce plat : ${dish.name} chez ${restaurant.name} !`

        if (navigator.share) {
            navigator.share({
                title: dish.name,
                text: text,
                url: url,
            }).catch(() => { })
        } else {
            navigator.clipboard.writeText(`${text} ${url}`)
            toast.success("Lien copié dans le presse-papier !")
        }
    }

    return (
        <DishFocusDrawer dish={dish} restaurant={restaurant}>
            <div className="relative flex flex-col items-center bg-white rounded-[2.5rem] p-4 pb-6 shadow-sm border border-slate-100 cursor-pointer group transition-all duration-500 hover:shadow-xl hover:-translate-y-1">

                {/* Top Circular Image - Floating effect */}
                <div className="relative w-40 h-40 -mt-8 mb-2">
                    <div className="absolute inset-0 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] bg-blend-multiply bg-white">
                        <img
                            src={dish.image_urls?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"}
                            alt={dish.name}
                            className="w-full h-full object-cover rounded-full mix-blend-multiply transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-2 w-full px-2 mb-4">
                    <h3 className="font-black text-2xl text-black leading-tight tracking-tight">
                        {dish.name}
                    </h3>

                    <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 max-w-[90%]">
                        {dish.description || "Une délicieuse préparation."}
                    </p>

                    {/* Specialty Tags */}
                    {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center pt-1">
                            {dish.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="px-2 py-0 h-4 bg-orange-100/50 text-orange-700 border-none font-black text-[8px] uppercase tracking-tighter rounded-full">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Pill Button */}
                <div onClick={(e) => e.stopPropagation()} className="mt-auto">
                    <AddToCartDrawer
                        dish={dish}
                        restaurantId={restaurant.id}
                        currency={restaurant.currency}
                        upsellIds={dish.upsell_ids}
                    >
                        <button className="h-12 px-8 rounded-full bg-[#A06C48] text-white flex items-center justify-center gap-1 shadow-lg shadow-[#A06C48]/30 transition-transform active:scale-95 hover:bg-[#8B5E3F]">
                            <span className="text-lg font-bold opacity-80">$</span>
                            <span className="text-xl font-black">{Math.round(dish.price).toLocaleString()}</span>
                            <span className="text-[10px] font-bold opacity-60 ml-0.5 mt-1">.000</span>
                        </button>
                    </AddToCartDrawer>
                </div>

                {/* Action Buttons (Like/Fav) - ABSOLUTE positioned to not break layout flow */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <LikeButton dishId={dish.id} initialLikes={dish.likes_count || 0} />
                </div>
            </div>
        </DishFocusDrawer>
    )
}

function EventsSection({ settings }: { settings: any }) {
    const events = settings?.events || []
    if (settings?.show_events === false) return null
    if (events.length === 0) return null

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center gap-3 px-2">
                <div className="h-1 w-8 bg-orange-600 rounded-full" />
                <h3 className="font-black uppercase text-xs tracking-[0.2em] text-orange-950">Événements & Offres</h3>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-4">
                {events.map((event: any, idx: number) => (
                    <EventFocusDrawer key={event.id} event={event}>
                        <motion.div
                            className="flex-shrink-0 w-[calc(100%-2rem)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-white/20 flex flex-row min-h-[160px] group cursor-pointer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.8, delay: idx * 0.2 }}
                        >
                            {/* Left Content */}
                            <div className="w-[60%] p-5 flex flex-col items-center justify-center text-center space-y-2 bg-[#F8FAFF]/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-center gap-1.5 text-xs font-black text-orange-600 uppercase tracking-widest mb-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="truncate">{formatDate(event.date)}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 leading-[1.1] tracking-tight transition-colors group-hover:text-orange-600 uppercase">
                                        {event.title || 'Événement'}
                                    </h4>
                                </div>

                                <p className="text-slate-600 font-bold leading-normal text-sm line-clamp-3 max-w-md">
                                    {event.description || 'Venez découvrir notre prochain événement spécial.'}
                                </p>

                                {event.link && (
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            className="rounded-full border border-slate-950 hover:bg-slate-950 hover:text-white transition-all duration-300 font-black text-[11px] uppercase tracking-widest h-10 px-6 shadow-md"
                                            onClick={() => window.open(event.link, '_blank')}
                                        >
                                            Voir
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Right Image */}
                            {event.image_url && (
                                <div className="w-[45%] relative overflow-hidden bg-slate-200">
                                    <img
                                        src={event.image_url}
                                        alt={event.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFF] to-transparent opacity-20" />
                                </div>
                            )}
                        </motion.div>
                    </EventFocusDrawer>
                ))}
            </div>
        </div>
    )
}
