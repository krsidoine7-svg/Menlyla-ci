'use client'

import { ArchiveList } from './archive-list'
import { formatOrderId } from '@/lib/utils'

interface Props {
    initialOrders: any[]
    restaurantName: string
}

export function ArchiveView({ initialOrders, restaurantName }: Props) {
    const handlePrint = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=800,height=1000')
        if (!printWindow) return

        const itemsHtml = order.order_items?.map((item: any) => `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${item.quantity}x ${item.dishes?.name}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price.toLocaleString()} FCFA</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.unit_price).toLocaleString()} FCFA</td>
            </tr>
        `).join('')

        printWindow.document.write(`
            <html>
                <head>
                    <title>Facture #${formatOrderId(order.id, order.created_at)}</title>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .invoice-title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                        .restaurant-info { text-align: right; }
                        .details { margin-bottom: 40px; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        .total { text-align: right; font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                        .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #777; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="invoice-title">Facture Client</div>
                            <div>N° #${formatOrderId(order.id, order.created_at)}</div>
                            <div>Date: ${new Date(order.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                        <div class="restaurant-info">
                            <strong style="font-size: 18px;">${restaurantName}</strong><br>
                            ${order.tables?.name ? `Table: ${order.tables?.name}` : ''}<br>
                            Mode: ${order.dining_type === 'take_away' ? 'À Emporter' : 'Sur Place'}
                        </div>
                    </div>
                    
                    <table class="table">
                        <thead>
                            <tr style="text-align: left; background: #f9f9f9;">
                                <th style="padding: 10px;">Désignation</th>
                                <th style="padding: 10px; text-align: right;">P.U</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        Total à régler: ${order.total_amount.toLocaleString()} FCFA
                    </div>
                    
                    <div class="footer">
                        Merci de votre visite !<br>
                        ${restaurantName}<br>
                        Généré par Menlyla Dashboard
                    </div>
                    
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    return <ArchiveList orders={initialOrders} onPrint={handlePrint} />
}
