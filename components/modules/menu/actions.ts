'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function submitOrderFeedback(orderId: string, rating: number, feedback?: string) {
    const supabase = await createClient()

    const { data: order, error: checkError } = await supabase
        .from('orders')
        .select('status, id')
        .eq('id', orderId)
        .single()

    if (checkError || !order) throw new Error("Commande introuvable")
    
    // We only allow feedback for ready/delivered/completed orders
    if (!['ready', 'delivered', 'completed'].includes(order.status)) {
        throw new Error("Vous ne pouvez pas encore noter cette commande")
    }

    const { error } = await supabase
        .from('orders')
        .update({
            rating,
            feedback: feedback?.trim() || null
        })
        .eq('id', orderId)

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
}

// --- CATEGORIES ---

const categorySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    rank: z.number().default(0),
    icon_url: z.string().optional(),
})

export async function createCategory(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    // Get current restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return { message: "Restaurant introuvable" }

    const validated = categorySchema.safeParse({
        name: formData.get('name'),
        rank: Number(formData.get('rank') || 0),
        icon_url: formData.get('icon_url') || undefined
    })

    if (!validated.success) {
        return { message: "Validation echouée" }
    }

    const { error } = await supabase
        .from('categories')
        .insert({
            ...validated.data,
            restaurant_id: restaurant.id
        })

    if (error) return { message: error.message }

    revalidatePath('/dashboard/menu')
    return { message: "Catégorie ajoutée !" }
}

export async function updateCategory(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }
    
    const id = formData.get('id') as string;
    if (!id) return { message: "ID categorie manquant" };

    const validated = categorySchema.safeParse({
        name: formData.get('name'),
        rank: Number(formData.get('rank') || 0),
        icon_url: formData.get('icon_url') || undefined
    })

    if (!validated.success) {
        return { message: "Validation echouée" }
    }

    const { error } = await supabase
        .from('categories')
        .update(validated.data)
        .eq('id', id)

    if (error) return { message: error.message }
    revalidatePath('/dashboard/menu')
    return { message: "Catégorie mise à jour !" }
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) return { message: error.message }
    revalidatePath('/dashboard/menu')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { message: error.message }
    revalidatePath('/dashboard/menu')
    return { message: "Catégorie supprimée" }
}

export async function reorderCategories(items: { id: string, rank: number }[]) {
    const supabase = await createClient()

    // We update all items in a loop/transaction style
    // Supabase JS doesn't support bulk update with different values easily in one query
    // So we loop. Ideally we would use an RPC but loop is fine for < 20 categories.

    for (const item of items) {
        await supabase
            .from('categories')
            .update({ rank: item.rank })
            .eq('id', item.id)
    }

    revalidatePath('/dashboard/menu')
    revalidatePath('/[slug]') // Update public view
    return { success: true }
}

export async function seedDefaultCategories() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return { message: "Restaurant introuvable" }

    const defaultCategories = [
        { name: '🍴 Entrées', rank: 0, restaurant_id: restaurant.id },
        { name: '🥘 Plats', rank: 1, restaurant_id: restaurant.id },
        { name: '🥤 Boissons', rank: 2, restaurant_id: restaurant.id },
        { name: '🍰 Desserts', rank: 3, restaurant_id: restaurant.id }
    ]

    const { error } = await supabase
        .from('categories')
        .insert(defaultCategories)

    if (error) return { message: error.message }

    revalidatePath('/dashboard/menu')
    return { message: "Catégories par défaut ajoutées !" }
}


// --- DISHES ---

const dishSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    category_id: z.string().uuid(),
    image_url: z.string().optional(),
    is_available: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    is_promo: z.boolean().default(false),
    old_price: z.number().optional().nullable(),
    is_vegetarian: z.boolean().default(false),
    is_spicy: z.boolean().default(false),
    is_gluten_free: z.boolean().default(false),
    upsell_ids: z.array(z.string().uuid()).optional().default([]),
})

export async function createDish(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    // Get current restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return { message: "Restaurant introuvable" }

    const validated = dishSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        category_id: formData.get('category_id'),
        image_url: formData.get('image_url'),
        is_featured: formData.get('is_featured') === 'on',
        is_promo: formData.get('is_promo') === 'on',
        old_price: formData.get('old_price') ? Number(formData.get('old_price')) : null,
        is_vegetarian: formData.get('is_vegetarian') === 'on',
        is_spicy: formData.get('is_spicy') === 'on',
        is_gluten_free: formData.get('is_gluten_free') === 'on',
        upsell_ids: formData.get('upsell_ids') ? JSON.parse(formData.get('upsell_ids') as string) : []
    })

    if (!validated.success) {
        console.error("Erreur validation plat:", validated.error.flatten())
        return { message: "Données invalides: " + Object.keys(validated.error.flatten().fieldErrors).join(', ') }
    }

    // Map schema `image_url` to DB `image_urls`
    const { image_url, ...dishData } = validated.data
    const insertData: any = {
        ...dishData,
        restaurant_id: restaurant.id,
        image_urls: image_url ? [image_url] : []
    }

    const { error } = await supabase
        .from('dishes')
        .insert(insertData)

    if (error) return { message: error.message }

    revalidatePath('/dashboard/menu')
    return { message: "Plat ajouté !" }
}

export async function updateDish(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    const id = formData.get('id') as string;
    if (!id) return { message: "ID plat manquant" }

    // Parse image_url correctly
    const imageUrl = formData.get('image_url')?.toString();
    const image_urls = imageUrl ? [imageUrl] : undefined;

    const validated = dishSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        category_id: formData.get('category_id'),
        is_available: true,
        is_featured: formData.get('is_featured') === 'on',
        is_promo: formData.get('is_promo') === 'on',
        old_price: formData.get('old_price') ? Number(formData.get('old_price')) : null,
        is_vegetarian: formData.get('is_vegetarian') === 'on',
        is_spicy: formData.get('is_spicy') === 'on',
        is_gluten_free: formData.get('is_gluten_free') === 'on',
        upsell_ids: formData.get('upsell_ids') ? JSON.parse(formData.get('upsell_ids') as string) : []
    })

    if (!validated.success) {
        return { message: "Données invalides" }
    }

    const updateData: any = {
        ...validated.data,
    }

    if (image_urls) {
        updateData.image_urls = image_urls
    }
    delete (updateData as any).image_url

    const { error } = await supabase
        .from('dishes')
        .update(updateData)
        .eq('id', id)

    if (error) return { message: error.message }

    revalidatePath('/dashboard/menu')
    return { message: "Plat mis à jour !" }
}

export async function toggleDishStatus(id: string, isAvailable: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('dishes')
        .update({ is_available: isAvailable })
        .eq('id', id)

    if (error) return { message: error.message }
    revalidatePath('/dashboard/menu')
    return { success: true }
}

export async function deleteDish(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('dishes').delete().eq('id', id)
    if (error) return { message: error.message }
    revalidatePath('/dashboard/menu')
    return { message: "Plat supprimé" }
}

export async function reorderDishes(items: { id: string, rank: number }[]) {
    const supabase = await createClient()

    for (const item of items) {
        await supabase
            .from('dishes')
            .update({ rank: item.rank })
            .eq('id', item.id)
    }

    revalidatePath('/dashboard/menu')
    revalidatePath('/[slug]')
    return { success: true }
}

export async function likeDish(dishId: string) {
    const supabase = await createClient()
    const { data: dish } = await supabase.from('dishes').select('likes_count').eq('id', dishId).single()

    const { data, error } = await supabase
        .from('dishes')
        .update({ likes_count: (dish?.likes_count || 0) + 1 })
        .eq('id', dishId)
        .select()
        .single()

    if (error) return { message: error.message }
    return { success: true, likes: data.likes_count }
}

export async function getPossibleUpsells(restaurantId: string, excludeId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('dishes')
        .select('id, name, price, image_urls')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)

    if (excludeId) {
        query = query.neq('id', excludeId)
    }

    const { data } = await query.order('name')
    return data || []
}

export async function getDishesByIds(ids: string[]) {
    if (!ids || ids.length === 0) return []
    const supabase = await createClient()
    const { data } = await supabase
        .from('dishes')
        .select('id, name, price, image_urls')
        .in('id', ids)
        .eq('is_available', true)

    return data || []
}
export async function getOrdersByIds(ids: string[]) {
    if (!ids || ids.length === 0) return []
    const supabase = await createClient()

    const { data } = await supabase
        .from('orders')
        .select(`
            *,
            tables(name),
            order_items(
                quantity,
                unit_price,
                dishes(name)
            )
        `)
        .in('id', ids)
        .order('created_at', { ascending: false })

    return data || []
}
