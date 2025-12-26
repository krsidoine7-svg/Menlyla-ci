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
    table_number: z.number().optional(), // Or table_id
    customer_name: z.string().optional(),
})

export async function submitOrder(data: any) {
    const supabase = await createClient()

    const validated = orderSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, message: "Données invalides" }
    }

    const { restaurant_id, items, table_number } = validated.data

    // 1. Create Order
    // Need table_id if table_number provided?
    // Schema has table_id. Let's find table_id from number if possible, or leave null for counter order.
    // For MVP, if table_number is purely informational in UI, we might need to look it up.
    // Let's assume table_id comes from QR or manual input maps to an ID. 
    // Simplified: Just store table_id if we have it, or NULL.
    // For now, let's create the order with status 'pending'.

    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            restaurant_id,
            status: 'pending',
            total_amount,
            // table_id: ... // Implement logic to find table by number if needed or passed
        })
        .select()
        .single()

    if (error) {
        console.error(error)
        return { success: false, message: "Erreur création commande" }
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
        return { success: false, message: "Erreur détails commande" }
    }

    return { success: true, orderId: order.id }
}
