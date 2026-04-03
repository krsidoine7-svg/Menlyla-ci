'use client'

import { useState, useEffect } from 'react'
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
    Smartphone,
    CreditCard,
    Zap,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecretInput } from '@/components/modules/super-admin/secret-input'
import { getSystemSettings, updateSystemSettings } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const data = await getSystemSettings()
            setSettings(data)
            setIsLoading(false)
        }
        load()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateSystemSettings({
            platform_commission_percent: parseFloat(settings.platform_commission_percent),
            monthly_pro_price_xof: parseInt(settings.monthly_pro_price_xof),
            is_maintenance_mode: !!settings.is_maintenance_mode
        })

        if (result.success) {
            toast.success("Réglages enregistrés avec succès")
        } else {
            toast.error(result.error || "Une erreur est survenue")
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                <p className="text-white/20 font-bold text-xs uppercase tracking-widest">Chargement de la configuration...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight text-white italic flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Settings className="h-6 w-6 text-red-600" />
                        </div>
                        Configuration <span className="text-red-500">Système</span>
                    </h1>
                    <p className="text-white/40 font-medium text-sm max-w-2xl">Paramètres critiques de la plateforme et des flux financiers.</p>
                </div>
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest px-10 h-14 rounded-2xl shadow-2xl shadow-red-600/30 gap-3 transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                </Button>
            </div>

            <Tabs defaultValue="plateforme" className="w-full space-y-8">
                <TabsList className="bg-white/5 p-1.5 h-14 rounded-2xl border border-white/10 gap-2 flex overflow-x-auto scrollbar-none">
                    <TabsTrigger value="plateforme" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:text-black h-full transition-all">
                        <Globe className="h-4 w-4 mr-2" /> Plateforme
                    </TabsTrigger>
                    <TabsTrigger value="api" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:text-black h-full transition-all">
                        <Webhook className="h-4 w-4 mr-2" /> API & Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="securite" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:text-black h-full transition-all">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Sécurité
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="plateforme" className="space-y-6 mt-6">
                    <Card className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 px-10 py-8">
                            <CardTitle className="text-2xl font-bold italic text-white tracking-tight flex items-center gap-3">
                                <Percent className="h-5 w-5 text-red-600" /> Tarification
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-white/20 uppercase tracking-widest leading-relaxed">Frais de plateforme et abonnements.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <Label className="font-bold text-white/40 text-[10px] uppercase tracking-widest ml-1">Commission de service</Label>
                                <div className="relative">
                                    <Input 
                                        value={settings.platform_commission_percent} 
                                        onChange={(e) => setSettings({ ...settings, platform_commission_percent: e.target.value })}
                                        type="number" 
                                        step="0.1" 
                                        className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-2xl text-white pl-8 pr-14 focus:border-red-600 transition-all shadow-inner" 
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 font-bold text-xl">%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="font-bold text-white/40 text-[10px] uppercase tracking-widest ml-1">Forfait PRO mensuel</Label>
                                <div className="relative">
                                    <Input 
                                        value={settings.monthly_pro_price_xof} 
                                        onChange={(e) => setSettings({ ...settings, monthly_pro_price_xof: e.target.value })}
                                        type="number" 
                                        className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-2xl text-white pl-8 pr-20 focus:border-red-600 transition-all shadow-inner" 
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 font-bold text-sm uppercase tracking-widest">XOF</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-600/5 border-red-600/10 rounded-[3rem] shadow-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="border-b border-red-600/10 px-10 py-8 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold italic text-white tracking-tight flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" /> Mode Urgence
                                </CardTitle>
                                <CardDescription className="text-[10px] font-medium text-red-600/40 uppercase tracking-widest">Contrôle de l'accès public</CardDescription>
                            </div>
                            <Switch 
                                checked={settings.is_maintenance_mode}
                                onCheckedChange={(val) => setSettings({ ...settings, is_maintenance_mode: val })}
                                className="data-[state=checked]:bg-red-600" 
                            />
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 space-y-2">
                                <p className="text-sm font-bold text-white italic tracking-tight italic">Attention !</p>
                                <p className="text-[10px] font-medium text-white/20 leading-relaxed uppercase tracking-widest">
                                    L'activation du mode maintenance rendra tous les menus et boutiques inaccessibles pour les clients. 
                                    Seul le dashboard admin restera opérationnel.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-6 mt-6">
                    <Card className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden">
                        <CardHeader className="bg-black/40 border-b border-white/5 px-10 py-8">
                            <CardTitle className="text-2xl font-bold italic text-white tracking-tight flex items-center gap-3">
                                <Webhook className="h-5 w-5 text-red-600" /> Connexions Externes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="space-y-4">
                                <Label className="font-bold text-white/40 text-[10px] uppercase tracking-widest ml-1">Webhook Lead Magnet (Make.com)</Label>
                                <SecretInput 
                                    defaultValue={process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || ""} 
                                    placeholder="https://hook.make.com/..." 
                                />
                            </div>

                            <div className="space-y-4 pt-10 border-t border-white/5">
                                <Label className="font-bold text-white/40 text-[10px] uppercase tracking-widest ml-1">GeniusPay / Lygos - Clé API Secrète (Live)</Label>
                                <SecretInput 
                                    defaultValue="lyg_live_sk_..." 
                                    placeholder="Clé Secrète" 
                                />
                                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10 w-fit">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Utilisé pour le checkout global Menlyla</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="securite" className="space-y-6 mt-6">
                    <Card className="bg-white/5 border-white/10 rounded-[3rem] shadow-3xl overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 px-10 py-8 text-center sm:text-left">
                            <CardTitle className="text-2xl font-bold italic text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-red-600" /> Session Administrateur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 flex flex-col items-center sm:items-start gap-10">
                            <div className="space-y-4">
                                <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Compte Actif</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 font-bold text-2xl">
                                        SA
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-white italic tracking-tighter">Super Admin</div>
                                        <div className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Contrôle total activé</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5 w-full">
                                <Button variant="outline" className="flex-1 min-w-[200px] h-14 border-white/10 bg-white/5 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 text-white">Sécurité du compte</Button>
                                <Button variant="ghost" className="flex-1 min-w-[200px] h-14 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-600/10 rounded-2xl">Se déconnecter</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

