'use client'

import { useState } from 'react'
import { EditAdminPermissionsDrawer } from './edit-admin-permissions-drawer'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'

type Admin = {
    id: string
    email?: string | null
    is_super_admin: boolean
    permissions?: Record<string, any> | null
}

export function EditAdminButton({ admin, currentUserId }: { admin: Admin; currentUserId: string }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-600/10 hover:text-indigo-600 transition-colors"
                title="Modifier les droits"
            >
                <Settings2 className="h-4 w-4" />
            </Button>

            <EditAdminPermissionsDrawer
                admin={admin}
                isCurrentUser={currentUserId === admin.id}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    )
}
