'use client'

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { syncToGoogleSheets } from "@/components/modules/analytics/actions"
import { createGoogleSheet, disconnectGoogle } from "@/components/modules/analytics/google-actions"
import { useState } from "react"
import {
    Download as DownloadIcon,
    Table as TableIcon,
    Link as LinkIcon,
    Unlink as UnlinkIcon,
    ExternalLink as ExternalLinkIcon,
    CheckCircle2 as CheckIcon,
    Loader2 as LoaderIcon
} from "lucide-react"

type Props = {
    stats: any
    restaurantId: string
}

export function ExportButton({ stats, restaurantId }: Props) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const isGoogleConnected = !!stats?.settings?.google_auth?.tokens
    const hasSheet = !!stats?.settings?.google_sheet_id
    const sheetUrl = stats?.settings?.google_sheet_url

    const handleExportCSV = () => {
        try {
            const headers = ["Plat", "Commandés", "Servis", "Refusés", "Revenue Total"]
            const rows = stats.dishPerformance.map((p: any) => [
                p.name,
                p.ordered,
                p.served,
                p.refused,
                p.revenue
            ])
            const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n")
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `analytics-export-${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success("Export CSV réussi !")
        } catch (error) {
            toast.error("Échec de l'export CSV")
        }
    }

    const handleGoogleConnect = () => {
        setIsConnecting(true)
        window.location.href = '/api/auth/google'
    }

    const handleSync = async () => {
        if (!hasSheet) {
            setIsSyncing(true)
            try {
                await createGoogleSheet(restaurantId)
                toast.success("Fichier Google Sheets créé et synchronisé !")
            } catch (error: any) {
                toast.error(error.message)
            } finally {
                setIsSyncing(false)
            }
            return
        }

        setIsSyncing(true)
        const result = await syncToGoogleSheets(stats)
        setIsSyncing(false)

        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="rounded-xl border-orange-200 hover:bg-orange-50 text-orange-700 font-bold h-10 px-4"
            >
                <DownloadIcon className="h-4 w-4 mr-2" />
                CSV
            </Button>

            {!isGoogleConnected ? (
                <Button
                    onClick={handleGoogleConnect}
                    disabled={isConnecting}
                    className="rounded-xl bg-[#4285F4] hover:bg-[#357ae8] text-white font-black uppercase text-[10px] h-10 px-4 shadow-lg shadow-blue-500/20"
                >
                    {isConnecting ? (
                        <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                    )}
                    Connexion Gmail
                </Button>
            ) : (
                <div className="flex items-center gap-2 bg-blue-50/50 p-1 pr-3 rounded-2xl border border-blue-100">
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="rounded-xl bg-[#4285F4] hover:bg-[#357ae8] text-white font-black uppercase text-[10px] h-8 px-4"
                    >
                        {isSyncing ? (
                            <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : hasSheet ? (
                            <CheckIcon className="h-4 w-4 mr-2" />
                        ) : (
                            <TableIcon className="h-4 w-4 mr-2" />
                        )}
                        {isSyncing ? 'Sync...' : hasSheet ? 'Sync Maintenant' : 'Créer le fichier'}
                    </Button>

                    {sheetUrl && (
                        <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors">
                            <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                    )}

                    <button
                        onClick={() => {
                            if (confirm("Déconnecter votre compte Google ?")) disconnectGoogle()
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        title="Déconnecter"
                    >
                        <UnlinkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
