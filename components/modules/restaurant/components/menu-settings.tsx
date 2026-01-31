'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Plus, ChefHat, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
    restaurant: any
}

export function MenuSettings({ restaurant }: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-gradient-to-br from-orange-50/50 to-white">
                <CardHeader className="pb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                            <UtensilsCrossed className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-orange-950">Menu & Produits</CardTitle>
                            <CardDescription className="text-orange-900/60 font-medium">Gérez votre carte, vos catégories et vos plats.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-6 rounded-3xl bg-white border border-orange-100 shadow-sm space-y-4 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600">
                                <ChefHat className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Éditeur de Menu</h3>
                                <p className="text-sm text-muted-foreground mt-1">Modifiez vos plats, prix et descriptions en temps réel.</p>
                            </div>
                            <div className="pt-2">
                                <Link href="/dashboard/menu">
                                    <Button variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 w-full justify-between">
                                        Accéder au Menu <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-500">Formules & Options</h3>
                                <p className="text-sm text-gray-400 mt-1">Bientôt disponible : Gestion des menus midi et toppings.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
