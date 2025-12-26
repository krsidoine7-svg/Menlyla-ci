import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteTable, regenerateQrCode } from '@/components/modules/qr-code/actions'
import { Trash2, MoreVertical, RefreshCw, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { TableQrSection } from '@/components/modules/qr-code/components/table-qr-section'
import { AddTableDialog } from '@/components/modules/qr-code/components/add-table-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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

    if (!restaurant) return <div>Configurez d'abord votre restaurant</div>

    // Fetch Tables with QR Codes
    const { data: tables } = await supabase
        .from('tables')
        .select('*, qr_codes(*)')
        .eq('restaurant_id', restaurant.id)
        .order('name', { ascending: true }) // Can be tricky with strings "1", "10", "2", usually needs natural sort or int casting.
    // For MVP, standard string sort is fine or we accept 1, 10, 2.

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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tables.map((table: any) => {
                        const qrCode = table.qr_codes?.[0]
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                        const qrUrl = qrCode ? `${baseUrl}/qr/${qrCode.id}` : '#'

                        return (
                            <Card key={table.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <div className="bg-orange-100 p-1.5 rounded-full">
                                            <QrCode className="h-4 w-4 text-orange-600" />
                                        </div>
                                        Table {table.name}
                                    </CardTitle>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50">
                                                <MoreVertical className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <form action={deleteTable.bind(null, table.id)}>
                                                <button type="submit" className="w-full text-left">
                                                    <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </button>
                                            </form>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>

                                <CardContent className="pt-6 flex flex-col items-center">
                                    <TableQrSection
                                        tableId={table.id}
                                        tableName={table.name}
                                        qrCode={qrCode}
                                        restaurantName={restaurant.name}
                                        restaurantLogo={(restaurant.restaurant_settings as any)?.logo_url || (restaurant.restaurant_settings as any)?.[0]?.logo_url}
                                    />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

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
