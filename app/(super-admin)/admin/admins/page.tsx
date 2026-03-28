import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Shield, UserPlus, Trash2, ShieldCheck, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AdminsManagementPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    // Verify if current user is SUPER admin
    const { data: currentAdmin } = await supabase
        .from('app_admins')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

    if (!currentAdmin?.is_super_admin) {
        // Not authorized for this page
        redirect('/admin')
    }

    // List all admins
    const { data: admins } = await supabase
        .from('app_admins')
        .select('*')
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Équipe Admin</h1>
                    <p className="text-slate-500 font-medium">Gérez les accès privilégiés à la plateforme Menlyla.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-orange-900/10 gap-2">
                    <UserPlus className="h-4 w-4" /> Ajouter un collaborateur
                </Button>
            </div>

            <div className="grid gap-6">
                {admins?.map((admin) => (
                    <Card key={admin.id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={admin.is_super_admin ? "h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200" : "h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200"}>
                                        {admin.is_super_admin ? <ShieldCheck className="h-6 w-6 text-orange-600" /> : <Shield className="h-6 w-6 text-slate-400" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{admin.email}</span>
                                            {admin.is_super_admin && <Badge className="bg-orange-600 text-[10px] font-black uppercase tracking-wider h-5">Super-Admin</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> System ID: {admin.id.substring(0, 8)}...</span>
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Membre depuis {new Date(admin.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Don't allow deleting self or super admin if not authorized */}
                                    {user.id !== admin.id && !admin.is_super_admin && (
                                        <Button variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-xl">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                    {user.id === admin.id && (
                                        <Badge variant="outline" className="text-slate-400 font-bold">C'est vous</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="p-8 text-center text-slate-400">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">Les nouveaux administrateurs peuvent être ajoutés en les sélectionnant dans la section <Link href="/admin/users" className="text-orange-600 hover:underline">Utilisateurs</Link>.</p>
                </CardContent>
            </Card>
        </div>
    )
}

import Link from 'next/link'
