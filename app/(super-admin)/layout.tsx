import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { SuperAdminSidebar } from '@/components/modules/super-admin/sidebar'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user exists in app_admins table using Admin Client to bypass RLS issues
    const adminClient = getAdminClient()
    const { data: adminRecord } = await adminClient
        .from('app_admins')
        .select('id, is_super_admin, permissions')
        .eq('id', user.id)
        .maybeSingle()

    if (!adminRecord) {
        // Not a system admin, redirect to admin login or main dashboard
        redirect('/admin/login')
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
            {/* Sidebar — receives full admin object for permission-based nav filtering */}
            <div className="hidden lg:block h-full">
                <SuperAdminSidebar admin={adminRecord} isSuperAdmin={adminRecord.is_super_admin} />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                <div className="py-8 px-6 lg:px-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
