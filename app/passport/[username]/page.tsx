import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PassportCard } from '@/components/modules/passport/passport-card'

export default async function PassportPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const supabase = await createClient()

    // Fetch user passport data from profiles table
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (error || !profile) {
        notFound()
    }

    // Fetch reviews for the restaurant of this user
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, settings')
        .eq('owner_id', profile.id)
        .single()

    let reviews: any[] = []
    if (restaurant) {
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(3)
        reviews = reviewsData || []
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50 to-slate-100 py-12 px-4 flex items-center justify-center">
            <PassportCard
                profileImage={profile.profile_image}
                fullName={profile.full_name}
                bio={profile.bio}
                socialLinks={profile.social_links}
                customLinks={profile.custom_links}
                phone={profile.phone}
                email={profile.email}
                reviews={reviews}
                bannerImage={(restaurant?.settings as any)?.cover_image_url}
            />
        </div>
    )
}
