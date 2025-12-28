'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function createTable(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return { message: "Restaurant introuvable" }

    // 1. Create Table
    const { data: table, error: tableError } = await supabase
        .from('tables')
        .insert({
            restaurant_id: restaurant.id,
            name: String(name)
        })
        .select()
        .single()

    if (tableError) {
        if (tableError.code === '23505') {
            return { message: "Une table avec ce nom existe déjà." }
        }
        return { message: `Erreur table: ${tableError.message}` }
    }

    // 2. Create QR Code
    const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert({
            restaurant_id: restaurant.id,
            table_id: table.id,
            token: crypto.randomUUID()
        })
        .select()
        .single()

    if (qrError) return { message: `Erreur QR: ${qrError.message}` }

    revalidatePath('/dashboard/tables')
    return {
        message: "Table créée !",
        success: true,
        data: { table, qrCode }
    }
}


export async function deleteTable(id: string) {
    const supabase = await createClient()
    await supabase.from('tables').delete().eq('id', id)
    revalidatePath('/dashboard/tables')
}

export async function deleteTables(ids: string[]) {
    const supabase = await createClient()
    await supabase.from('tables').delete().in('id', ids)
    revalidatePath('/dashboard/tables')
}

export async function regenerateQrCode(tableId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: "Non connecté" }

    // Check restaurant ownership via table
    const { data: table } = await supabase
        .from('tables')
        .select('restaurant_id')
        .eq('id', tableId)
        .single()

    if (!table) return { message: "Table introuvable" }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', table.restaurant_id)
        .eq('owner_id', user.id)
        .single()

    if (!restaurant) return { message: "Non autorisé" }

    // Delete any existing (broken?) QR
    await supabase.from('qr_codes').delete().eq('table_id', tableId)

    // Create new
    const { data: newQr, error } = await supabase.from('qr_codes').insert({
        restaurant_id: restaurant.id,
        table_id: tableId,
        token: crypto.randomUUID()
    }).select().single()

    if (error) return { message: "Erreur génération QR" }

    revalidatePath('/dashboard/tables')
    return {
        message: "QR Code généré !",
        success: true,
        data: newQr
    }
}
