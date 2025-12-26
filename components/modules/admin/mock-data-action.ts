'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_CATEGORIES = [
    { name: '🔥 Populaires', rank: 1, icon: 'fire' },
    { name: '🍔 Burgers', rank: 2, icon: 'burger' },
    { name: '🥗 Salades', rank: 3, icon: 'leaf' },
    { name: '🍹 Boissons', rank: 4, icon: 'cocktail' },
]

const MOCK_DISHES = [
    { name: "Le Big Manly", description: "Double steak haché, cheddar fondant, sauce secrète.", price: 6500, category: '🍔 Burgers', image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
    { name: "Chicken Run", description: "Poulet croustillant, salade, tomates, oignons rouges.", price: 5000, category: '🍔 Burgers', image: "https://images.unsplash.com/photo-1615557960916-5f4791effe9d?auto=format&fit=crop&w=800&q=80" },
    { name: "César Palace", description: "Romaine, croûtons, parmesan, poulet grillé, sauce César.", price: 4500, category: '🥗 Salades', image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80" },
    { name: "Coca Cola", description: "33cl, bien frais.", price: 1000, category: '🍹 Boissons', image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80" },
    { name: "Frites Maison", description: "Doubles cuisson belge.", price: 2000, category: '🔥 Populaires', image: "https://images.unsplash.com/photo-1630384060421-a43b35661138?auto=format&fit=crop&w=800&q=80" }
]

export async function seedMockData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { message: "Non connecté" }

    const { data: restaurant } = await supabase.from('restaurants').select('id, slug').eq('owner_id', user.id).single()
    if (!restaurant) return { message: "Restaurant introuvable" }

    // 1. Create Categories
    const createdCats: Record<string, string> = {}

    for (const cat of MOCK_CATEGORIES) {
        // Check if exists
        const { data: existing } = await supabase.from('categories').select('id').eq('restaurant_id', restaurant.id).eq('name', cat.name).single()

        let catId = existing?.id

        if (!catId) {
            const { data: newCat } = await supabase.from('categories').insert({
                restaurant_id: restaurant.id,
                name: cat.name,
                rank: cat.rank
            }).select('id').single()
            catId = newCat?.id
        }

        if (catId) createdCats[cat.name] = catId
    }

    // 2. Create Dishes
    const dishesIds: string[] = []

    for (const dish of MOCK_DISHES) {
        const catId = createdCats[dish.category]
        if (!catId) continue

        // Check if dish exists
        const { data: existing } = await supabase.from('dishes').select('id').eq('restaurant_id', restaurant.id).eq('name', dish.name).single()

        if (!existing) {
            const { data: newDish } = await supabase.from('dishes').insert({
                restaurant_id: restaurant.id,
                category_id: catId,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                image_urls: [dish.image],
                is_available: true
            }).select('id').single()
            if (newDish) dishesIds.push(newDish.id)
        } else {
            dishesIds.push(existing.id)
        }
    }

    // 3. Create Mock Orders (last 7 days)
    if (dishesIds.length > 0) {
        for (let i = 0; i < 20; i++) {
            // Random Date
            const daysAgo = Math.floor(Math.random() * 7)
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)

            // Random Dish
            const dishId = dishesIds[Math.floor(Math.random() * dishesIds.length)]
            const quantity = Math.floor(Math.random() * 3) + 1
            const price = 5000 // approx

            // Create Order
            const { data: order } = await supabase.from('orders').insert({
                restaurant_id: restaurant.id,
                status: 'completed', // For analytics
                total_amount: price * quantity,
                created_at: date.toISOString()
            }).select('id').single()

            if (order) {
                await supabase.from('order_items').insert({
                    order_id: order.id,
                    dish_id: dishId,
                    quantity: quantity,
                    unit_price: price,
                    total_price: price * quantity
                })

                // Fake Payment
                await supabase.from('payments').insert({
                    order_id: order.id,
                    restaurant_id: restaurant.id,
                    amount: price * quantity,
                    status: 'success',
                    provider: 'CASH',
                    created_at: date.toISOString()
                })
            }
        }
    }

    revalidatePath('/dashboard')
    return { message: "Données de test générées avec succès!" }
}
