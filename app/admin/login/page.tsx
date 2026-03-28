import { AdminLoginForm } from '@/components/modules/super-admin/admin-login-form'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
    const adminClient = getAdminClient()
    
    // Check if any admin exists (Bypassing RLS with Admin Client)
    const { count, error } = await adminClient
        .from('app_admins')
        .select('id', { count: 'exact', head: true })

    if (error) {
        console.error("[ADMIN_LOGIN] Error checking admins:", error)
    }

    const noAdminsExist = count === 0
    console.log("[ADMIN_LOGIN] Admin count:", count, "Show Bootstrap:", noAdminsExist)

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden backdrop-blur-sm">
            {/* Login Card - Now centered as requested */}
            <div className="w-full max-w-[480px] relative z-10 space-y-8">
                <AdminLoginForm />

                {noAdminsExist && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                        <Link href="/admin/signup">
                            <button className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 hover:text-orange-700 bg-orange-50 px-6 py-2 rounded-full border border-orange-100 flex items-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95 shadow-sm">
                                <PlusCircle className="h-3 w-3" />
                                Première Installation Admin
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
