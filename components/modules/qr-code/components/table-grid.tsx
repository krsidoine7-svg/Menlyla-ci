'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Printer, MoreVertical, QrCode } from 'lucide-react'
import { deleteTables } from '../actions'
import { TableQrSection } from './table-qr-section'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteTable } from '../actions'

export function TableGrid({ tables, restaurant }: { tables: any[], restaurant: any }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleSelect = (id: string) => {
        setSelectedIds(current =>
            current.includes(id)
                ? current.filter(i => i !== id)
                : [...current, id]
        )
    }

    const toggleAll = () => {
        setSelectedIds(current =>
            current.length === tables.length ? [] : tables.map(t => t.id)
        )
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Supprimer ${selectedIds.length} tables ?`)) return

        toast.promise(deleteTables(selectedIds), {
            loading: 'Suppression...',
            success: () => {
                setSelectedIds([])
                return 'Tables supprimées'
            },
            error: 'Erreur lors de la suppression'
        })
    }

    const handleBulkPrint = () => {
        // Simple strategy: we can trigger print on the elements or redirect to a print page.
        // For now, let's just toast that it's coming or try to trigger individual ones (not great).
        // Best: toast instruction.
        toast.info("L'impression groupée sera disponible bientôt. Imprimez chaque QR individuellement pour le moment.")
    }

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-bold text-orange-700">
                        {selectedIds.length} table(s) sélectionnée(s)
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleBulkPrint} className="bg-white">
                            <Printer className="mr-2 h-4 w-4" /> Imprimer tout
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 mb-2">
                <Checkbox
                    id="select-all"
                    checked={selectedIds.length === tables.length && tables.length > 0}
                    onCheckedChange={toggleAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Tout sélectionner
                </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((table) => {
                    const qrCode = table.qr_codes?.[0]
                    const isSelected = selectedIds.includes(table.id)

                    return (
                        <Card key={table.id} className={`overflow-hidden transition-all border-2 ${isSelected ? 'border-orange-500 shadow-md scale-[1.02]' : 'hover:shadow-lg'}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSelect(table.id)}
                                    />
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <div className="bg-orange-100 p-1.5 rounded-full">
                                            <QrCode className="h-4 w-4 text-orange-600" />
                                        </div>
                                        Table {table.name}
                                    </CardTitle>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50">
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                            onClick={() => {
                                                if (confirm('Supprimer cette table ?')) deleteTable(table.id)
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>

                            <CardContent className="pt-6 flex flex-col items-center">
                                <TableQrSection
                                    tableId={table.id}
                                    tableName={table.name}
                                    qrCode={qrCode}
                                    restaurantName={restaurant.name}
                                    restaurantLogo={restaurant.logo_url}
                                />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
