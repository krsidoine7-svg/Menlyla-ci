'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Save, CreditCard, Loader2, ArrowRight } from 'lucide-react'

export interface SaasPricingConfigProps {
    settings: any
    setSettings: (settings: any) => void
    onSave: () => Promise<void>
    isSaving: boolean
}

export function SaasPricingConfig({ settings, setSettings, onSave, isSaving }: SaasPricingConfigProps) {
    if (!settings) return null

    return (
        <Card className="bg-[#0A0A0A] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            <CardHeader className="p-10 border-b border-white/5 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black italic text-white tracking-tight flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-red-600" /> 
                            Configuration des Tarifs SaaS
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-white/40 uppercase tracking-widest">
                            Gérez les prix, commissions et abonnements de la plateforme Menlyla.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
                        <Switch 
                            checked={settings.is_saas_payments_enabled}
                            onCheckedChange={(val) => setSettings({ ...settings, is_saas_payments_enabled: val })}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                            {settings.is_saas_payments_enabled ? 'Paiements Activés' : 'Paiements Suspendus'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                
                {/* FORFAIT PRO */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-red-600 hover:bg-red-600 text-white font-black px-4 py-1.5 uppercase tracking-widest rounded-full text-[10px]">
                            FORFAIT PRO
                        </Badge>
                    </div>
                    
                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group hover:border-red-600/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 className="h-24 w-24 text-red-600" />
                        </div>
                        
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Tarif Mensuel</Label>
                            <div className="relative group/input">
                                <Input 
                                    type="number"
                                    value={settings.monthly_pro_price_xof || ''}
                                    onChange={(e) => setSettings({ ...settings, monthly_pro_price_xof: e.target.value })}
                                    className="h-20 bg-black/50 border-white/10 rounded-2xl text-4xl font-black italic text-white pl-8 pr-24 focus:border-red-600 transition-all"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-black text-sm uppercase tracking-widest group-focus-within/input:text-red-500 transition-colors">
                                    FCFA
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Inclus dans plan PRO</Label>
                            <ul className="space-y-2 text-xs font-semibold text-white/60">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Menus Digitaux & QR Codes</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dashboard Analytics Complet</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Outils Marketing & Avis</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Support Premium</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* STARTUP / COMMISSION */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-white/60 border-white/20 font-black px-4 py-1.5 uppercase tracking-widest rounded-full text-[10px]">
                            SETTINGS GLOBAUX
                        </Badge>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-8 flex flex-col justify-between h-full hover:border-white/10 transition-colors">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Frais de Plateforme (Commission %)</Label>
                            <div className="relative group/input">
                                <Input 
                                    type="number"
                                    step="0.1"
                                    value={settings.platform_commission_percent || ''}
                                    onChange={(e) => setSettings({ ...settings, platform_commission_percent: e.target.value })}
                                    className="h-20 bg-black/50 border-white/10 rounded-2xl text-4xl font-black italic text-white pl-8 pr-20 focus:border-white/30 transition-all"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl group-focus-within/input:text-white transition-colors">
                                    %
                                </span>
                            </div>
                            <p className="text-xs text-white/30 font-medium">
                                Pourcentage prélevé sur chaque transaction traitée via Menlyla Pay pour le compte des restaurants tiers.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-orange-500/5 text-orange-400 border border-orange-500/10 flex gap-4">
                            <div className="shrink-0 pt-1">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-medium space-y-2 leading-relaxed">
                                <strong className="block font-black uppercase tracking-widest mb-1 text-[10px]">Info Importante</strong>
                                Les modifications de prix affecteront uniquement les nouveaux souscripteurs et les renouvellements à venir. Les transactions déjà générées ne sont pas rétroactives.
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>

            <CardFooter className="p-10 pt-0 flex justify-end">
                <Button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] transition-all active:scale-[0.98]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...
                        </>
                    ) : (
                        <>
                            Sauvegarder les Tarifs <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
