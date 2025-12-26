'use client'

import { useState } from 'react'
import { LayoutGrid, List, MoreVertical, Pencil, Trash2, Power, PowerOff } from 'lucide-react'
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

type Props = {
    categories: any[]
}

export function MenuDisplay({ categories }: Props) {
    const [view, setView] = useState<'list' | 'grid'>('grid')
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [editingDish, setEditingDish] = useState<any>(null)

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10 border border-dashed rounded-lg">
                Votre menu est vide. Commencez par créer une catégorie (ex: Entrées, Boissons).
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
        else toast.success(current ? "Plat marqué en rupture" : "Plat disponible")
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="grid" className="w-full" onValueChange={(v) => setView(v as any)}>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-muted-foreground text-sm">
                        {categories.reduce((acc, cat) => acc + (cat.dishes?.length || 0), 0)} Plats au total
                    </div>
                    <TabsList>
                        <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4 mr-2" /> Carte</TabsTrigger>
                        <TabsTrigger value="list"><List className="h-4 w-4 mr-2" /> Liste</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="space-y-6">
                    {categories.map((cat) => (
                        <Card key={cat.id} className={!cat.is_active ? 'opacity-60 bg-muted/20 border-dashed' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {cat.name}
                                    <Badge variant="secondary" className="text-xs">{cat.dishes?.length || 0}</Badge>
                                    {!cat.is_active && <Badge variant="destructive" className="text-xs">Désactivée</Badge>}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <DishDialog categoryId={cat.id} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Modifier
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
                            <CardContent>
                                <div className="grid gap-2">
                                    {cat.dishes?.map((dish: any) => (
                                        <div key={dish.id} className={`flex items-center justify-between rounded-md border p-3 hover:bg-muted/30 transition-colors ${!dish.is_available ? 'opacity-60 bg-muted/10' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                {dish.image_urls?.[0] && (
                                                    <img src={dish.image_urls[0]} alt={dish.name} className="h-10 w-10 rounded object-cover bg-muted" />
                                                )}
                                                <div>
                                                    <div className="font-semibold flex items-center gap-2">
                                                        {dish.name}
                                                        {!dish.is_available && <Badge variant="destructive" className="h-5 text-[10px] px-1">Rupture</Badge>}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{dish.price} FCFA</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingDish(dish)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleDish(dish.id, dish.is_available)}>
                                                            {dish.is_available ? "Marquer en rupture" : "Marquer disponible"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
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

                <TabsContent value="grid" className="space-y-8">
                    {categories.map((cat) => (
                        <div key={cat.id} className={!cat.is_active ? 'opacity-75 grayscale-[0.5]' : ''}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    {cat.name}
                                    {!cat.is_active && <Badge variant="outline" className="text-xs">Inactif</Badge>}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <DishDialog categoryId={cat.id} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleCategory(cat.id, cat.is_active)}>
                                                {cat.is_active ? "Désactiver" : "Activer"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cat.dishes?.map((dish: any) => (
                                    <Card key={dish.id} className={`overflow-hidden hover:shadow-lg transition-all group ${!dish.is_available ? 'opacity-80' : ''}`}>
                                        <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                            {dish.image_urls?.[0] ? (
                                                <img
                                                    src={dish.image_urls[0]}
                                                    alt={dish.name}
                                                    className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${!dish.is_available ? 'grayscale' : ''}`}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-gray-100">
                                                    Pas d'image
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <Badge variant={dish.is_available ? 'default' : 'destructive'} className={dish.is_available ? 'bg-green-600/90 shadow-sm' : ''}>
                                                    {dish.is_available ? 'En stock' : 'Épuisé'}
                                                </Badge>
                                            </div>
                                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        <DropdownMenuItem onClick={() => setEditingDish(dish)}>
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleDish(dish.id, dish.is_available)}>
                                                            {dish.is_available ? "Marquer épuisé" : "Marquer en stock"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDish(dish.id)}>
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg leading-tight">{dish.name}</h3>
                                                <span className="font-bold text-orange-600">{dish.price} F</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                                {dish.description || "Aucune description pour le moment."}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                                            <span>Ajouté le {new Date(dish.created_at).toLocaleDateString()}</span>
                                            {/* Action buttons could also go here instead of hover */}
                                        </CardFooter>
                                    </Card>
                                ))}
                                {(!cat.dishes || cat.dishes.length === 0) && (
                                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                                        Cette catégorie est vide.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
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
