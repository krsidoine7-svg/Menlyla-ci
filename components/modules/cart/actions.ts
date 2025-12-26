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
})

export async function submitOrder(data: any) {
    const supabase = await createClient()

    const validated = orderSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, message: "Données invalides" }
    }

    const { restaurant_id, items, table_id } = validated.data
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            restaurant_id,
            status: 'pending',
            total_amount,
            table_id: table_id
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
