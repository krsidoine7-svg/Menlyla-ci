'use client'

import { useCartStore } from '@/lib/store/cart'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function TableSync() {
    const searchParams = useSearchParams()
    const setTableId = useCartStore((state) => state.setTableId)
    const tableId = searchParams.get('table')

    useEffect(() => {
        if (tableId) {
            setTableId(tableId)
            // Optional: Clean up URL? Or keep it?
            // Usually keeping it is fine as a bookmark or refresh-safe.
        }
    }, [tableId, setTableId])

    return null
}
