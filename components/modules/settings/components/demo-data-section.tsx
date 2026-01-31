'use client'

import { useState } from 'react'
import { seedMockData } from '@/components/modules/admin/mock-data-action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Beaker, Database, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DemoDataSection() {
    const [loading, setLoading] = useState(false)

    const handleSeed = async () => {
        if (!confirm("Attention: Cela va ajouter des données fictives (commandes, plats). Continuer ?")) return

        setLoading(true)
        try {
            const result = await seedMockData()
            if (result?.message) {
                toast.success(result.message)
            }
        } catch (e) {
            toast.error("Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader className="pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                            <Beaker className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-indigo-950">Mode Démonstration</CardTitle>
                            <CardDescription className="text-indigo-600/80 font-medium">Basculez votre dashboard en mode test.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-3xl border border-indigo-100 bg-white/60 p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <Database className="h-5 w-5 text-indigo-400 mt-1" />
                            <div>
                                <h4 className="font-bold text-indigo-900">Données Fictives</h4>
                                <p className="text-sm text-muted-foreground mt-1">Générez automatiquement des commandes, des clients et des produits pour tester l'interface. Idéal pour voir le rendu final.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={handleSeed}
                            disabled={loading}
                            className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                            {loading ? 'Génération en cours...' : 'Générer des données'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
