'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, ShieldCheck, Zap, MessageSquare, CheckCircle2, Power } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    settings: any
    setSettings: (settings: any) => void
}

export function PaymentGateways({ settings, setSettings }: Props) {
    const paymentConfig = settings.payment_config || {
        enabled: false,
        active_gateway: 'manual',
        gateways: {
            geniuspay: { enabled: false, api_key: '' },
            lygos: { enabled: false, public_key: '', private_key: '' },
            paystack: { enabled: false, public_key: '', secret_key: '' },
            manual: { enabled: true }
        }
    }

    const isGlobalEnabled = paymentConfig.enabled ?? false

    const toggleGlobalPayments = (val: boolean) => {
        setSettings({
            ...settings,
            payment_config: { ...paymentConfig, enabled: val }
        })
    }

    const updateGateway = (id: string, updates: any) => {
        const next = {
            ...paymentConfig,
            gateways: {
                ...paymentConfig.gateways,
                [id]: { ...paymentConfig.gateways[id], ...updates }
            }
        }
        setSettings({ ...settings, payment_config: next })
    }

    const setActiveGateway = (id: string) => {
        setSettings({ 
            ...settings, 
            payment_config: { ...paymentConfig, active_gateway: id } 
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Global Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        Paiements
                        {isGlobalEnabled ? (
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                    </h2>
                    <p className="text-slate-500 font-medium">Activez et configurez les encaissements pour vos commandes.</p>
                </div>

                <div className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 border-2",
                    isGlobalEnabled 
                        ? "bg-green-50 border-green-200 text-green-700 shadow-lg shadow-green-500/10" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status</span>
                        <span className="text-xs font-bold">{isGlobalEnabled ? 'Activé' : 'Désactivé'}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => toggleGlobalPayments(!isGlobalEnabled)}
                        className={cn(
                            "relative h-8 w-14 rounded-full transition-all duration-500 shadow-inner",
                            isGlobalEnabled ? "bg-green-600" : "bg-slate-300"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-500 flex items-center justify-center",
                            isGlobalEnabled ? "translate-x-6" : "translate-x-0"
                        )}>
                            <Power className={cn("h-3 w-3", isGlobalEnabled ? "text-green-600" : "text-slate-400")} />
                        </div>
                    </button>
                </div>
            </div>

            {/* List of Gateways (Grayed out if Global is Disabled) */}
            <div className={cn(
                "grid gap-6 transition-all duration-500 origin-top",
                !isGlobalEnabled && "opacity-60 scale-[0.98] pointer-events-none grayscale"
            )}>
                <div className="px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Passerelles Disponibles</h3>
                </div>

                {/* GeniusPay - Local Hero */}
                <GatewayCard 
                    id="geniuspay"
                    title="GeniusPay Africa"
                    description="Paiements Mobiles (Orange, MTN, Wave) & Cartes en Afrique de l'Ouest."
                    icon={<Zap className="h-5 w-5 text-orange-600" />}
                    enabled={paymentConfig.gateways.geniuspay.enabled}
                    active={paymentConfig.active_gateway === 'geniuspay'}
                    onToggle={(enabled) => updateGateway('geniuspay', { enabled })}
                    onSelect={() => setActiveGateway('geniuspay')}
                >
                    <div className="space-y-2 pt-4 border-t border-slate-50 mt-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clé API (Live)</Label>
                        <Input 
                            type="password" 
                            placeholder="sk_live_..." 
                            value={paymentConfig.gateways.geniuspay.api_key}
                            onChange={(e) => updateGateway('geniuspay', { api_key: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-xs"
                        />
                    </div>
                </GatewayCard>
 
                {/* LYGOS - Local Powerhouse */}
                <GatewayCard 
                    id="lygos"
                    title="LYGOS"
                    description="Solution de paiement sécurisée pour l'Afrique. Supporte OM, Moov, MTN et Wave."
                    icon={<ShieldCheck className="h-5 w-5 text-purple-600" />}
                    enabled={paymentConfig.gateways.lygos?.enabled}
                    active={paymentConfig.active_gateway === 'lygos'}
                    onToggle={(enabled) => updateGateway('lygos', { enabled })}
                    onSelect={() => setActiveGateway('lygos')}
                >
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 mt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Key (Clef Publique)</Label>
                            <Input 
                                placeholder="lygos_pub_..." 
                                value={paymentConfig.gateways.lygos?.public_key || ''}
                                onChange={(e) => updateGateway('lygos', { public_key: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Private Key (Clef Privée)</Label>
                            <Input 
                                type="password" 
                                placeholder="lygos_priv_..." 
                                value={paymentConfig.gateways.lygos?.private_key || ''}
                                onChange={(e) => updateGateway('lygos', { private_key: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-xs"
                            />
                        </div>
                    </div>
                </GatewayCard>

                {/* Paystack - Nigeria / Ghana / CI focus */}
                <GatewayCard 
                    id="paystack"
                    title="Paystack"
                    description="Une solution robuste pour l'Afrique, supportant les cartes et le Mobile Money."
                    icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
                    enabled={paymentConfig.gateways.paystack.enabled}
                    active={paymentConfig.active_gateway === 'paystack'}
                    onToggle={(enabled) => updateGateway('paystack', { enabled })}
                    onSelect={() => setActiveGateway('paystack')}
                >
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 mt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Key</Label>
                            <Input 
                                placeholder="pk_live_..." 
                                value={paymentConfig.gateways.paystack.public_key}
                                onChange={(e) => updateGateway('paystack', { public_key: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secret Key</Label>
                            <Input 
                                type="password" 
                                placeholder="sk_live_..." 
                                value={paymentConfig.gateways.paystack.secret_key}
                                onChange={(e) => updateGateway('paystack', { secret_key: e.target.value })}
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all text-xs"
                            />
                        </div>
                    </div>
                </GatewayCard>

                {/* Manual / Cash / Delivery */}
                <GatewayCard 
                    id="manual"
                    title="Paiement Manuel & Livraison"
                    description="Le client commande en ligne et règle directement sur place ou à la livraison."
                    icon={<MessageSquare className="h-5 w-5 text-slate-600" />}
                    enabled={paymentConfig.gateways.manual.enabled}
                    active={paymentConfig.active_gateway === 'manual'}
                    onToggle={(enabled) => updateGateway('manual', { enabled })}
                    onSelect={() => setActiveGateway('manual')}
                    hideFields
                />
            </div>

            {/* Note Section (Grayed out if disabled) */}
            <div className={cn(
                "p-8 rounded-[2.5rem] bg-orange-50 border border-orange-100 space-y-4 transition-all duration-500 shadow-sm",
                !isGlobalEnabled && "opacity-50 grayscale pointer-events-none"
            )}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-orange-950">Comment ça marche ?</h3>
                </div>
                <p className="text-sm text-orange-900/70 leading-relaxed font-medium">
                    Une fois une passerelle activée et sélectionnée comme <strong>principale</strong>, le bouton de paiement s'affichera automatiquement dans le panier de vos clients. Les fonds seront versés directement sur votre compte marchand chez le prestataire choisi.
                </p>
                {!isGlobalEnabled && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 rounded-xl text-orange-700 text-[10px] font-black uppercase tracking-widest mt-2">
                        <Power className="h-3 w-3" /> Activez le module pour voir les détails
                    </div>
                )}
            </div>
        </div>
    )
}

function GatewayCard({ 
    id, title, description, icon, enabled, active, onToggle, onSelect, children, hideFields 
}: { 
    id: string, title: string, description: string, icon: React.ReactNode, enabled: boolean, active: boolean, onToggle: (val: boolean) => void, onSelect: () => void, children?: React.ReactNode, hideFields?: boolean 
}) {
    return (
        <Card className={cn(
            "rounded-[2.5rem] border-none shadow-sm transition-all duration-500 overflow-hidden",
            active ? "ring-2 ring-orange-500 shadow-xl bg-white" : "bg-white/50 border-slate-100"
        )}>
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-all duration-500",
                enabled ? "bg-green-500" : "bg-slate-200"
            )} />
            
            <CardHeader className="pb-4 relative pl-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "h-14 w-14 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500",
                            enabled ? "bg-slate-50 scale-110 shadow-lg" : "bg-slate-100 scale-100"
                        )}>
                            {icon}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-black text-slate-900">{title}</CardTitle>
                                {enabled && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Actif
                                    </div>
                                )}
                            </div>
                            <CardDescription className="text-slate-500 font-medium line-clamp-1">{description}</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1.5 mr-2">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.15em] transition-colors",
                                enabled ? "text-green-600" : "text-slate-400"
                            )}>
                                {enabled ? 'Activé' : 'Désactivé'}
                            </span>
                            <button
                                type="button"
                                onClick={() => onToggle(!enabled)}
                                className={cn(
                                    "relative h-7 w-12 rounded-full transition-all duration-500",
                                    enabled ? "bg-green-500 shadow-lg shadow-green-500/20" : "bg-slate-200"
                                )}
                            >
                                <span className={cn(
                                    "block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-500 mt-0.5", 
                                    enabled ? "translate-x-6 mr-1" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-8">
                {enabled && !hideFields && children}
                {enabled && (
                    <div className={cn(
                        "mt-6 pt-6 border-t flex items-center justify-between transition-all duration-300",
                        active ? "border-orange-100" : "border-slate-50"
                    )}>
                        <p className="text-[11px] font-medium text-slate-500 italic flex items-center gap-2">
                            {active 
                                ? <><CheckCircle2 className="h-3.5 w-3.5 text-orange-500" /> Méthode principale actuelle</>
                                : "Définir comme passerelle principale ?"}
                        </p>
                        <button
                            type="button"
                            disabled={active}
                            onClick={onSelect}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                                active 
                                    ? "bg-orange-100 text-orange-700 border border-orange-200 cursor-default"
                                    : "bg-slate-900 text-white hover:bg-black hover:shadow-lg active:scale-95"
                            )}
                        >
                            {active ? "Principale" : "Choisir"}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
