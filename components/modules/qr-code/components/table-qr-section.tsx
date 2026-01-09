'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { regenerateQrCode } from '../actions'
import { DownloadQrButton } from './download-qr-button'
import { TablePrintCard } from './table-print-card'

type Props = {
    tableId: string
    tableName: string
    qrCode: any | null
    restaurantName?: string
    restaurantLogo?: string | null
}

export function TableQrSection({
    tableId,
    tableName,
    qrCode: initialQrCode,
    restaurantName,
    restaurantLogo
}: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [qrCode, setQrCode] = useState(initialQrCode)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setQrCode(initialQrCode)
        setIsGenerating(false)
        if (initialQrCode) {
            setError(null)
        }
    }, [initialQrCode])

    useEffect(() => {
        if (!qrCode && !isGenerating && !isPending && !initialQrCode && !error) {
            handleAutoGenerate()
        }
    }, [qrCode, isGenerating, isPending, initialQrCode, error])

    const handleAutoGenerate = async () => {
        if (isGenerating || isPending) return

        setIsGenerating(true)
        setError(null)
        try {
            const result = await regenerateQrCode(tableId)

            if (result?.success && result.data) {
                setQrCode(result.data)
                startTransition(() => {
                    router.refresh()
                })
            } else if (result?.message && !result.message.includes('généré')) {
                setError(result.message)
            }
        } catch (err: any) {
            console.error("Auto-generation failed", err)
            setError(err.message || "Erreur de génération")
        } finally {
            setIsGenerating(false)
        }
    }


    // Correction de l'URL pour éviter les fuites de localhost
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const officialUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const finalBaseUrl = (officialUrl && !officialUrl.includes('localhost')) ? officialUrl : currentOrigin;
    const qrUrl = qrCode ? `${finalBaseUrl}/qr/${qrCode.id}` : '#'

    if (error && !qrCode) {
        return (
            <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 w-full rounded-xl border-2 border-dashed p-4 text-center">
                <p className="text-xs font-bold text-red-500 mb-2">Un problème est survenu</p>
                <p className="text-[10px] mb-4 text-muted-foreground">{error}</p>
                <button
                    onClick={handleAutoGenerate}
                    className="flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                    <RefreshCw className="h-3 w-3" /> Réessayer
                </button>
            </div>
        )
    }

    if (!qrCode) {
        return (
            <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 w-full rounded-xl border-2 border-dashed p-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
                <p className="text-xs font-medium">Génération du format...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <TablePrintCard
                qrId={`qr-${tableId}`}
                tableName={tableName}
                qrUrl={qrUrl}
                restaurantName={restaurantName}
                restaurantLogo={restaurantLogo}
            />
            <div className="w-full">
                <DownloadQrButton elementId={`qr-${tableId}`} fileName={`Manly-Table-${tableName}`} />
            </div>
        </div>
    )
}
