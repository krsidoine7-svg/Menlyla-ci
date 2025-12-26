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
})

export type RestaurantState = {
    errors?: {
        name?: string[]
        slug?: string[]
        description?: string[]
        phone?: string[]
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
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        phone: formData.get('phone'),
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation. Vérifiez les champs."
        }
    }

    // 3. Insert into DB
    const { error } = await supabase
        .from('restaurants')
        .insert({
            ...validatedFields.data,
            owner_id: user.id
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { message: "Ce slug est déjà utilisé." }
        }
        console.error("Erreur création restaurant:", error)
        return { message: `Erreur interne: ${error.message} (Code: ${error.code})` }
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
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        phone: formData.get('phone'),
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation."
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
        return { message: "Erreur lors de la mise à jour." }
    }

    revalidatePath('/dashboard/settings')
    return { message: "Restaurant mis à jour avec succès !" }
}
