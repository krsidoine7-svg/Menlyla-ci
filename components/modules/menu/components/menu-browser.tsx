'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Star, Flame, Leaf, FlameKindling, Wheat, UtensilsCrossed, Trophy, Heart, Share2, Bookmark } from 'lucide-react'
import { AddToCartDrawer } from '@/components/modules/menu/components/add-to-cart-drawer'
import { LikeButton } from '@/components/modules/menu/components/like-button'
import { FavoriteButton } from '@/components/modules/menu/components/favorite-button'
import { toast } from 'sonner'
import { useFavoritesStore } from '@/lib/store/favorites'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

type Props = {
    categories: any[]
    restaurant: any
}

export function MenuBrowser({ categories, restaurant }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const { dishIds: favoriteIds } = useFavoritesStore()
    const searchRef = useMemo(() => ({ current: null as HTMLInputElement | null }), [])

    // Handle hash for reactive navigation (Favorites & Search)
    useEffect(() => {
        const checkHash = () => {
            if (typeof window !== 'undefined') {
                if (window.location.hash === '#favorites') {
                    setActiveFilter('favorites')
                } else if (window.location.hash === '#search') {
                    setActiveFilter(null)
                    // Small delay to ensure render
                    setTimeout(() => {
                        const searchInput = document.getElementById('menu-search-input')
                        searchInput?.focus()
                        searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 100)
                }
            }
        }

        window.addEventListener('hashchange', checkHash)
        checkHash() // Initial check
        return () => window.removeEventListener('hashchange', checkHash)
    }, [])

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

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="sticky top-[120px] z-20 bg-background/80 backdrop-blur-md p-4 -mx-4 space-y-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="menu-search-input"
                        placeholder="Rechercher un plat..."
                        className="pl-10 rounded-full bg-muted/50 border-none h-11"
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
                        active={activeFilter === 'favorites'}
                        onClick={() => toggleFilter('favorites')}
                        icon={<Bookmark className="h-3 w-3" />}
                        label="Mes Favoris"
                        color="bg-orange-600 shadow-lg shadow-orange-500/30"
                        inactiveColor="bg-orange-100/50 text-orange-600"
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

            <main className="space-y-10">
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
                    <div className="text-center py-20 px-6 opacity-50">
                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-bold">Aucun plat ne correspond à vos critères.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveFilter(null); }}
                            className="text-primary font-bold mt-2 underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

function FilterBadge({ active, onClick, icon, label, color, inactiveColor }: any) {
    return (
        <Badge
            variant={active ? 'default' : 'secondary'}
            className={cn(
                "px-4 py-1.5 rounded-full cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 border-none",
                active ? color : (inactiveColor || "bg-muted/80")
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
