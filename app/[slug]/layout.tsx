import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ slug: string }>
    children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, description')
        .eq('slug', slug)
        .single()

    if (!restaurant) {
        return {
            title: 'Restaurant Introuvable'
        }
    }

    return {
        title: `${restaurant.name} | Menu Digital`,
        description: restaurant.description || `Découvrez le menu de ${restaurant.name}`,
    }
}

export default async function RestaurantLayout({
    children,
    params,
}: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // Verify restaurant exists
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .single()

    if (error || !restaurant) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Mobile-first layout */}
            {children}
        </div>
    )
}
