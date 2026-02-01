'use client'

import { useState } from 'react'
import { createTable } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TablePrintCard } from './table-print-card'
import { DownloadQrButton } from './download-qr-button'

type Props = {
    restaurantName: string
    restaurantLogo?: string | null
}

export function AddTableDialog({ restaurantName, restaurantLogo }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [createdData, setCreatedData] = useState<{ table: any, qrCode: any } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        const result = await createTable(null, formData)
        setLoading(false)

        if (result?.success && result.data) {
            toast.success(result.message)
            setCreatedData(result.data)
        } else {
            toast.error(result?.message || "Erreur")
        }
    }

    const resetAndClose = () => {
        setOpen(false)
        setCreatedData(null)
    }

    // Calcul de l'URL du QR Code (force l'origine actuelle si localhost est détecté dans le .env)
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const officialUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const finalBaseUrl = (officialUrl && !officialUrl.includes('localhost')) ? officialUrl : currentOrigin;
    const qrUrl = createdData ? `${finalBaseUrl}/qr/${createdData.qrCode.id}` : '';

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v)
            if (!v) setCreatedData(null)
        }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une Table
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-orange-600">
                        {createdData ? "Format Prêt !" : "Ajouter une Table"}
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        {createdData
                            ? "Votre QR Code premium a été généré avec succès."
                            : "Créez une nouvelle table pour générer son QR Code."}
                    </DialogDescription>
                </DialogHeader>

                {createdData ? (
                    <div className="flex flex-col items-center py-4 space-y-6">
                        <TablePrintCard
                            qrId={`qr-new-${createdData.table.id}`}
                            tableName={createdData.table.name}
                            qrUrl={qrUrl}
                            restaurantName={restaurantName}
                            restaurantLogo={restaurantLogo}
                        />
                        <div className="w-full space-y-2">
                            <DownloadQrButton
                                elementId={`qr-new-${createdData.table.id}`}
                                fileName={`Menlyla-Table-${createdData.table.name}`}
                            />
                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                                onClick={resetAndClose}
                            >
                                Terminer & Voir sur mon Dashboard
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form action={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nom
                            </Label>
                            <Input id="name" name="name" placeholder="Ex: 5 ou Terrasse 2" className="col-span-3" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Création...' : 'Créer et Générer Format'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
