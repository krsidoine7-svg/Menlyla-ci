'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const orderSchema = z.object({
    restaurant_id: z.string().uuid(),
    items: z.array(z.object({
        dish_id: z.string().uuid(),
        quantity: z.number().min(1),
        price: z.number(),
        name: z.string()
    })),
    table_id: z.string().uuid().optional().nullable(),
    customer_name: z.string().optional(),
    dining_type: z.enum(['dine_in', 'take_away']).optional().default('dine_in'),
})

export async function submitOrder(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const validated = orderSchema.safeParse(data)
    if (!validated.success) {
        console.error("Validation error:", validated.error.flatten())
        return { success: false, message: "Données invalides: " + Object.keys(validated.error.flatten().fieldErrors).join(', ') }
    }

    const { restaurant_id, items, table_id, customer_name, dining_type } = validated.data
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Verify table belongs to restaurant if provided
    let finalTableId = table_id
    if (table_id) {
        const { data: tableData } = await supabase
            .from('tables')
            .select('id')
            .eq('id', table_id)
            .eq('restaurant_id', restaurant_id)
            .single()

        if (!tableData) {
            console.error("Invalid table ID for this restaurant:", table_id)
            return { success: false, message: "La table associée n'existe plus ou n'appartient pas à ce restaurant. Veuillez scanner à nouveau le QR code de votre table." }
        }
    }

    // Append customer name to instructions if provided
    let instructions = customer_name ? `Client: ${customer_name}` : ""

    // Fetch restaurant settings to check payment mode
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('settings')
        .eq('id', restaurant_id)
        .single()
    
    // Use 'pending' as it is the valid database enum for new orders
    const initialStatus = 'pending'

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            restaurant_id,
            status: initialStatus as any,
            total_amount,
            table_id: finalTableId,
            customer_id: user?.id || null,
            special_instructions: instructions,
            dining_type: dining_type || 'dine_in'
        })
        .select()
        .single()

    if (error) {
        console.error("Order creation error:", error)
        // If it's still a foreign key error, tell the user politely
        if (error.code === '23503' && error.message.includes('table_id')) {
            return { success: false, message: "Erreur de table: Le QR code scanné semble invalide ou n'existe plus." }
        }
        return { success: false, message: `Erreur création commande: ${error.message}` }
    }


    // 2. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        dish_id: item.dish_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        console.error("Order items creation error:", itemsError)
        return { success: false, message: `Erreur détails commande: ${itemsError.message}` }
    }

    return { success: true, orderId: order.id }
}
