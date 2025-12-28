import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteTable, regenerateQrCode } from '@/components/modules/qr-code/actions'
import { Trash2, MoreVertical, RefreshCw, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { TableQrSection } from '@/components/modules/qr-code/components/table-qr-section'
import { AddTableDialog } from '@/components/modules/qr-code/components/add-table-dialog'
import { NoRestaurantState } from '@/components/modules/admin/no-restaurant'
import { TableGrid } from '@/components/modules/qr-code/components/table-grid'


export default async function TablesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select(`
            id, 
            slug, 
            name, 
            restaurant_settings(logo_url)
        `)
        .eq('owner_id', user?.id)
        .single()

    if (!restaurant) return <NoRestaurantState />

    // Fetch Tables with QR Codes
    const { data: tables } = await supabase
        .from('tables')
        .select('*, qr_codes(*)')
        .eq('restaurant_id', restaurant.id)
        .order('name', { ascending: true })

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
                    <p className="text-muted-foreground">Gérez vos tables et imprimez vos QR Codes.</p>
                </div>
                <AddTableDialog
                    restaurantName={restaurant.name}
                    restaurantLogo={(restaurant.restaurant_settings as any)?.logo_url || (restaurant.restaurant_settings as any)?.[0]?.logo_url}
                />
            </div>

            {tables && tables.length > 0 ? (
                <TableGrid tables={tables} restaurant={restaurant} />
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="p-4 bg-orange-100 rounded-full mb-4">
                        <QrCode className="h-8 w-8 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold">Aucune table pour le moment</h2>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-sm text-center">
                        Commencez par ajouter vos tables pour générer les QR Codes que vos clients scanneront.
                    </p>
                    <AddTableDialog
                        restaurantName={restaurant.name}
                        restaurantLogo={(restaurant.restaurant_settings as any)?.logo_url || (restaurant.restaurant_settings as any)?.[0]?.logo_url}
                    />
                </div>
            )}
        </div>
    )
}
