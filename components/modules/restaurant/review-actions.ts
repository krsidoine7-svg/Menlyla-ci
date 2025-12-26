'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const reviewSchema = z.object({
    restaurant_id: z.string().uuid(),
    dish_id: z.string().uuid().optional().nullable(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(2, "Le commentaire est trop court"),
    customer_name: z.string().optional().default('Client Anonyme'),
})

export async function submitReview(data: any) {
    const supabase = await createClient()

    const validated = reviewSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, message: "Données invalides : " + validated.error.issues[0].message }
    }

    const { error } = await supabase
        .from('reviews')
        .insert(validated.data)

    if (error) {
        console.error("Error submitting review:", error)
        return { success: false, message: "Erreur lors de l'envoi de l'avis" }
    }

    revalidatePath('/[slug]', 'layout')
    return { success: true, message: "Merci pour votre avis !" }
}

export async function getRestaurantReviews(restaurantId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            dishes(name)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching reviews:", error)
        return []
    }

    return data
}

export async function deleteReview(reviewId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/reviews')
    return { success: true }
}
