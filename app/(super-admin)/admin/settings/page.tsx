import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
    Settings, 
    Bell, 
    ShieldCheck, 
    Globe, 
    Lock,
    Save,
    Webhook,
    Percent,
    AlertTriangle,
    Key,
    Activity,
    Smartphone
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecretInput } from '@/components/modules/super-admin/secret-input'

export default async function AdminSettingsPage() {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    // Verify admin
    const { data: admin } = await adminClient
        .from('app_admins')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    if (!admin) redirect('/admin')

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3 italic uppercase">
                        <Settings className="h-8 w-8 text-slate-800" />
                        Configurations
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl mt-1">Supervisez le cœur de la plateforme, de la sécurité aux tarifs, en passant par les APIs.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-xl shadow-emerald-500/20 gap-2 transition-all hover:scale-105">
                    <Save className="h-4 w-4" /> Sauvegarder tout
                </Button>
            </div>

            <Tabs defaultValue="plateforme" className="w-full space-y-6">
                <TabsList className="bg-white p-2 h-auto rounded-3xl border border-slate-100 shadow-sm gap-2 flex flex-wrap md:flex-nowrap justify-start">
                    <TabsTrigger value="plateforme" className="rounded-2xl font-bold px-6 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all text-slate-500">
                        <Globe className="h-4 w-4 mr-2" /> Plateforme & Tarifs
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-2xl font-bold px-6 py-3 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm transition-all text-slate-500">
                        <Bell className="h-4 w-4 mr-2" /> Alertes & Notifs
                    </TabsTrigger>
                    <TabsTrigger value="api" className="rounded-2xl font-bold px-6 py-3 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-slate-500">
                        <Webhook className="h-4 w-4 mr-2" /> Webhooks & API
                    </TabsTrigger>
                    <TabsTrigger value="securite" className="rounded-2xl font-bold px-6 py-3 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:shadow-sm transition-all text-slate-500">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Mon Compte & Sécurité
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="plateforme" className="space-y-6 mt-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase text-indigo-950">
                                <Percent className="h-5 w-5 text-indigo-600" /> Tarification & Commissions
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">Définissez les frais globaux appliqués par Menlyla aux transactions des restaurants.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-slate-700 text-sm uppercase tracking-tight">Frais de Commission Menlyla</Label>
                                <div className="relative">
                                    <Input defaultValue="2.5" type="number" step="0.1" className="h-12 rounded-xl border-slate-200 font-black text-lg pl-4 pr-12 focus-visible:ring-indigo-500" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ frais GeniusPay/Lygos inclus</p>
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-slate-700 text-sm uppercase tracking-tight">Abonnement PRO (Prix Mensuel)</Label>
                                <div className="relative">
                                    <Input defaultValue="25000" type="number" step="1000" className="h-12 rounded-xl border-slate-200 font-black text-lg pl-4 pr-16 focus-visible:ring-indigo-500" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">XOF</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facturé automatiquement chaque mois</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-rose-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-rose-50/30 border-b border-rose-100">
                            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase text-rose-950">
                                <AlertTriangle className="h-5 w-5 text-rose-600" /> Globals & Urgences
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-rose-600/80">Paramètres système de bas-niveau.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-rose-100 bg-rose-50/20 group hover:shadow-md transition-all">
                                <div className="space-y-1">
                                    <Label className="text-base font-black uppercase tracking-tight text-slate-900">Activer le Mode Maintenance</Label>
                                    <p className="text-xs font-bold text-slate-500">Rend la plateforme client inaccessible et affiche une page 'En travaux'. Côté Admin reste accessible.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-rose-600" />
                            </div>
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20 group hover:shadow-md transition-all">
                                <div className="space-y-1">
                                    <Label className="text-base font-black uppercase tracking-tight text-slate-900">Désactiver les Inscriptions Restaurants</Label>
                                    <p className="text-xs font-bold text-slate-500">Bloque temporairement les nouvelles signatures sur la landing page SaaS.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-indigo-600" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 mt-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-orange-50/50 border-b border-orange-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase text-orange-950">
                                <Bell className="h-5 w-5 text-orange-600" /> Préférences d'Envoi
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">Contrôlez le volume d'emails que l'interface administrateur vous envoie.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Lock className="h-3 w-3" /> Modération & Sécurité</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-black uppercase tracking-tight text-slate-900">Alerte Signalements Urgents</Label>
                                            <p className="text-[10px] font-bold text-slate-500">Email envoyé immédiatement lorsqu'une boutique ou un profil est signalé(e).</p>
                                        </div>
                                        <Switch defaultChecked className="data-[state=checked]:bg-orange-600" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-black uppercase tracking-tight text-slate-900">Connexions depuis une nouvelle IP</Label>
                                            <p className="text-[10px] font-bold text-slate-500">Sécurité de votre propre compte {admin.email}.</p>
                                        </div>
                                        <Switch defaultChecked className="data-[state=checked]:bg-orange-600" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-6 mt-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 text-white">
                            <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase text-white">
                                <Webhook className="h-5 w-5 text-emerald-400" /> Passerelles & Automatisation
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-400">Gérez les connexions critiques vers l'extérieur (Make, OpenAI, Paiements).</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-slate-700 text-sm uppercase tracking-tight">Make.com Webhook URL (Lead Magnet)</Label>
                                <SecretInput 
                                    defaultValue={process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || "https://hook.eu2.make.com/..."} 
                                    placeholder="URL Make.com" 
                                />

                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connecté au formulaire public de contact/adhésion.</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <Label className="font-bold text-slate-700 text-sm uppercase tracking-tight">GeniusPay / Lygos - Clé API Secrète</Label>
                                <SecretInput 
                                    defaultValue="lyg_live_sk_89f9e..." 
                                    placeholder="Clé Secrète" 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="securite" className="space-y-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Account Details / Stats */}
                    <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Votre Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Connecté en tant que</p>
                                    <div className="font-black text-white italic text-xl truncate">{admin.email}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {admin.is_super_admin ? (
                                        <Badge className="bg-orange-500 hover:bg-orange-600 font-black uppercase tracking-widest text-[10px] px-3 py-1.5 shadow-lg shadow-orange-500/20 text-white border-none">Super-Admin</Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-white/20 text-slate-300 font-black uppercase tracking-widest text-[10px] px-3 py-1.5">Administrateur</Badge>
                                    )}
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black tracking-widest text-[10px] px-3 py-1.5">SÉCURISÉ</Badge>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-11 border border-white/10">
                                        Changer mon mot de passe
                                    </Button>
                                    <Button variant="ghost" className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px] h-11">
                                        Se déconnecter de tous les appareils
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-slate-200 bg-white rounded-3xl overflow-hidden flex flex-col justify-center">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-indigo-100 relative z-10">
                                    <Smartphone className="h-10 w-10 text-indigo-600" />
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full animate-ping" />
                            </div>
                            <h4 className="font-black text-slate-900 text-xl uppercase italic tracking-tighter">Authentification 2FA</h4>
                            <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">Renforcez la sécurité de votre compte administrateur en associant Google Authenticator.</p>
                            <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 w-full font-black uppercase tracking-widest h-12 rounded-xl shadow-xl shadow-indigo-600/20 text-white gap-2">
                                <Key className="h-4 w-4" /> Configurer 2FA
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

