
import { CreateAdminForm } from '@/components/modules/super-admin/create-admin-form'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewAdminPage() {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    // Verify if current user is SUPER admin (only super admins can create other admins)
    const { data: currentAdmin } = await adminClient
        .from('app_admins')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle()

    if (!currentAdmin?.is_super_admin) {
        redirect('/admin/compteAdmin')
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest mb-1 group cursor-pointer">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        <Link href="/admin/compteAdmin">Retour à la liste</Link>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3 italic uppercase">
                        <ShieldPlus className="h-8 w-8 text-indigo-600" />
                        Nouveau Collaborateur
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl font-medium">Configurez un nouvel accès administrateur avec des droits personnalisés.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CreateAdminForm />
            </div>
        </div>
    )
}
