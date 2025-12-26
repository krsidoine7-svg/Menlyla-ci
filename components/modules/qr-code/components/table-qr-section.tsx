'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import QRCode from 'react-qr-code'
import { Loader2, RefreshCw } from 'lucide-react'
import { regenerateQrCode } from '../actions'
import { DownloadQrButton } from './download-qr-button'
import { Button } from '@/components/ui/button'

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

    // Sync with prop changes if they happen (e.g. parent refetch)
    useEffect(() => {
        setQrCode(initialQrCode)
        setIsGenerating(false)
        if (initialQrCode) {
            setError(null)
        }
    }, [initialQrCode])

    useEffect(() => {
        // Only auto-generate if we are SURE there is no QR code and we aren't already doing it, and NO ERROR
        if (!qrCode && !isGenerating && !isPending && !initialQrCode && !error) {
            handleAutoGenerate()
        }
    }, [qrCode, isGenerating, isPending, initialQrCode, error])

    const handleAutoGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        try {
            await new Promise(resolve => setTimeout(resolve, 800))
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


    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const qrUrl = qrCode ? `${baseUrl}/qr/${qrCode.id}` : '#'

    if (!qrCode || isGenerating || isPending) {
        return (
            <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 w-full max-w-[280px] rounded-xl border-2 border-dashed p-4 text-center">
                {error ? (
                    <>
                        <p className="text-xs font-bold text-red-500 mb-2">Un problème est survenu</p>
                        <p className="text-[10px] mb-4 text-muted-foreground">{error}</p>
                        <Button variant="outline" size="sm" onClick={handleAutoGenerate}>
                            <RefreshCw className="mr-2 h-3 w-3" /> Réessayer
                        </Button>
                    </>
                ) : (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
                        <p className="text-xs font-medium">Initialisation du QR Code...</p>
                    </>
                )}
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
            <div className="w-full max-w-[280px]">
                <DownloadQrButton elementId={`qr-${tableId}`} fileName={`Manly-Table-${tableName}`} />
            </div>
        </div>
    )
}
