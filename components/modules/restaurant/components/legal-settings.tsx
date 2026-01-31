'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale, FileText, Globe, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    restaurant: any
}

export function LegalSettings({ restaurant }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Juridique & Conformité</CardTitle>
                            <CardDescription>Gérez les mentions légales et conditions de votre établissement.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="rounded-3xl border border-slate-100 p-6 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-slate-500" />
                                    Pages Légales Publiques
                                </h4>
                                <p className="text-sm text-muted-foreground">Liens générés automatiquement pour votre site.</p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-emerald-500/20" />
                        </div>

                        <div className="grid gap-3">
                            {['Mentions Légales', 'Conditions Générales de Vente (CGV)', 'Politique de Confidentialité'].map((doc) => (
                                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        {doc}
                                    </div>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-slate-500 hover:text-orange-600">
                                        Configurer
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
