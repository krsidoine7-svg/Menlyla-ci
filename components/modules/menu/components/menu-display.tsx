'use client'

import { useState } from 'react'
import { LayoutGrid, List, MoreVertical, Pencil, Trash2, Power, PowerOff, Star, Flame, PackageCheck, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DishDialog } from '@/components/modules/menu/components/dish-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { deleteCategory, toggleCategoryStatus, deleteDish, toggleDishStatus } from '../actions'
import { EditCategoryDialog } from './edit-category-dialog'
import { EditDishDialog } from './edit-dish-dialog'
import { cn } from '@/lib/utils'

type Props = {
    categories: any[]
    restaurant: any
}

export function MenuDisplay({ categories, restaurant }: Props) {
    const [view, setView] = useState<'list' | 'grid'>('grid')
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [editingDish, setEditingDish] = useState<any>(null)

    const currency = restaurant?.currency || 'FCFA'

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10 border border-dashed rounded-[2rem] bg-muted/5">
                <div className="mb-4">Votre menu est vide.</div>
                <div className="text-sm">Commencez par créer une catégorie (ex: Entrées, Boissons).</div>
            </div>
        )
    }

    const handleDeleteCategory = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie et tous ses plats ?")) {
            const result = await deleteCategory(id)
            if (result?.message) toast.success(result.message)
        }
    }

    const handleToggleCategory = async (id: string, current: boolean) => {
        const result = await toggleCategoryStatus(id, !current)
        if (result?.message) toast.error(result.message)
        else toast.success(current ? "Catégorie désactivée" : "Catégorie activée")
    }

    const handleDeleteDish = async (id: string) => {
        if (confirm("Supprimer ce plat ?")) {
            const result = await deleteDish(id)
            if (result?.message) toast.success(result.message)
        }
    }

    const handleToggleDish = async (id: string, current: boolean) => {
        const result = await toggleDishStatus(id, !current)
        if (result?.message) toast.error(result.message)
        else {
            toast.success(!current ? "Plat disponible" : "Plat marqué en rupture")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-center bg-muted/50 p-1.5 rounded-full w-fit mx-auto">
                <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('grid')}
                    className="rounded-full px-6"
                >
                    <LayoutGrid className="mr-2 h-4 w-4" /> Grille
                </Button>
                <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('list')}
                    className="rounded-full px-6"
                >
                    <List className="mr-2 h-4 w-4" /> Liste
                </Button>
            </div>

            <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full">
                <TabsContent value="list" className="space-y-6 mt-0">
                    {categories.map((cat) => (
                        <Card key={cat.id} className={cn("rounded-[2rem] border-none shadow-sm", !cat.is_active && "opacity-60 grayscale")}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black">{cat.name}</CardTitle>
                                    {!cat.is_active && <Badge variant="destructive" className="text-[10px] uppercase font-black">Hors Ligne</Badge>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <DishDialog categoryId={cat.id} restaurantId={cat.restaurant_id} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Modifier catégorie
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleCategory(cat.id, cat.is_active)}>
                                                {cat.is_active ? <><PowerOff className="mr-2 h-4 w-4" /> Désactiver</> : <><Power className="mr-2 h-4 w-4" /> Activer</>}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6">
                                <div className="grid gap-3">
                                    {cat.dishes?.map((dish: any) => (
                                        <div key={dish.id} className={cn(
                                            "flex items-center justify-between rounded-2xl border p-4 transition-all group",
                                            !dish.is_available ? 'opacity-50 bg-muted/20 border-muted' : 'bg-card hover:border-orange-200'
                                        )}>
                                            <div className="flex items-center gap-4">
                                                {dish.image_urls?.[0] ? (
                                                    <img src={dish.image_urls[0]} alt={dish.name} className="h-12 w-12 rounded-xl object-cover bg-muted shadow-sm" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-200">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        {dish.name}
                                                        {!dish.is_available && <Badge variant="destructive" className="text-[9px] px-1 font-black uppercase">Épuisé</Badge>}
                                                        {dish.is_promo && <Badge className="bg-red-500 text-[9px] px-1 font-black uppercase">Promo</Badge>}
                                                    </div>
                                                    <div className="text-sm font-black text-orange-600">{Math.round(dish.price).toLocaleString()} {currency}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant={dish.is_available ? "outline" : "default"}
                                                    size="sm"
                                                    className={cn("h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-tight")}
                                                    onClick={() => handleToggleDish(dish.id, dish.is_available)}
                                                >
                                                    {dish.is_available ? <><PackageX className="h-3 w-3 mr-1" /> Rupture</> : <><PackageCheck className="h-3 w-3 mr-1" /> En Stock</>}
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl">
                                                        <DropdownMenuItem onClick={() => setEditingDish(dish)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteDish(dish.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="grid" className="space-y-12 mt-0">
                    {categories.map((cat) => (
                        <div key={cat.id} className={cn(!cat.is_active && 'opacity-60 grayscale')}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    {cat.name}
                                    {!cat.is_active && <Badge variant="outline" className="text-[10px] uppercase font-black tracking-wide">Inactif</Badge>}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <DishDialog categoryId={cat.id} restaurantId={cat.restaurant_id} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card border shadow-sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Modifier catégorie
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleCategory(cat.id, cat.is_active)}>
                                                {cat.is_active ? <><PowerOff className="mr-2 h-4 w-4" /> Désactiver</> : <><Power className="mr-2 h-4 w-4" /> Activer</>}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cat.dishes?.map((dish: any) => (
                                    <Card key={dish.id} className={cn(
                                        "group overflow-hidden relative rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:shadow-orange-100",
                                        !dish.is_available && 'opacity-60 border-muted'
                                    )}>
                                        <div className="aspect-video relative overflow-hidden bg-muted">
                                            {dish.image_urls?.[0] ? (
                                                <img
                                                    src={dish.image_urls[0]}
                                                    alt={dish.name}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-muted-foreground uppercase text-[10px] font-black tracking-widest bg-orange-50/50">
                                                    Aucune image
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                <Badge
                                                    className={cn(
                                                        "shadow-lg font-black text-[10px] py-1 border-none cursor-pointer hover:scale-105 transition-transform",
                                                        dish.is_available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                                    )}
                                                    onClick={() => handleToggleDish(dish.id, dish.is_available)}
                                                >
                                                    {dish.is_available ? 'EN STOCK' : 'ÉPUISÉ'}
                                                </Badge>
                                                {dish.is_featured && (
                                                    <Badge className="bg-orange-500 text-white border-0 shadow-lg px-2 font-black text-[10px] uppercase">
                                                        <Star className="h-3 w-3 mr-1 fill-current" /> Spécial
                                                    </Badge>
                                                )}
                                                {dish.is_promo && (
                                                    <Badge className="bg-red-500 text-white border-0 shadow-lg px-2 font-black text-[10px] uppercase">
                                                        <Flame className="h-3 w-3 mr-1 fill-current" /> Promo
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-2xl shadow-xl backdrop-blur-md bg-white/50"
                                                    onClick={() => setEditingDish(dish)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-black text-xl leading-tight group-hover:text-orange-600 transition-colors">{dish.name}</h3>
                                                <div className="text-right">
                                                    <div className="font-black text-orange-600 text-lg">{Math.round(dish.price).toLocaleString()} <span className="text-xs">{currency}</span></div>
                                                    {dish.old_price && <div className="text-xs text-muted-foreground line-through opacity-50">{Math.round(dish.old_price).toLocaleString()} F</div>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed italic">
                                                {dish.description || "Délicieux plat préparé avec soin..."}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center mt-2 border-t pt-4">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                Modifié le {new Date(dish.created_at).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive h-8 px-2 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-black uppercase tracking-tight"
                                                onClick={() => handleDeleteDish(dish.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                {(!cat.dishes || cat.dishes.length === 0) && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-[2rem] bg-muted/5 text-muted-foreground font-medium">
                                        Cette catégorie est vide.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>

            {editingCategory && (
                <EditCategoryDialog
                    category={editingCategory}
                    open={!!editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                />
            )}

            {editingDish && (
                <EditDishDialog
                    dish={editingDish}
                    open={!!editingDish}
                    onOpenChange={(open) => !open && setEditingDish(null)}
                />
            )}
        </div>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}
