import { AdminSignupForm } from '@/components/modules/super-admin/admin-signup-form'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminSignupPage() {
    const adminClient = getAdminClient()

    // Safety: If an admin already exists, redirect to login
    const { count, error } = await adminClient
        .from('app_admins')
        .select('id', { count: 'exact', head: true })

    console.log("[ADMIN_SIGNUP] Current admin count:", count)

    if (error) {
        console.error("[ADMIN_SIGNUP] Error checking admins:", error)
    }

    if (count && count > 0) {
        console.log("[ADMIN_SIGNUP] Admins already exist, redirecting to login...")
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-[480px]">
                <AdminSignupForm />
            </div>
            <div className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                &copy; BOOTSTRAP SYSTEM &bull; INITIALIZATION REQUIRED
            </div>
        </div>
    )
}
