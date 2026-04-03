'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { updateSystemSettings } from '@/app/(super-admin)/admin/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/** 
 * Note: Lucid icons in write_to_file can be finicky. 
 * Re-importing correctly for TSX.
 */
import { 
    Zap as ZapIcon, 
    Smartphone as SmartphoneIcon, 
    Settings as SettingsIcon, 
    CreditCard as CreditCardIcon, 
    Receipt as ReceiptIcon 
} from 'lucide-react'

export function PaymentControls({ 
    initialSettings 
}: { 
    initialSettings: any 
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [settings, setSettings] = useState(initialSettings)

    const handleToggle = async (key: string, value: boolean) => {
        setIsLoading(true)
        const result = await updateSystemSettings({ [key]: value })
        
        if (result.success) {
            setSettings({ ...settings, [key]: value })
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Une erreur est survenue.')
        }
        setIsLoading(false)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-1000">
            {/* SaaS Toggle */}
            <Card className="bg-red-600 border-none rounded-[2.5rem] text-white p-8 overflow-hidden relative group">
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <ZapIcon className="h-6 w-6 text-white" />
                        </div>
                        <Switch 
                            disabled={isLoading}
                            checked={settings.is_saas_payments_enabled} 
                            onCheckedChange={(val) => handleToggle('is_saas_payments_enabled', val)}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-black/20" 
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold italic tracking-tight">Passerelle SaaS</h3>
                        <p className="text-[10px] font-medium text-white/70 leading-relaxed uppercase tracking-wider">Abonnements Marchands</p>
                    </div>
                </div>
                <CreditCardIcon className="absolute -bottom-10 -right-10 h-48 w-48 text-black opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </Card>

            {/* Order Toggle */}
            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] text-white p-8 overflow-hidden relative group">
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/20">
                            <SmartphoneIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <Switch 
                            disabled={isLoading}
                            checked={settings.is_order_payments_enabled} 
                            onCheckedChange={(val) => handleToggle('is_order_payments_enabled', val)}
                            className="data-[state=checked]:bg-red-600" 
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold italic tracking-tight">Paiements QR Code</h3>
                        <p className="text-[10px] font-medium text-white/30 leading-relaxed uppercase tracking-wider">Commandes Restaurants</p>
                    </div>
                </div>
                <ReceiptIcon className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-[0.02] group-hover:scale-110 transition-transform duration-700" />
            </Card>

            {/* Pricing Info */}
            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] text-white p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold italic text-white/40 uppercase tracking-widest">Tarification SaaS</h3>
                    <SettingsIcon className="h-4 w-4 text-white/20" />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/40">Commission</span>
                        <span className="text-sm font-bold text-white italic">{settings.platform_commission_percent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/40">Abonnement PRO</span>
                        <span className="text-sm font-bold text-red-600 italic">{(settings.monthly_pro_price_xof || 25000).toLocaleString('fr-FR')} XOF/mois</span>
                    </div>
                </div>
                <Link href="/admin/settings?tab=plateforme">
                    <Button variant="link" className="text-[10px] text-white/20 p-0 h-auto mt-4 hover:text-white transition-colors">Modifier les tarifs →</Button>
                </Link>
            </Card>
        </div>
    )
}
