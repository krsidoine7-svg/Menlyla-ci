'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validations
const restaurantSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères")
        .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
    description: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    maps_link: z.string().url("Lien Google Maps invalide").optional().or(z.literal('')),
    email: z.string().email("Email invalide").optional().or(z.literal('')),
    currency: z.string().default('FCFA'),
    logo_url: z.string().optional(),
    banner_url: z.string().optional(),
    social_links: z.any().optional(),
    settings: z.any().optional(),
})

export type RestaurantState = {
    errors?: {
        name?: string[]
        slug?: string[]
        description?: string[]
        phone?: string[]
        whatsapp?: string[]
        address?: string[]
        city?: string[]
        maps_link?: string[]
        email?: string[]
        currency?: string[]
        _form?: string[]
    }
    message?: string | null
}

export async function createRestaurant(prevState: RestaurantState, formData: FormData): Promise<RestaurantState> {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: "Vous devez être connecté" }
    }

    // 2. Validate Input
    const rawData = {
        name: formData.get('name') || undefined,
        slug: formData.get('slug') || undefined,
        description: formData.get('description') || undefined,
        phone: formData.get('phone') || undefined,
        whatsapp: formData.get('whatsapp') || undefined,
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        maps_link: formData.get('maps_link') || undefined,
        email: formData.get('email') || undefined,
        currency: formData.get('currency') || undefined,
        logo_url: formData.get('logo_url') || undefined,
        banner_url: formData.get('banner_url') || undefined,
        social_links: formData.get('social_links') ? JSON.parse(formData.get('social_links') as string) : {},
        settings: formData.get('settings') ? JSON.parse(formData.get('settings') as string) : {},
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation. Vérifiez les champs."
        }
    }

    // 3. Insert into DB
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
            ...validatedFields.data,
            owner_id: user.id
        })
        .select('id')
        .single()

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { message: "Ce slug est déjà utilisé." }
        }
        console.error("Erreur création restaurant:", error)
        return { message: `Erreur interne: ${error.message} (Code: ${error.code})` }
    }

    // 4. Default categories seeding
    const defaultCategories = [
        { name: '🍴 Entrées', rank: 0 },
        { name: '🥘 Plats', rank: 1 },
        { name: '🥤 Boissons', rank: 2 },
        { name: '🍰 Desserts', rank: 3 }
    ]

    if (restaurant?.id) {
        const { error: seedError } = await supabase
            .from('categories')
            .insert(defaultCategories.map(cat => ({
                ...cat,
                restaurant_id: restaurant.id
            })))

        if (seedError) console.error('Erreur seeding catégories par défaut:', seedError)
    }

    const menuSeed = validatedFields.data.settings?.menu_seed
    const price = Number(menuSeed?.dish?.price)
    // Optional: add a sample dish to the first created category if menuSeed exists
    if (restaurant?.id && menuSeed?.dish?.name && !Number.isNaN(price) && price > 0) {
        // Get the first category we just created (Entrées or Plats)
        const { data: firstCat } = await supabase
            .from('categories')
            .select('id')
            .eq('restaurant_id', restaurant.id)
            .eq('name', '🥘 Plats')
            .single()

        if (firstCat?.id) {
            await supabase
                .from('dishes')
                .insert({
                    restaurant_id: restaurant.id,
                    category_id: firstCat.id,
                    name: menuSeed.dish.name,
                    description: menuSeed.dish.description || null,
                    price,
                    is_available: true,
                })
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function getRestaurant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    return data
}

export async function updateRestaurant(restaurantId: string, prevState: RestaurantState, formData: FormData): Promise<RestaurantState> {
    const supabase = await createClient()

    const rawData = {
        name: formData.get('name') || undefined,
        slug: formData.get('slug') || undefined,
        description: formData.get('description') || undefined,
        phone: formData.get('phone') || undefined,
        whatsapp: formData.get('whatsapp') || undefined,
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        maps_link: formData.get('maps_link') || undefined,
        email: formData.get('email') || undefined,
        currency: formData.get('currency') || undefined,
        logo_url: formData.get('logo_url') || undefined,
        banner_url: formData.get('banner_url') || undefined,
        social_links: formData.get('social_links') ? JSON.parse(formData.get('social_links') as string) : {},
        settings: formData.get('settings') ? JSON.parse(formData.get('settings') as string) : {},
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        console.error("Validation Error:", validatedFields.error.flatten().fieldErrors)
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation. Vérifiez les champs."
        }
    }

    const { error } = await supabase
        .from('restaurants')
        .update(validatedFields.data)
        .eq('id', restaurantId)

    if (error) {
        if (error.code === '23505') {
            return { message: "Ce slug est déjà utilisé." }
        }
        console.error("Erreur mise à jour restaurant:", error)
        return { message: `Erreur lors de la mise à jour: ${error.message}` }
    }

    revalidatePath('/dashboard/settings')
    if (validatedFields.data.slug) {
        revalidatePath(`/${validatedFields.data.slug}`)
    }
    return { message: "Restaurant mis à jour avec succès !" }
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

export async function callWaiter(restaurantId: string, tableId: string, type: 'waiter' | 'bill') {
    const supabase = await createClient()

    // Create a special order of type 0 for calls
    const { error } = await supabase
        .from('orders')
        .insert({
            restaurant_id: restaurantId,
            table_id: tableId,
            total_amount: 0,
            special_instructions: type === 'bill' ? '[CALL_BILL]' : '[CALL_WAITER]',
            status: 'pending'
        })

    if (error) return { message: error.message }
    return { success: true }
}
