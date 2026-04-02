
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
    Shield, 
    ShieldCheck, 
    ShieldAlert,
    UserPlus, 
    Trash2, 
    Mail, 
    Calendar,
    Settings,
    MoreVertical,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { EditAdminButton } from '@/components/modules/super-admin/edit-admin-button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function CompteAdminPage() {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    // Verify if current user is admin
    const { data: currentAdmin } = await adminClient
        .from('app_admins')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    if (!currentAdmin) {
        redirect('/admin')
    }

    // Fetch all admins and their profiles
    // Re-using the manual join technique because of missing FK relationship
    const [adminsRes, profilesRes] = await Promise.all([
        adminClient.from('app_admins').select('id, email, is_super_admin, permissions, created_at').order('created_at', { ascending: true }),
        adminClient.from('profiles').select('id, full_name, username, profile_image')
    ])

    const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, p]))
    const admins = (adminsRes.data || []).map(a => ({
        ...a,
        profile: profilesMap.get(a.id)
    }))

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3 italic uppercase">
                        <ShieldAlert className="h-8 w-8 text-orange-600" />
                        Équipe Administrative
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl font-medium">Gestion des comptes disposant d'un accès complet à la plateforme Menlyla.</p>
                </div>
                <Link 
                    href="/admin/compteAdmin/nouveau" 
                    className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl h-11 px-6 shadow-xl shadow-slate-200 transition-all gap-2 group whitespace-nowrap"
                >
                    <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" /> 
                    Ajouter un Admin
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <Card key={admin.id} className={cn(
                        "border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group",
                        admin.is_super_admin ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white" : "bg-white"
                    )}>
                        {admin.is_super_admin && (
                            <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                <ShieldCheck className="h-20 w-20" />
                            </div>
                        )}
                        
                        <CardHeader className="pb-4 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all duration-500 group-hover:scale-110",
                                    admin.is_super_admin 
                                        ? "bg-orange-500/20 border-orange-500/30 text-orange-400" 
                                        : "bg-slate-50 border-slate-100 text-slate-400"
                                )}>
                                    {admin.profile?.full_name?.charAt(0) || admin.email?.charAt(0).toUpperCase() || '?'}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {/* Edit permissions button — visible to super admins only */}
                                    <EditAdminButton admin={admin} currentUserId={user.id} />

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className={cn(
                                                "h-8 w-8 p-0 rounded-lg",
                                                admin.is_super_admin ? "hover:bg-white/10 text-white/40" : "hover:bg-slate-100 text-slate-400"
                                            )}>
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</DropdownMenuLabel>
                                            <DropdownMenuItem className="font-bold flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> Envoyer un email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.id !== admin.id && (
                                                <DropdownMenuItem className="font-bold text-destructive focus:bg-destructive/5 flex items-center gap-2">
                                                    <Trash2 className="h-4 w-4 text-destructive/60" /> Retirer les droits
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-1">
                                <CardTitle className={cn(
                                    "text-xl font-black truncate",
                                    admin.is_super_admin ? "text-orange-400" : "text-slate-900"
                                )}>
                                    {admin.profile?.full_name || 'Admin'} 
                                    {user.id === admin.id && <span className="text-xs font-medium ml-2 opacity-50 italic">(Vous)</span>}
                                </CardTitle>
                                <CardDescription className={admin.is_super_admin ? "text-slate-400 font-bold" : "text-slate-500 font-bold"}>
                                    {admin.email}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="relative z-10 pt-0">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {admin.is_super_admin ? (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                                        Super-Admin
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                                        Éditeur System
                                    </Badge>
                                )}
                                <Badge variant="outline" className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                    admin.is_super_admin ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-300"
                                )}>
                                    ID: {admin.id.substring(0, 8)}
                                </Badge>
                            </div>

                            <div className={cn(
                                "flex items-center gap-2 text-xs font-black uppercase tracking-tighter",
                                admin.is_super_admin ? "text-slate-500" : "text-slate-400"
                            )}>
                                <Calendar className="h-3 w-3" />
                                Membre depuis {new Date(admin.created_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/30 rounded-3xl overflow-hidden">
                <CardContent className="p-12 text-center max-w-md mx-auto">
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 underline underline-offset-4 decoration-orange-500/30">Sécurité Maximale</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Chaque administrateur listé ici à le pouvoir de modifier les paramètres critiques de la plateforme Menlyla. Gérez ces accès avec précaution.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
