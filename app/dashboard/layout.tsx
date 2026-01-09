import { DashboardSidebar } from '@/components/modules/admin/sidebar'
import { MobileHeader } from '@/components/modules/admin/mobile-header'
import { getRestaurantSlug } from '@/components/modules/admin/actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const slug = await getRestaurantSlug()

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <DashboardSidebar restaurantSlug={slug} />
            </div>
            <div className="flex flex-col">
                <MobileHeader restaurantSlug={slug} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-10">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
