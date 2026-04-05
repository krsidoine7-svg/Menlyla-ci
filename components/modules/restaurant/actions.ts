'use server'
import { Suspense } from 'react'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { GeniusPayClient } from '@/lib/geniuspay/client'
import { getSaaSGeniusPayClient } from '@/app/(super-admin)/admin/actions'

// Validations
const restaurantSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères")
        .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
    description: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    maps_link: z.string().optional().nullable(),
    email: z.string().email("Email invalide").optional().or(z.literal('')).nullable(),
    currency: z.string().default('FCFA'),
    logo_url: z.any().optional(),
    banner_url: z.any().optional(),
    settings: z.any().optional(),
    social_links: z.any().optional(),
    plan: z.enum(['solo', 'pro']).default('solo'),
    geniuspay_api_key: z.string().optional().nullable(),
    geniuspay_api_secret: z.string().optional().nullable(),
    geniuspay_webhook_secret: z.string().optional().nullable(),
})

export type RestaurantState = {
    errors?: { [key: string]: string[] }
    message?: string | null
    success?: boolean
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
        settings: formData.get('settings') ? JSON.parse(formData.get('settings') as string) : {},
        plan: formData.get('plan') || 'solo',
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        console.error("Zod Validation Fail:", validatedFields.error.flatten().fieldErrors)
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation. Vérifiez les champs."
        }
    }

    // 3. Upsert into DB (Check if user already has one - for Pro flow)
    const { data: existingRestaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

    // Clean data for the 'restaurants' table which has strict schema
    const dbData = {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        description: validatedFields.data.description,
        phone: validatedFields.data.phone,
        whatsapp: validatedFields.data.whatsapp,
        address: validatedFields.data.address,
        currency: validatedFields.data.currency,
        plan: validatedFields.data.plan,
        owner_id: user.id,
        maps_link: validatedFields.data.maps_link,
        email: validatedFields.data.email,
        settings: validatedFields.data.settings,
        subscription_status: validatedFields.data.plan === 'solo' ? 'active' : (existingRestaurant ? 'active' : 'pending'),
        updated_at: new Date().toISOString()
    }

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .upsert({
            id: existingRestaurant?.id,
            ...dbData
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
        { name: '🔥 Nos Incontournables', rank: 1 },
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
            .eq('name', '🔥 Nos Incontournables')
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
                    is_featured: true,
                    tags: ['⭐ Spécialité', '🔥 Plat Phare']
                })
        }
    }

    // 4b. Generate Tables & QR Codes
    const tableCount = Number(formData.get('table_count'))
    if (restaurant?.id && !Number.isNaN(tableCount) && tableCount > 0) {
        const tablesToCreate = Array.from({ length: tableCount }, (_, i) => ({
            restaurant_id: restaurant.id,
            name: `Table ${i + 1}`
        }))

        const { data: createdTables, error: tablesError } = await supabase
            .from('tables')
            .insert(tablesToCreate)
            .select('id')

        if (tablesError) {
            console.error('Erreur création tables:', tablesError)
        } else if (createdTables) {
            // Generate QR codes for each table
            const qrCodesToCreate = createdTables.map(table => ({
                restaurant_id: restaurant.id,
                table_id: table.id,
                token: crypto.randomUUID()
            }))

            const { error: qrError } = await supabase
                .from('qr_codes')
                .insert(qrCodesToCreate)

            if (qrError) console.error('Erreur génération QR codes:', qrError)
        }
    } else if (restaurant?.id) {
        // If no tables, create at least one "Vente à emporter" or generic QR? 
        // For now, we respect the user choice of 0 tables (maybe delivery only).
    }

    // 4b. Seed Restaurant Settings (Branding & Hours)
    if (restaurant?.id) {
        const settingsPayload = validatedFields.data.settings
        await supabase
            .from('restaurant_settings')
            .upsert({
                restaurant_id: restaurant.id,
                logo_url: validatedFields.data.logo_url || null,
                cover_image_url: validatedFields.data.banner_url || null,
                primary_color: settingsPayload?.design?.color || '#FF5C3C',
                hours: settingsPayload?.hours || { mode: 'simple', simple: { open: '08:00', close: '22:00' } },
                updated_at: new Date().toISOString()
            })
    }

    revalidatePath('/dashboard')

    // 5. Update Profile (Persona) if provided
    const profileUsername = formData.get('profile_username') as string
    const profileFullName = formData.get('profile_full_name') as string

    if (profileUsername || profileFullName) {
        const profileData = {
            username: profileUsername || undefined,
            full_name: profileFullName || undefined,
            bio: formData.get('profile_bio') as string || undefined,
            phone: formData.get('profile_phone') as string || undefined,
            email: formData.get('profile_email') as string || undefined,
            profile_image: formData.get('profile_image') as string || undefined,
            social_links: formData.get('profile_social_links') ? JSON.parse(formData.get('profile_social_links') as string) : undefined,
            updated_at: new Date().toISOString()
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)

        if (profileError) {
            console.error("Erreur mise à jour profil pendant onboarding:", profileError)
        }
    }

    // 5. Final redirection
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function initiateOnboardingPayment(plan: 'pro' | 'solo') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Check if restaurant exists, otherwise create skeleton
    const { data: existing } = await supabase
        .from('restaurants')
        .select('id, subscription_status')
        .eq('owner_id', user.id)
        .maybeSingle()

    let restaurantId = existing?.id

    if (!existing) {
        const { data: newRest, error: createError } = await supabase
            .from('restaurants')
            .insert({
                name: 'Mon Restaurant',
                slug: `temp-${user.id.slice(0, 8)}-${Date.now()}`,
                owner_id: user.id,
                plan,
                subscription_status: 'pending'
            })
            .select('id')
            .single()

        if (createError) throw createError
        restaurantId = newRest.id
    }

    // 2. Initiate Payment
    const setupFee = 2000
    const planFee = plan === 'pro' ? 9900 : 0
    const totalAmount = setupFee + planFee

    const adminClient = getAdminClient()
    const { data: paymentRecord, error: paymentError } = await adminClient
        .from('payments')
        .insert({
            restaurant_id: restaurantId,
            amount: totalAmount,
            status: 'pending',
            provider: 'GENIUSPAY',
            description: `Onboarding Menlyla - Forfait ${plan.toUpperCase()}`
        })
        .select()
        .single()

    if (paymentError) {
        console.error("Database error while creating payment record:", paymentError)
        throw new Error(`Erreur base de données: ${paymentError.message}`)
    }

    const geniuspay = await getSaaSGeniusPayClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    try {
        const geniusResponse = await geniuspay.initiatePayment({
            amount: totalAmount,
            currency: 'XOF',
            description: `Activation Menlyla - Forfait ${plan.toUpperCase()}`,
            customer: {
                name: user.user_metadata?.full_name || 'Partenaire Menlyla',
                phone: user.user_metadata?.phone || '',
                email: user.email || ''
            },
            success_url: `${baseUrl}/onboarding/success?plan=${plan}`,
            error_url: `${baseUrl}/onboarding/error`,
            metadata: {
                restaurant_id: restaurantId,
                payment_id: paymentRecord?.id,
                type: 'onboarding'
            }
        })

        if (geniusResponse.success && (geniusResponse.data.payment_url || geniusResponse.data.checkout_url)) {
            const finalUrl = geniusResponse.data.payment_url || geniusResponse.data.checkout_url
            if (paymentRecord) {
                await adminClient
                    .from('payments')
                    .update({
                        geniuspay_reference: geniusResponse.data.reference,
                        checkout_url: finalUrl
                    })
                    .eq('id', paymentRecord.id)
            }
            if (finalUrl) redirect(finalUrl)
        }

        console.error("GeniusPay Error Response:", geniusResponse)
        throw new Error(`Erreur GeniusPay: ${JSON.stringify(geniusResponse)}`)
    } catch (error) {
        // If it's a redirect, just throw it, don't log as error
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        console.error("Payment Initiation Failed:", error)
        throw error
    }
}

export async function getRestaurant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('restaurants')
        .select(`
            *,
            restaurant_settings(*)
        `)
        .eq('owner_id', user.id)
        .single()

    if (data) {
        // Merge generic JSON settings (from restaurants table) with structured settings (from separate table)
        // This ensures properties like 'hours' saved in the JSON column are available even if not in the structured table
        const genericSettings = data.settings || {}
        
        // Handle both Array (default Supabase) or single object (if joined differently)
        const structuredSettings = Array.isArray(data.restaurant_settings) 
            ? (data.restaurant_settings[0] || {}) 
            : (data.restaurant_settings || {})

        data.settings = {
            ...genericSettings, // { hours: ... }
            logo_url: data.logo_url, // PRIORITIZE top-level column if exists
            banner_url: data.banner_url,
            ...structuredSettings, // { logo_url: ... } (may override)
        }

        // Ensure key consistency: cover_image_url (DB) vs banner_url (Form)
        if (data.settings.cover_image_url && !data.settings.banner_url) {
            data.settings.banner_url = data.settings.cover_image_url
        }

        // Cleanup temporary property
        delete data.restaurant_settings
    }

        // Normalize Hours structure
        if (data.settings.hours) {
            const h = data.settings.hours
            
            // 1. If simple mode, expand to schedule if schedule is missing
            if (h.mode === 'simple' && h.simple && (!h.schedule || Object.keys(h.schedule).length === 0)) {
                h.schedule = {}
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                days.forEach(day => {
                    h.schedule[day] = { 
                        open: h.simple.open || '09:00', 
                        close: h.simple.close || '22:00', 
                        closed: false 
                    }
                })
            }

            // 2. Map 'advanced' (old key from onboarding) to 'schedule' (standard dashboard key)
            if (h.advanced && (!h.schedule || Object.keys(h.schedule).length === 0)) {
                h.schedule = h.advanced
            }

            // 3. Map 'is_closed' (onboarding) to 'is_on_break' (dashboard/frontend)
            if (h.is_closed !== undefined && h.is_on_break === undefined) {
                h.is_on_break = h.is_closed
            }
        }

        // Unpack theme_settings into top-level settings for backward compatibility
        if (data?.settings?.theme_settings) {
            data.settings = {
                ...data.settings,
                ...data.settings.theme_settings
            }
        }

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
        geniuspay_api_key: formData.get('geniuspay_api_key') || undefined,
        geniuspay_api_secret: formData.get('geniuspay_api_secret') || undefined,
        geniuspay_webhook_secret: formData.get('geniuspay_webhook_secret') || undefined,
    }

    const validatedFields = restaurantSchema.safeParse(rawData)

    if (!validatedFields.success) {
        console.error("Validation Error:", validatedFields.error.flatten().fieldErrors)
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation. Vérifiez les champs."
        }
    }

    // 1. Data Cleanup (Remove redundant keys from settings JSON before update)
    const cleanSettings = validatedFields.data.settings || {}
    if (cleanSettings.hours) {
        // If schedule exists, delete obsolete 'advanced' key (onboarding legacy)
        if (cleanSettings.hours.schedule && Object.keys(cleanSettings.hours.schedule).length > 0) {
            delete cleanSettings.hours.advanced
        }
        // Sync is_closed to is_on_break and delete legacy key
        if (cleanSettings.hours.is_closed !== undefined && cleanSettings.hours.is_on_break === undefined) {
            cleanSettings.hours.is_on_break = cleanSettings.hours.is_closed
        }
        if (cleanSettings.hours.is_on_break !== undefined) {
            delete cleanSettings.hours.is_closed
        }
    }

    // Remove top-level garbage from the settings object itself (merged from separate table earlier)
    delete cleanSettings.restaurant_id
    delete cleanSettings.updated_at
    delete cleanSettings.created_at

    // 2. Update main restaurant table
    const dbUpdate = {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        description: validatedFields.data.description,
        phone: validatedFields.data.phone,
        whatsapp: validatedFields.data.whatsapp,
        address: validatedFields.data.address,
        currency: validatedFields.data.currency,
        maps_link: validatedFields.data.maps_link,
        email: validatedFields.data.email,
        logo_url: validatedFields.data.logo_url,
        banner_url: validatedFields.data.banner_url,
        social_links: validatedFields.data.social_links,
        settings: cleanSettings,
        geniuspay_api_key: validatedFields.data.geniuspay_api_key,
        geniuspay_api_secret: validatedFields.data.geniuspay_api_secret,
        geniuspay_webhook_secret: validatedFields.data.geniuspay_webhook_secret,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from('restaurants')
        .update(dbUpdate)
        .eq('id', restaurantId)

    if (error) {
        if (error.code === '23505') {
            return { message: "Ce slug est déjà utilisé." }
        }
        console.error("Erreur mise à jour restaurant:", error)
        return { message: `Erreur lors de la mise à jour: ${error.message}` }
    }

    // Update Separate Restaurant Settings Table
    const settingsPayload = validatedFields.data.settings || {}

    const settingsUpdate = {
        restaurant_id: restaurantId,
        updated_at: new Date().toISOString(),
        logo_url: validatedFields.data.logo_url,
        cover_image_url: validatedFields.data.banner_url,
        primary_color: settingsPayload.primary_color,
        hours: settingsPayload.hours,
        social_links: validatedFields.data.social_links,
        // Store flexible theme options in the JSONB column
        theme_settings: {
            secondary_color: settingsPayload.secondary_color,
            use_gradient: settingsPayload.use_gradient,
        }
    }

    const { error: settingsError } = await supabase
        .from('restaurant_settings')
        .upsert(settingsUpdate)

    if (settingsError) {
        console.error("Erreur mise à jour restaurant_settings:", settingsError)
        return { message: `Erreur sauvegarde apparence: ${settingsError.message}` }
    }


    // Unify: Also handle profile data if provided
    const profileUsername = formData.get('profile_username') as string
    const profileFullName = formData.get('profile_full_name') as string

    if (profileUsername || profileFullName) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const profileData = {
                username: profileUsername || undefined,
                full_name: profileFullName || undefined,
                bio: formData.get('profile_bio') as string || undefined,
                phone: formData.get('profile_phone') as string || undefined,
                email: formData.get('profile_email') as string || undefined,
                profile_image: formData.get('profile_image') as string || undefined,
                social_links: formData.get('profile_social_links') ? JSON.parse(formData.get('profile_social_links') as string) : undefined,
                custom_links: formData.get('profile_custom_links') ? JSON.parse(formData.get('profile_custom_links') as string) : undefined,
                updated_at: new Date().toISOString()
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id)

            if (profileError) {
                console.error("Erreur mise à jour profil unifié:", profileError)
            }
        }
    }

    revalidatePath('/dashboard/settings')
    if (validatedFields.data.slug) {
        revalidatePath(`/${validatedFields.data.slug}`)
    }
    return { success: true, message: "Paramètres mis à jour avec succès !" }
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
export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return data
}
