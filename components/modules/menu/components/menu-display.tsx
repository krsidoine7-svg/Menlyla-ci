'use client'

import { useState } from 'react'
import { LayoutGrid, List, MoreVertical, Pencil, Trash2, Power, PowerOff, Star, Flame, PackageCheck, PackageX, Table as TableIcon, Square } from 'lucide-react'
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
import { deleteCategory, toggleCategoryStatus, deleteDish, toggleDishStatus, seedDefaultCategories } from '../actions'
import { EditCategoryDialog } from './edit-category-dialog'
import { EditDishDialog } from './edit-dish-dialog'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { SortableCategoryList } from './sortable-category-list'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type ViewMode = 'list' | 'grid' | 'table' | 'mini'

type Props = {
    categories: any[]
    restaurant: any
}

export function MenuDisplay({ categories, restaurant }: Props) {
    const [view, setView] = useState<ViewMode>('grid')
    const [isSeeding, setIsSeeding] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [editingDish, setEditingDish] = useState<any>(null)
    const [confirm, setConfirm] = useState<{
        open: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'destructive' | 'warning' | 'default'
        onConfirm: () => void
    }>({
        open: false, title: '', description: '', confirmLabel: 'Confirmer', variant: 'destructive', onConfirm: () => {}
    })
    const ask = (cfg: Omit<typeof confirm, 'open'>) => setConfirm({ open: true, ...cfg })
    const closeConfirm = () => setConfirm(c => ({ ...c, open: false }))

    const currency = restaurant?.currency || 'FCFA'

    const handleSeedDefaults = async () => {
        setIsSeeding(true)
        const result = await seedDefaultCategories()
        setIsSeeding(false)
        if (result?.message) toast.success(result.message)
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center p-16 border-2 border-dashed rounded-[3rem] bg-muted/5 flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600">
                    <Sparkles className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight">Votre menu est encore vide</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Vous pouvez créer vos propres catégories ou gagner du temps avec nos modèles prêts à l'emploi.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button
                        onClick={handleSeedDefaults}
                        disabled={isSeeding}
                        className="rounded-full h-12 px-8 bg-orange-600 hover:bg-orange-700 font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-600/20"
                    >
                        {isSeeding ? "Création..." : "Ajouter les catégories par défaut"}
                    </Button>
                </div>
            </div>
        )
    }

    const handleDeleteCategory = async (cat: any) => {
        ask({
            title: 'Supprimer la catégorie ?',
            description: `"${cat.name}" et tous ses plats seront définitivement supprimés. Cette action est irréversible.`,
            confirmLabel: 'Supprimer définitivement',
            variant: 'destructive',
            onConfirm: async () => {
                const result = await deleteCategory(cat.id)
                if (result?.message) toast.success(result.message)
            }
        })
    }

    const handleToggleCategory = async (cat: any) => {
        ask({
            title: cat.is_active ? 'Désactiver la catégorie ?' : 'Activer la catégorie ?',
            description: cat.is_active
                ? `La catégorie "${cat.name}" sera masquée du menu client.`
                : `La catégorie "${cat.name}" sera visible sur le menu client.`,
            confirmLabel: cat.is_active ? 'Désactiver' : 'Activer',
            variant: cat.is_active ? 'warning' : 'default',
            onConfirm: async () => {
                const result = await toggleCategoryStatus(cat.id, !cat.is_active)
                if (result?.message) toast.error(result.message)
                else toast.success(cat.is_active ? 'Catégorie désactivée' : 'Catégorie activée')
            }
        })
    }

    const handleDeleteDish = async (dish: any) => {
        ask({
            title: 'Supprimer ce plat ?',
            description: `Le plat "${dish.name}" sera définitivement supprimé. Cette action est irréversible.`,
            confirmLabel: 'Supprimer',
            variant: 'destructive',
            onConfirm: async () => {
                const result = await deleteDish(dish.id)
                if (result?.message) toast.success(result.message)
            }
        })
    }

    const handleToggleDish = async (dish: any) => {
        ask({
            title: dish.is_available ? 'Marquer en rupture de stock ?' : 'Remettre le plat en stock ?',
            description: dish.is_available 
                ? `Le plat "${dish.name}" apparaîtra comme "Épuisé".`
                : `Le plat "${dish.name}" sera à nouveau disponible à la commande.`,
            confirmLabel: dish.is_available ? 'Marquer épuisé' : 'Remettre en stock',
            variant: dish.is_available ? 'warning' : 'default',
            onConfirm: async () => {
                const result = await toggleDishStatus(dish.id, !dish.is_available)
                if (result?.message) toast.error(result.message)
                else {
                    toast.success(!dish.is_available ? 'Plat disponible' : 'Plat marqué en rupture')
                }
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-center bg-muted/50 p-1.5 rounded-full w-fit mx-auto gap-1">
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

                <Button
                    variant={view === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('table')}
                    className="rounded-full px-6"
                >
                    <TableIcon className="mr-2 h-4 w-4" /> Tableau
                </Button>
                <Button
                    variant={view === 'mini' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView('mini')}
                    className="rounded-full px-6"
                >
                    <Square className="mr-2 h-4 w-4" /> Mini-cartes
                </Button>
            </div>

            <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-full">
                <TabsContent value="list" className="space-y-6 mt-0">
                    <SortableCategoryList
                        categories={categories}
                        restaurant={restaurant}
                        onEdit={setEditingCategory}
                        onDelete={handleDeleteCategory}
                        onToggle={handleToggleCategory}
                        onToggleDish={handleToggleDish}
                        onDeleteDish={handleDeleteDish}
                        onEditDish={setEditingDish}
                    />
                </TabsContent>

                <TabsContent value="grid" className="space-y-12 mt-0">
                    <SortableCategoryList
                        categories={categories}
                        restaurant={restaurant}
                        onEdit={setEditingCategory}
                        onDelete={handleDeleteCategory}
                        onToggle={handleToggleCategory}
                        onToggleDish={handleToggleDish}
                        onDeleteDish={handleDeleteDish}
                        onEditDish={setEditingDish}
                        viewMode="grid"
                    />
                </TabsContent>

                <TabsContent value="table" className="space-y-6 mt-0">
                    {categories.map((cat) => (
                        <Card key={cat.id} className={cn("rounded-[2rem] border border-dashed", !cat.is_active && "opacity-60 grayscale")}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black">{cat.name}</CardTitle>
                                    {!cat.is_active && <Badge variant="outline" className="text-[10px] uppercase font-black">Inactif</Badge>}
                                </div>
                                <DishDialog categoryId={cat.id} restaurantId={cat.restaurant_id} />
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-t">
                                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-3 font-black">Plat</th>
                                            <th className="px-6 py-3 font-black">Prix</th>
                                            <th className="px-6 py-3 font-black">Statut</th>
                                            <th className="px-6 py-3 font-black text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-muted/60">
                                        {cat.dishes?.map((dish: any) => (
                                            <tr key={dish.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 font-semibold flex items-center gap-3">
                                                    {dish.image_urls?.[0] ? (
                                                        <img src={dish.image_urls[0]} alt={dish.name} className="h-10 w-10 rounded-lg object-cover border" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-[10px] font-black text-orange-300">IMG</div>
                                                    )}
                                                    <span>{dish.name}</span>
                                                </td>
                                                <td className="px-6 py-4 font-black text-orange-600">
                                                    {Math.round(dish.price).toLocaleString()} {currency}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn("text-[10px] font-black", dish.is_available ? "bg-green-500" : "bg-red-500")}>
                                                        {dish.is_available ? "Disponible" : "Épuisé"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="outline" size="sm" className="rounded-full text-[10px] uppercase font-black" onClick={() => handleToggleDish(dish)}>
                                                            {dish.is_available ? "Marquer rupture" : "Remettre"}
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
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteDish(dish)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!cat.dishes || cat.dishes.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-6 text-center text-muted-foreground text-sm">
                                                    Aucun plat dans cette catégorie.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="mini" className="space-y-10 mt-0">
                    <SortableCategoryList
                        categories={categories}
                        restaurant={restaurant}
                        onEdit={setEditingCategory}
                        onDelete={handleDeleteCategory}
                        onToggle={handleToggleCategory}
                        onToggleDish={handleToggleDish}
                        onDeleteDish={handleDeleteDish}
                        onEditDish={setEditingDish}
                        viewMode="mini"
                    />
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

            <ConfirmDialog
                open={confirm.open}
                onOpenChange={closeConfirm}
                title={confirm.title}
                description={confirm.description}
                confirmLabel={confirm.confirmLabel}
                variant={confirm.variant}
                onConfirm={() => {
                    confirm.onConfirm()
                    closeConfirm()
                }}
            />
        </div>
    )
}

function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}
