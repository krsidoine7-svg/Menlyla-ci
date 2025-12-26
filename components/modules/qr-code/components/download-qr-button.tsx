'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
    elementId: string
    fileName: string
}

export function DownloadQrButton({ elementId, fileName }: Props) {
    const downloadQr = () => {
        const svg = document.getElementById(elementId)
        if (!svg) {
            toast.error("Code QR introuvable")
            return
        }

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        // Add margin and background
        const size = 256
        canvas.width = size + 40
        canvas.height = size + 40

        img.onload = () => {
            if (!ctx) return
            // White background
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw QR
            ctx.drawImage(img, 20, 20, size, size)

            const pngFile = canvas.toDataURL("image/png")
            const downloadLink = document.createElement("a")
            downloadLink.download = `${fileName}.png`
            downloadLink.href = pngFile
            downloadLink.click()
            toast.success("QR Code téléchargé !")
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <Button variant="outline" className="w-full py-6 text-base font-semibold border-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all rounded-xl" onClick={downloadQr}>
            <Download className="mr-2 h-5 w-5" /> Télécharger le QR Code
        </Button>
    )
}
