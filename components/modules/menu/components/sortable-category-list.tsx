'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2, Power, PowerOff, GripVertical, Plus, PackageX, PackageCheck, Star, Flame } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { reorderCategories, reorderDishes } from '../actions'
import { toast } from 'sonner'
import { DishDialog } from './dish-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// --- SORTABLE CATEGORY ITEM ---
function SortableCategoryItem({ category, children, viewMode }: { category: any, children: React.ReactNode, viewMode: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: category.id,
        data: { type: 'Category', item: category }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as const,
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group/cat mb-6">
            <div className={cn(
                "absolute z-20 cursor-move opacity-0 group-hover/cat:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg text-muted-foreground",
                viewMode === 'list' ? "-left-3 top-8" : "-left-8 top-0"
            )} {...attributes} {...listeners}>
                <GripVertical className="h-6 w-6" />
            </div>

            <div className={cn("transition-all", viewMode === 'list' ? "pl-0 sm:pl-6" : "")}>
                {children}
            </div>
        </div>
    )
}

// --- DISH ITEMS VARIANTS ---

function SortableDishListItem({ dish, onToggle, onDelete, onEdit, currency, attributes, listeners, setNodeRef, style }: any) {
    return (
        <div ref={setNodeRef} style={style} className={cn(
            "flex items-center justify-between rounded-2xl border p-4 transition-all group/dish bg-card hover:border-orange-200 relative",
            !dish.is_available && 'opacity-50 bg-muted/20 border-muted'
        )}>
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 cursor-move opacity-0 group-hover/dish:opacity-100 transition-opacity p-2 text-muted-foreground" {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-4 pl-2">
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
                    onClick={() => onToggle(dish.id, dish.is_available)}
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
                        <DropdownMenuItem onClick={() => onEdit(dish)}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(dish.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

function SortableDishGridItem({ dish, onToggle, onDelete, onEdit, currency, attributes, listeners, setNodeRef, style }: any) {
    return (
        <Card ref={setNodeRef} style={style} className={cn(
            "group/dish overflow-hidden relative rounded-[1.5rem] border-none shadow-sm transition-all hover:shadow-lg hover:shadow-orange-100",
            !dish.is_available && 'opacity-60 border-muted'
        )}>
            <div className="absolute top-2 left-2 z-30 cursor-move opacity-0 group-hover/dish:opacity-100 transition-opacity p-1 bg-white/80 rounded-full shadow-sm text-muted-foreground" {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="aspect-[4/3] relative p-4 bg-slate-50/50 overflow-visible">
                {dish.image_urls?.[0] ? (
                    <div className="w-full h-full relative group/img-3d perspective-1000">
                        <img
                            src={dish.image_urls[0]}
                            alt={dish.name}
                            className="object-cover w-full h-full rounded-2xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/dish:scale-105 group-hover/dish:-translate-y-4 group-hover/dish:rotate-[-1.5deg] group-hover/dish:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground uppercase text-[8px] font-black tracking-widest bg-orange-50/50 rounded-2xl border-2 border-dashed border-orange-100">
                        Aucune image
                    </div>
                )}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5 z-20">
                    <Badge
                        className={cn(
                            "shadow-lg font-black text-[8px] py-0.5 px-2 border-none cursor-pointer hover:scale-105 transition-transform",
                            dish.is_available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                        )}
                        onClick={() => onToggle(dish.id, dish.is_available)}
                    >
                        {dish.is_available ? 'DISPO' : 'ÉPUISÉ'}
                    </Badge>
                    {dish.is_featured && (
                        <Badge className="bg-orange-500 text-white border-0 shadow-lg px-1.5 py-0.5 font-black text-[8px] uppercase">
                            <Star className="h-2.5 w-2.5 mr-1 fill-current" /> Spécial
                        </Badge>
                    )}
                    {dish.is_promo && (
                        <Badge className="bg-red-500 text-white border-0 shadow-lg px-1.5 py-0.5 font-black text-[8px] uppercase">
                            <Flame className="h-2.5 w-2.5 mr-1 fill-current" /> Promo
                        </Badge>
                    )}
                </div>
            </div>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-sm leading-tight group-hover/dish:text-orange-600 transition-colors truncate flex-1 mr-2">{dish.name}</h3>
                    <div className="text-right">
                        <div className="font-black text-orange-600 text-xs whitespace-nowrap">{Math.round(dish.price).toLocaleString()} <span className="text-[10px]">{currency}</span></div>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1 h-4 leading-relaxed italic">
                    {dish.description || "Pas de description..."}
                </p>
            </CardContent>
            <CardFooter className="px-3 pb-3 pt-0 flex justify-between items-center mt-1 border-t pt-2 gap-2">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter truncate opacity-50">
                    {new Date(dish.created_at).toLocaleDateString()}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-6 px-1.5 hover:bg-red-50 hover:text-red-700 rounded-lg text-[9px] font-black uppercase tracking-tight"
                    onClick={() => onDelete(dish.id)}
                >
                    <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(dish)}
                >
                    <Pencil className="h-3 w-3" />
                </Button>
            </CardFooter>
        </Card>
    )
}

function SortableDishMiniItem({ dish, onToggle, onDelete, onEdit, currency, attributes, listeners, setNodeRef, style }: any) {
    return (
        <div ref={setNodeRef} style={style} className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 group/dish relative">
            <div className="absolute top-2 right-2 z-30 cursor-move opacity-0 group-hover/dish:opacity-100 transition-opacity p-1 bg-muted rounded-full text-muted-foreground" {...attributes} {...listeners}>
                <GripVertical className="h-3 w-3" />
            </div>

            <div className="flex items-center gap-3">
                {dish.image_urls?.[0] ? (
                    <img src={dish.image_urls[0]} alt={dish.name} className="h-14 w-14 rounded-xl object-cover border" />
                ) : (
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">
                        No Img
                    </div>
                )}
                <div>
                    <p className="font-black text-sm uppercase tracking-[0.1em]">{dish.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{dish.description || "Sans description"}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-lg font-black text-orange-600">{Math.round(dish.price).toLocaleString()} {currency}</span>
                <Badge variant={dish.is_available ? "default" : "secondary"} className="text-[9px] font-black uppercase tracking-wide">
                    {dish.is_available ? "Actif" : "Off"}
                </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-full text-[10px] uppercase tracking-[0.2em]" onClick={() => onToggle(dish.id, dish.is_available)}>
                    {dish.is_available ? "Désactiver" : "Activer"}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => onEdit(dish)}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(dish.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

function SortableDishItem(props: any) {
    const { viewMode, dish } = props
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: dish.id,
        data: { type: 'Dish', item: dish, categoryId: dish.category_id }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30 : 2,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
    }

    const commonProps = { ...props, attributes, listeners, setNodeRef, style }

    if (viewMode === 'grid') return <SortableDishGridItem {...commonProps} />
    if (viewMode === 'mini') return <SortableDishMiniItem {...commonProps} />
    return <SortableDishListItem {...commonProps} />
}


// --- MAIN LIST ---

export function SortableCategoryList({
    categories: initialCategories,
    restaurant,
    onEdit,
    onDelete,
    onToggle,
    onToggleDish,
    onDeleteDish,
    onEditDish,
    viewMode = 'list' // New prop
}: any) {
    const [categories, setCategories] = useState(initialCategories)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [confirm, setConfirm] = useState<{
        open: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'destructive' | 'warning' | 'default'
        onConfirm: () => void
    }>({
        open: false,
        title: '',
        description: '',
        confirmLabel: 'Confirmer',
        variant: 'destructive',
        onConfirm: () => {},
    })

    const ask = (cfg: Omit<typeof confirm, 'open'>) => setConfirm({ open: true, ...cfg })
    const closeConfirm = () => setConfirm(c => ({ ...c, open: false }))

    useEffect(() => {
        setCategories(initialCategories)
    }, [initialCategories])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        if (active.id === over.id) return

        const activeData = active.data.current
        const titleType = activeData?.type

        // --- REORDER CATEGORIES ---
        if (titleType === 'Category') {
            const oldIndex = categories.findIndex((i: any) => i.id === active.id)
            const newIndex = categories.findIndex((i: any) => i.id === over.id)
            if (oldIndex === -1 || newIndex === -1) return

            const newOrder = arrayMove(categories, oldIndex, newIndex)
            setCategories(newOrder)

            const updates = newOrder.map((item: any, index) => ({ id: item.id, rank: index }))
            reorderCategories(updates).catch(() => toast.error("Erreur de tri"))
            return
        }

        // --- REORDER DISHES ---
        if (titleType === 'Dish') {
            const categoryId = activeData?.categoryId
            const categoryIndex = categories.findIndex((c: any) => c.id === categoryId)

            if (categoryIndex === -1) return

            const category = categories[categoryIndex]
            const dishes = category.dishes || []

            const oldIndex = dishes.findIndex((d: any) => d.id === active.id)
            const newIndex = dishes.findIndex((d: any) => d.id === over.id)

            if (oldIndex === -1 || newIndex === -1) return

            const newDishes = arrayMove(dishes, oldIndex, newIndex)

            const newCategories = [...categories]
            newCategories[categoryIndex] = { ...category, dishes: newDishes }
            setCategories(newCategories)

            const updates = newDishes.map((item: any, index: number) => ({ id: item.id, rank: index }))
            reorderDishes(updates).catch(() => toast.error("Erreur de tri plats"))
        }
    }

    return (
        <>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={categories.map((c: any) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className={viewMode === 'grid' ? 'space-y-12' : viewMode === 'mini' ? 'space-y-10' : ''}>
                    {categories.map((cat: any) => (
                        <SortableCategoryItem key={cat.id} category={cat} viewMode={viewMode}>
                            {/* RENDER CATEGORY HEADER BASED ON MODE */}
                            {viewMode === 'list' && (
                                <Card className={cn("rounded-[2rem] border-none shadow-sm bg-white/80 backdrop-blur-sm", !cat.is_active && "opacity-60 grayscale")}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-black flex items-center gap-3">{cat.name}</CardTitle>
                                            {!cat.is_active && <Badge variant="destructive" className="text-[10px] uppercase font-black">Hors Ligne</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DishDialog categoryId={cat.id} restaurantId={cat.restaurant_id} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem onClick={() => onEdit(cat)}><Pencil className="mr-2 h-4 w-4" /> Modifier catégorie</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => ask({
                                                        title: cat.is_active ? 'Désactiver la catégorie ?' : 'Activer la catégorie ?',
                                                        description: cat.is_active
                                                            ? `La catégorie "${cat.name}" sera masquée du menu client.`
                                                            : `La catégorie "${cat.name}" sera visible sur le menu client.`,
                                                        confirmLabel: cat.is_active ? 'Désactiver' : 'Activer',
                                                        variant: cat.is_active ? 'warning' : 'default',
                                                        onConfirm: () => onToggle(cat.id, cat.is_active)
                                                    })}>{cat.is_active ? <><PowerOff className="mr-2 h-4 w-4" /> Désactiver</> : <><Power className="mr-2 h-4 w-4" /> Activer</>}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => ask({
                                                        title: 'Supprimer la catégorie ?',
                                                        description: `"${cat.name}" et tous ses plats seront définitivement supprimés. Cette action est irréversible.`,
                                                        confirmLabel: 'Supprimer définitivement',
                                                        variant: 'destructive',
                                                        onConfirm: () => onDelete(cat.id)
                                                    })}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6">
                                        <SortableContext items={cat.dishes?.map((d: any) => d.id) || []} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-3">
                                                {cat.dishes?.map((dish: any) => (
                                                    <SortableDishItem key={dish.id} dish={dish} viewMode={viewMode} currency={restaurant?.currency || 'FCFA'} onToggle={onToggleDish} onDelete={(id: string) => ask({
                                                        title: 'Supprimer le plat ?',
                                                        description: `"${dish.name}" sera définitivement supprimé. Cette action est irréversible.`,
                                                        confirmLabel: 'Supprimer',
                                                        variant: 'destructive',
                                                        onConfirm: () => onDeleteDish(id)
                                                    })} onEdit={onEditDish || onEdit} />
                                                ))}
                                            </div>
                                        </SortableContext>
                                        {(!cat.dishes || cat.dishes.length === 0) && <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed rounded-2xl bg-muted/30">Aucun plat dans cette catégorie</div>}
                                    </CardContent>
                                </Card>
                            )}

                            {(viewMode === 'grid' || viewMode === 'mini') && (
                                <div className={cn(!cat.is_active && 'opacity-60 grayscale')}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                            {cat.name}
                                            {!cat.is_active && <Badge variant="outline" className="text-[10px] uppercase font-black tracking-wide">Inactif</Badge>}
                                            {viewMode === 'mini' && cat.dishes?.length > 0 && (
                                                <Badge variant="secondary" className="rounded-full px-3 text-[10px] uppercase tracking-[0.2em]">
                                                    {cat.dishes.length} plat(s)
                                                </Badge>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <DishDialog categoryId={cat.id} restaurantId={cat.restaurant_id} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card border shadow-sm"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem onClick={() => onEdit(cat)}><Pencil className="mr-2 h-4 w-4" /> Modifier catégorie</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => ask({
                                                        title: cat.is_active ? 'Désactiver la catégorie ?' : 'Activer la catégorie ?',
                                                        description: cat.is_active
                                                            ? `La catégorie "${cat.name}" sera masquée du menu client.`
                                                            : `La catégorie "${cat.name}" sera visible sur le menu client.`,
                                                        confirmLabel: cat.is_active ? 'Désactiver' : 'Activer',
                                                        variant: cat.is_active ? 'warning' : 'default',
                                                        onConfirm: () => onToggle(cat.id, cat.is_active)
                                                    })}>{cat.is_active ? <><PowerOff className="mr-2 h-4 w-4" /> Désactiver</> : <><Power className="mr-2 h-4 w-4" /> Activer</>}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => ask({
                                                        title: 'Supprimer la catégorie ?',
                                                        description: `"${cat.name}" et tous ses plats seront définitivement supprimés. Cette action est irréversible.`,
                                                        confirmLabel: 'Supprimer définitivement',
                                                        variant: 'destructive',
                                                        onConfirm: () => onDelete(cat.id)
                                                    })}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <SortableContext
                                        items={cat.dishes?.map((d: any) => d.id) || []}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className={viewMode === 'grid'
                                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                                            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                        }>
                                            {cat.dishes?.map((dish: any) => (
                                                <SortableDishItem key={dish.id} dish={dish} viewMode={viewMode} currency={restaurant?.currency || 'FCFA'} onToggle={onToggleDish} onDelete={(id: string) => ask({
                                                    title: 'Supprimer le plat ?',
                                                    description: `"${dish.name}" sera définitivement supprimé. Cette action est irréversible.`,
                                                    confirmLabel: 'Supprimer',
                                                    variant: 'destructive',
                                                    onConfirm: () => onDeleteDish(id)
                                                })} onEdit={onEditDish || onEdit} />
                                            ))}
                                            {(!cat.dishes || cat.dishes.length === 0) && (
                                                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-[2rem] bg-muted/5 text-muted-foreground font-medium">
                                                    Cette catégorie est vide.
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            )}
                        </SortableCategoryItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>

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
        </>
    )
}
