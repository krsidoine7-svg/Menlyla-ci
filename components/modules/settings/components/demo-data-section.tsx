'use client'

import { useState } from 'react'
import { seedMockData } from '@/components/modules/admin/mock-data-action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Beaker } from 'lucide-react'
import { toast } from 'sonner'

export function DemoDataSection() {
    const [loading, setLoading] = useState(false)

    const handleSeed = async () => {
        if (!confirm("Attention: Cela va ajouter des données fictives (commandes, plats). Continuer ?")) return

        setLoading(true)
        const result = await seedMockData()
        setLoading(false)

        if (result?.message) {
            toast.success(result.message)
        }
    }

    return (
        <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Beaker className="h-5 w-5" /> Mode Démo
                </CardTitle>
                <CardDescription className="text-orange-600/80">
                    Générez des données de test pour voir à quoi ressemble le dashboard rempli.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleSeed} disabled={loading} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800">
                    {loading ? 'Génération...' : 'Générer Données de Test'}
                </Button>
            </CardContent>
        </Card>
    )
}
