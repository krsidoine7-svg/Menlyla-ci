import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/admin-permissions'
import { 
    Users, 
    MoreHorizontal, 
    Search, 
    Filter, 
    Trash2, 
    Edit, 
    ShieldCheck, 
    ShieldX,
    UserCircle,
    Mail,
    Calendar,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    UserPlus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserRow } from '@/components/modules/super-admin/user-row'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default async function UsersManagement({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const adminClient = getAdminClient()

    // Fetch current admin's permissions for UI gating
    const { data: currentAdminRecord } = await adminClient
        .from('app_admins')
        .select('id, is_super_admin, permissions')
        .eq('id', currentUser?.id ?? '')
        .maybeSingle()

    const adminRecord = currentAdminRecord || { id: '', is_super_admin: false, permissions: null }
    const canEditUser = can(adminRecord, 'users', 'edit')
    const canDeleteUser = can(adminRecord, 'users', 'delete')
    const canImpersonateUser = can(adminRecord, 'users', 'impersonate')
    
    // Extract search, sort and pagination params
    const query = typeof params.q === 'string' ? params.q : ''
    const sort = typeof params.sort === 'string' ? params.sort : 'created_at'
    const order = typeof params.order === 'string' ? params.order : 'desc'
    const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
    
    const ITEMS_PER_PAGE = 10
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    // Fetch Admin IDs first to exclude them from the regular users list
    const { data: adminsRes } = await adminClient.from('app_admins').select('id')
    const adminIds = (adminsRes || []).map(a => a.id)

    // Build the query
    let usersQuery = adminClient
        .from('profiles')
        .select('*', { count: 'exact' })
        .order(sort, { ascending: order === 'asc' })
        .range(from, to)

    // Exclude admins gracefully at the DB level
    if (adminIds.length > 0) {
        usersQuery = usersQuery.not('id', 'in', `(${adminIds.join(',')})`)
    }

    if (query) {
        usersQuery = usersQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: usersRes, count, error } = await usersQuery

    if (error) console.error('Users fetch error:', error)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    
    // Format the list
    const usersWithRoles = (usersRes || []).map(u => ({
        ...u,
        isAdmin: false
    }))

    // Helper to generate URLs while preserving existing params
    const getSortUrl = (column: string) => {
        const newOrder = sort === column && order === 'asc' ? 'desc' : 'asc'
        const urlParams = new URLSearchParams()
        if (query) urlParams.set('q', query)
        urlParams.set('sort', column)
        urlParams.set('order', newOrder)
        // Reset to page 1 on new sort
        urlParams.set('page', '1')
        return `/admin/users?${urlParams.toString()}`
    }

    const getPageUrl = (newPage: number) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.set('q', query)
        urlParams.set('sort', sort)
        urlParams.set('order', order)
        urlParams.set('page', newPage.toString())
        return `/admin/users?${urlParams.toString()}`
    }

    // Helper to render sort icon
    const SortIcon = ({ column }: { column: string }) => {
        if (sort !== column) return <ArrowUpDown className="h-3.5 w-3.5 opacity-30 ml-1.5 inline" />
        return order === 'asc' 
            ? <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-orange-500 inline" /> 
            : <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-orange-500 inline" />
    }

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-[2rem] bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-600/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-white italic">
                            Utilisateurs <span className="text-orange-500">.</span>
                        </h1>
                    </div>
                    <p className="text-white/40 font-medium max-w-2xl text-sm leading-relaxed">
                        Gestion centralisée de la base de données. Visualisez, modérez et gérez les comptes de votre plateforme.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                        <form method="get" action="/admin/users" className="w-full">
                            <Input 
                                name="q"
                                defaultValue={query}
                                placeholder="Rechercher par nom, email, @username..." 
                                className="pl-14 h-16 bg-white/5 border-white/10 rounded-[2rem] font-bold text-sm text-white transition-all shadow-2xl focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 placeholder:text-white/10"
                            />
                            <input type="hidden" name="sort" value={sort} />
                            <input type="hidden" name="order" value={order} />
                            <input type="hidden" name="page" value="1" />
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
                
                <CardHeader className="bg-white/[0.01] border-b border-white/5 px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-black italic text-white tracking-tight flex items-center gap-3">
                            <Filter className="h-5 w-5 text-orange-500" />
                            Répertoire Global
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            {totalCount.toLocaleString()} comptes {query ? 'référencés' : 'enregistrés'}
                        </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest text-white/60 gap-4 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all group">
                                    Organiser par: <span className="text-white">{sort === 'created_at' ? 'Date' : sort === 'full_name' ? 'Nom' : sort === 'email' ? 'Email' : sort}</span>
                                    <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:rotate-180 transition-all" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-2xl border-white/10 shadow-3xl p-3 bg-black/90 backdrop-blur-xl border border-white/10">
                                <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Critères de tri</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                {[
                                    { id: 'created_at', label: "Date d'inscription" },
                                    { id: 'full_name', label: "Nom complet" },
                                    { id: 'email', label: "Adresse Email" },
                                    { id: 'username', label: "Nom d'utilisateur" }
                                ].map((item) => (
                                    <DropdownMenuItem key={item.id} asChild className="rounded-xl mt-1 focus:bg-orange-600 focus:text-white cursor-pointer group">
                                        <Link href={getSortUrl(item.id)} className="font-bold flex items-center justify-between px-4 py-3 w-full transition-all">
                                            {item.label}
                                            {sort === item.id && <SortIcon column={item.id} />}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/[0.01] border-b border-white/5">
                                <th className="px-12 py-8">
                                    <Link href={getSortUrl('full_name')} className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-3 hover:text-orange-500 transition-colors group">
                                        <UserCircle className="h-4 w-4 text-orange-600/40 group-hover:text-orange-500 transition-colors" />
                                        Utilisateur <SortIcon column="full_name" />
                                    </Link>
                                </th>
                                <th className="px-10 py-8">
                                    <Link href={getSortUrl('email')} className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-3 hover:text-orange-500 transition-colors group">
                                        <Mail className="h-4 w-4 text-orange-600/40 group-hover:text-orange-500 transition-colors" />
                                        Contact <SortIcon column="email" />
                                    </Link>
                                </th>
                                <th className="px-10 py-8 text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-4 w-4 text-orange-600/40" />
                                        Compte & Rôle
                                    </div>
                                </th>
                                <th className="px-10 py-8">
                                    <Link href={getSortUrl('created_at')} className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-3 hover:text-orange-500 transition-colors group">
                                        <Calendar className="h-4 w-4 text-orange-600/40 group-hover:text-orange-500 transition-colors" />
                                        Depuis <SortIcon column="created_at" />
                                    </Link>
                                </th>
                                <th className="px-12 py-8 text-right text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {usersWithRoles?.map((user: any) => (
                                <UserRow 
                                    key={user.id} 
                                    user={user} 
                                    isAdmin={user.isAdmin}
                                    canEdit={canEditUser}
                                    canDelete={canDeleteUser}
                                    canImpersonate={canImpersonateUser}
                                />
                            ))}
                        </tbody>
                    </table>
                    
                    {(!usersWithRoles || usersWithRoles.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-40 bg-transparent">
                            <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-3xl flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform duration-700">
                                <Search className="h-10 w-10 text-white/10" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase text-white tracking-tight">Oups, le vide absolu</h3>
                            <p className="text-white/20 font-medium mt-4 text-sm max-w-sm text-center leading-relaxed">
                                Aucun utilisateur ne correspond à votre recherche "{query}". Essayez un autre mot-clé.
                            </p>
                            <Button variant="outline" asChild className="mt-12 h-14 px-10 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] text-white hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-xl">
                                <Link href="/admin/users">Réinitialiser la vue</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>

                {/* Pagination Luxe */}
                {totalCount > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between px-12 py-10 bg-white/[0.01] border-t border-white/5 relative z-10 gap-8">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-4">
                            Séquence <span className="text-white font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{from + 1} — {Math.min(to + 1, totalCount)}</span> sur <span className="text-orange-500 font-black">{totalCount}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button variant="outline" disabled={page <= 1} asChild={page > 1} className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all">
                                {page > 1 ? <Link href={getPageUrl(page - 1)}>Antérieur</Link> : <span>Antérieur</span>}
                            </Button>

                            <div className="flex items-center gap-2 px-4 h-14 bg-white/5 rounded-2xl border border-white/5 mx-2 font-black text-[10px] text-orange-500">
                                {page} <span className="text-white/20">/</span> {totalPages}
                            </div>

                            <Button variant="outline" disabled={page >= totalPages} asChild={page < totalPages} className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all">
                                {page < totalPages ? <Link href={getPageUrl(page + 1)}>Ultérieur</Link> : <span>Ultérieur</span>}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

