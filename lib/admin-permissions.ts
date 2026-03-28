/**
 * Admin Permissions Utility
 * -------------------------
 * Centralizes all permission checks for the admin dashboard.
 * Supports both the new granular format { users: { view, edit, delete } }
 * and the old flat format { users: true } for backwards compatibility.
 */

export type GranularPermissions = {
    users?: { view?: boolean; edit?: boolean; delete?: boolean; impersonate?: boolean }
    restaurants?: { view?: boolean; edit?: boolean; delete?: boolean }
    payments?: { view?: boolean; refund?: boolean }
    moderation?: { view?: boolean; resolve?: boolean }
    settings?: { view?: boolean; edit?: boolean }
    admins?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean }
    analytics?: { view?: boolean }
    tables?: { view?: boolean; edit?: boolean; delete?: boolean }
}


export type AdminRecord = {
    id: string
    email?: string | null
    is_super_admin: boolean
    permissions?: GranularPermissions | Record<string, boolean> | null
}

/**
 * Check if an admin has a specific granular permission.
 * 
 * @example
 * can(admin, 'users', 'delete')  // → true/false
 * can(admin, 'payments', 'view') // → true/false
 */
export function can(
    admin: AdminRecord,
    section: keyof GranularPermissions,
    action: string
): boolean {
    // Super admins bypass all checks
    if (admin.is_super_admin) return true

    const perms = admin.permissions
    if (!perms) return false

    const sectionPerms = (perms as any)[section]
    if (!sectionPerms) return false

    // Handle OLD flat format for backward compatibility: { users: true }
    if (typeof sectionPerms === 'boolean') return sectionPerms

    // Handle NEW granular format: { users: { view: true, edit: false } }
    return sectionPerms[action] === true
}

/**
 * Check if the admin can VIEW a section (most permissive check).
 * Use this to decide if a sidebar link is visible.
 * 
 * @example
 * canView(admin, 'users') // → true/false
 */
export function canView(admin: AdminRecord, section: keyof GranularPermissions): boolean {
    return can(admin, section, 'view')
}

/**
 * Check if the admin can EDIT in a section.
 */
export function canEdit(admin: AdminRecord, section: keyof GranularPermissions): boolean {
    return can(admin, section, 'edit')
}

/**
 * Returns all sections the admin can access.
 * Useful for building dynamic sidebars.
 */
export function getAccessibleSections(admin: AdminRecord): (keyof GranularPermissions)[] {
    if (admin.is_super_admin) {
        return ['users', 'restaurants', 'payments', 'moderation', 'settings', 'admins', 'analytics', 'tables']
    }

    const allSections: (keyof GranularPermissions)[] = [
        'users', 'restaurants', 'payments', 'moderation', 'settings', 'admins', 'analytics', 'tables'
    ]


    return allSections.filter(section => canView(admin, section))
}
