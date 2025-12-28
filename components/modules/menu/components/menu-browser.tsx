'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, Star, Flame, Leaf, FlameKindling, Wheat, UtensilsCrossed, Trophy, Heart, Share2, Bookmark, Receipt, User, History, MapPin, Phone, Mail, LogOut, Loader2, ChevronRight, Clock, Calendar, Instagram, Twitter, MessageCircle, Facebook, Video, Wifi, CreditCard, Navigation, ShieldCheck, StarHalf, Plus } from 'lucide-react'
import { AddToCartDrawer } from '@/components/modules/menu/components/add-to-cart-drawer'
import { LikeButton } from '@/components/modules/menu/components/like-button'
import { FavoriteButton } from '@/components/modules/menu/components/favorite-button'
import { toast } from 'sonner'
import { useFavoritesStore } from '@/lib/store/favorites'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui-store'
import { cn, formatOrderId } from '@/lib/utils'
import { getOrdersByIds } from '../actions'

type Props = {
    categories: any[]
    restaurant: any
}

export function MenuBrowser({ categories, restaurant }: Props) {
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
                <div className="sticky top-16 z-20 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-b">
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
                    <ProfileView restaurant={restaurant} />
                ) : (
                    <>
                        {/* Popular Section (only show if no search/filter) */}
                        {!searchQuery && !activeFilter && popularDishes.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
                                    <h2 className="text-xl font-black uppercase tracking-wider">Les Incontournables</h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                                    {popularDishes.map((dish) => (
                                        <div key={`pop-${dish.id}`} className="flex-shrink-0 w-[280px] group relative">
                                            <div className="absolute top-3 left-3 z-10">
                                                <Badge className="bg-white/90 backdrop-blur-md text-orange-600 border-none shadow-sm font-black text-[10px] uppercase">
                                                    <Heart className="h-3 w-3 mr-1 fill-orange-600" /> Top {dish.likes_count}
                                                </Badge>
                                            </div>
                                            <DishCard dish={dish} restaurant={restaurant} />
                                        </div>
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
                                <div className="grid gap-6">
                                    {cat.dishes.map((dish: any) => (
                                        <DishCard key={dish.id} dish={dish} restaurant={restaurant} />
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
                                        {order.tables?.name || 'Vente à emporter'}
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

function ProfileView({ restaurant }: { restaurant: any }) {
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
        whatsapp: { icon: MessageCircle, color: 'text-green-600 bg-green-50', prefix: 'https://wa.me/' },
        instagram: { icon: Instagram, color: 'text-pink-600 bg-pink-50', prefix: 'https://instagram.com/' },
        facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50', prefix: 'https://facebook.com/' },
        tiktok: { icon: Video, color: 'text-black bg-slate-50', prefix: 'https://tiktok.com/@' },
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in zoom-in duration-500">
            {/* Restaurant IDENTITY CARD */}
            <div className="relative h-56 w-full rounded-[3rem] overflow-hidden shadow-2xl group">
                <img
                    src={restaurant.banner_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800"}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="h-20 w-20 rounded-3xl border-4 border-white bg-white shadow-2xl overflow-hidden p-1.5 rotate-[-3deg]">
                            <img
                                src={restaurant.logo_url || "https://images.unsplash.com/photo-1595113340153-23a3341d6d13?q=80&w=100"}
                                alt="Logo"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{restaurant.name}</h2>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">{restaurant.slug}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Passport Details Section */}
            <div className="bg-white border-2 border-orange-100 rounded-[3rem] pt-8 pb-10 px-8 shadow-[0_30px_60px_-15px_rgba(234,88,12,0.15)]">
                <div className="space-y-8">
                    {/* Header with Badges */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                {showHours && (
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-950">Ouvert</h3>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-orange-50 rounded-full border border-orange-100 italic font-black text-orange-600 text-[10px] shadow-sm">
                                        {restaurant.currency || 'FCFA'}
                                    </div>
                                    {showRating && (
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-black text-yellow-700">4.8</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {restaurant.description && (
                                <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                                    "{restaurant.description}"
                                </p>
                            )}
                        </div>

                        {showGps && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-orange-100 text-orange-600 font-black text-[10px] uppercase h-10 px-4 gap-2 shadow-sm"
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address || restaurant.name)}`, '_blank')}
                            >
                                <Navigation className="h-3 w-3" />
                                Itinéraire
                            </Button>
                        )}
                    </div>

                    {/* Contact & Hours Grid */}
                    <div className="grid gap-6">
                        {showHours && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horaires d'aujourd'hui</span>
                                </div>
                                <div className="pl-8 space-y-1">
                                    {(settings.opening_slots || [{ start: '09:00', end: '22:00' }]).map((slot: any, i: number) => (
                                        <p key={i} className="text-sm font-bold text-slate-900 leading-none">
                                            {slot.start} — {slot.end}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                        <ProfileItem
                            icon={MapPin}
                            label="Localisation"
                            value={restaurant.address || 'Abidjan, Côte d\'Ivoire'}
                        />
                        <ProfileItem
                            icon={Phone}
                            label="Ligne Directe"
                            value={restaurant.phone || '+225 00 00 00 00'}
                        />
                        {restaurant.email && (
                            <ProfileItem
                                icon={Mail}
                                label="Courriel"
                                value={restaurant.email}
                            />
                        )}
                    </div>

                    {/* Presence Sociale */}
                    <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Présence Sociale</h4>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(socialLinks).map(([platform, username]) => {
                                const config = SOCIAL_CONFIG[platform] || { icon: Share2, color: 'bg-slate-50 text-slate-600', prefix: '' }
                                const Icon = config.icon
                                return (
                                    <a
                                        key={platform}
                                        href={`${config.prefix}${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold text-xs shadow-sm",
                                            config.color
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </a>
                                )
                            })}
                            {Object.keys(socialLinks).length === 0 && (
                                <p className="text-xs text-slate-400 italic">Aucun réseau social configuré.</p>
                            )}
                        </div>
                    </div>

                    {/* Services & Labels */}
                    {(showWifi || showPayments || showLabels) && (
                        <div className="pt-6 border-t border-slate-50 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {showWifi && (
                                    <div className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                                                <Wifi className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400">Wi-Fi Client</span>
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 ml-1">{settings.wifi_name || "DEMANDER_AU_STAFF"}</p>
                                    </div>
                                )}
                                {showPayments && (
                                    <div className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400">Paiements acceptés</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 ml-1">
                                            {(settings.payment_methods_list || ['orange', 'wave', 'cash']).map((method: string) => {
                                                const labels: Record<string, string> = {
                                                    orange: 'Orange Money',
                                                    moov: 'Moov Money',
                                                    mtn: 'MTN Money',
                                                    wave: 'Wave',
                                                    cash: 'Espèces',
                                                    visa: 'Carte Visa (Beta)'
                                                }
                                                return (
                                                    <span key={method} className="text-[9px] font-black px-2 py-0.5 bg-white rounded-full border border-slate-100 uppercase text-slate-600">
                                                        {labels[method] || method}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {showLabels && (
                                <div className="flex flex-wrap gap-2">
                                    {(settings.labels_text || "Certifié Halal, Produits Locaux").split(',').map((label: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                                            <ShieldCheck className="h-3 w-3" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{label.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Events Section */}
            <EventsSection settings={settings} />

            {/* Section Réservation & Table */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 px-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <h3 className="font-black uppercase text-xs tracking-[0.2em] text-orange-950">Planifier votre visite</h3>
                </div>

                <button
                    onClick={() => toast.success("Le module de réservation avec calendrier arrive bientôt !", {
                        description: "Vous pourrez choisir votre table et votre créneau directement ici.",
                        icon: <Calendar className="h-5 w-5 text-orange-600" />
                    })}
                    className="w-full group bg-slate-950 rounded-[2.5rem] p-6 flex items-center justify-between hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-slate-900/40 relative overflow-hidden"
                >
                    {/* Visual pattern background */}
                    <div className="absolute right-0 top-0 h-full w-32 bg-white/5 skew-x-[-20deg] translate-x-10" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-all duration-500">
                            <Calendar className="h-9 w-9" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-black text-xl uppercase tracking-tighter">Réserver une table</p>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Calendrier & Disponibilités</p>
                        </div>
                    </div>
                    <ChevronRight className="h-7 w-7 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all opacity-0 group-hover:opacity-100" />
                </button>
            </div>

            {/* Footer Professionnel */}
            <div className="pt-8 pb-4 text-center space-y-2">
                <div className="h-[2px] w-12 bg-orange-100 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                    Développé par MANLY pour {restaurant.name}
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
                active ? cn(color, "text-white shadow-md scale-105") : (inactiveColor || "bg-slate-200 text-slate-900 hover:bg-slate-300")
            )}
            onClick={onClick}
        >
            {icon}
            {label}
        </Badge>
    )
}

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
        <div className="flex flex-col gap-0 border rounded-3xl shadow-sm bg-card overflow-hidden transition-all hover:shadow-md border-orange-100/50">
            {/* Image Section */}
            {dish.image_urls?.[0] && (
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                        src={dish.image_urls[0]}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {dish.is_featured && (
                            <Badge className="bg-orange-500 text-white border-0 py-1 px-3 shadow-lg font-black text-[10px] uppercase">
                                <Star className="h-3 w-3 mr-1 fill-current" /> Spécial
                            </Badge>
                        )}
                        {dish.is_promo && (
                            <Badge className="bg-red-500 text-white border-0 py-1 px-3 shadow-lg font-black text-[10px] uppercase">
                                <Flame className="h-3 w-3 mr-1 fill-current" /> Promo
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {dish.is_vegetarian && <Leaf className="h-4 w-4 text-green-600" />}
                            {dish.is_spicy && <FlameKindling className="h-4 w-4 text-red-600" />}
                            {dish.is_gluten_free && <Wheat className="h-4 w-4 text-blue-600" />}

                            {!dish.image_urls?.[0] && (
                                <>
                                    {dish.is_featured && (
                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50/50 font-black text-[9px] uppercase">
                                            Spécial
                                        </Badge>
                                    )}
                                    {dish.is_promo && (
                                        <Badge variant="outline" className="text-red-600 border-red-100 bg-red-50/50 font-black text-[9px] uppercase">
                                            Promo
                                        </Badge>
                                    )}
                                </>
                            )}
                        </div>
                        <h3 className="font-bold text-lg leading-tight">{dish.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{dish.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <FavoriteButton dishId={dish.id} />
                        <LikeButton dishId={dish.id} initialLikes={dish.likes_count || 0} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-muted/30 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        {dish.is_promo && dish.old_price && (
                            <span className="text-xs text-muted-foreground line-through opacity-60">
                                {Math.round(dish.old_price).toLocaleString()} {restaurant.currency}
                            </span>
                        )}
                        <span className="text-xl font-black text-orange-600 tabular-nums">
                            {Math.round(dish.price).toLocaleString()} <span className="text-xs font-bold opacity-70">{restaurant.currency}</span>
                        </span>
                    </div>
                    <AddToCartDrawer
                        dish={dish}
                        restaurantId={restaurant.id}
                        currency={restaurant.currency}
                        upsellIds={dish.upsell_ids}
                    />
                </div>
            </div>
        </div>
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

            <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 pb-6">
                {events.map((event: any) => (
                    <div key={event.id} className="flex-shrink-0 w-[85vw] md:w-[800px] bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-row min-h-[160px] md:min-h-[350px] group">
                        {/* Left Content */}
                        <div className="w-[60%] md:flex-1 p-5 md:p-16 flex flex-col items-center justify-center text-center space-y-2 md:space-y-6 bg-[#F8FAFF] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="space-y-1.5 md:space-y-3">
                                <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm font-black text-orange-600 uppercase tracking-widest mb-1">
                                    <Calendar className="h-3 w-3 md:h-5 w-5" />
                                    <span className="truncate">{event.date || 'À ne pas manquer'}</span>
                                </div>
                                <h4 className="text-xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight transition-colors group-hover:text-orange-600 uppercase">
                                    {event.title || 'Événement'}
                                </h4>
                            </div>

                            <p className="text-slate-600 font-bold leading-normal text-sm md:text-xl line-clamp-3 md:line-clamp-none max-w-md">
                                {event.description || 'Venez découvrir notre prochain événement spécial.'}
                            </p>

                            {event.link && (
                                <div className="pt-2 md:pt-8">
                                    <Button
                                        variant="outline"
                                        className="rounded-full border md:border-[3px] border-slate-950 hover:bg-slate-950 hover:text-white transition-all duration-300 font-black text-[11px] md:text-[14px] uppercase tracking-widest h-10 md:h-16 px-6 md:px-14 shadow-md"
                                        onClick={() => window.open(event.link, '_blank')}
                                    >
                                        Voir
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Right Image */}
                        {event.image_url && (
                            <div className="w-[45%] md:flex-1 relative overflow-hidden bg-slate-200">
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFF] to-transparent opacity-20 md:block hidden" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
