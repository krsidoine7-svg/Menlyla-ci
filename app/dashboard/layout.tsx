import { DashboardSidebar } from '@/components/modules/admin/sidebar'
import { MobileHeader } from '@/components/modules/admin/mobile-header'
import { getRestaurantInfo } from '@/components/modules/admin/actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const restaurant = await getRestaurantInfo()
    const slug = restaurant?.slug
    const plan = restaurant?.plan || 'solo'

    return (
        <div className="dashboard-theme min-h-screen bg-background text-foreground">
            <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <div className="hidden border-r bg-muted/40 md:block">
                    <DashboardSidebar restaurantSlug={slug} plan={plan} />
                </div>
                <div className="flex flex-col min-w-0">
                    <MobileHeader restaurantSlug={slug} plan={plan} />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-10 overflow-x-hidden">
                        <div className="mx-auto w-full max-w-7xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )

}
