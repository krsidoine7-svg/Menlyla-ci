'use client'

import { type ReactNode, useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { updateRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/modules/menu/components/image-upload'
import { MessageCircle, Instagram, Facebook, Video, Plus, Trash2, CircleAlert, CheckCircle2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuSettings } from './menu-settings'
import { LegalSettings } from './legal-settings'
import { AnalyticsSettings } from './analytics-settings'
import { NotificationsSettings } from './notifications-settings'
import { DemoDataSection } from '@/components/modules/settings/components/demo-data-section'

type Props = {
    restaurant: any
}

const SOCIAL_PLATFORMS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, prefix: 'https://wa.me/', placeholder: '2250102030405' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: 'votre_nom' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'votre_page' },
    { id: 'tiktok', name: 'TikTok', icon: Video, prefix: 'https://tiktok.com/@', placeholder: 'votre_nom' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export function UnifiedSettings({ restaurant }: Props) {
    const updateWithId = updateRestaurant.bind(null, restaurant.id)
    const [state, formAction, isPending] = useActionState(updateWithId, { message: null, errors: {} })

    // Profile State
    const [name, setName] = useState(restaurant.name)
    const [slug, setSlug] = useState(restaurant.slug)
    const [description, setDescription] = useState(restaurant.description)
    const [phone, setPhone] = useState(restaurant.phone)
    const [email, setEmail] = useState(restaurant.email)
    const [address, setAddress] = useState(restaurant.address)

    // Other State
    const [logoUrl, setLogoUrl] = useState(restaurant.logo_url)
    const [bannerUrl, setBannerUrl] = useState(restaurant.banner_url)
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>(restaurant.social_links || {})
    const [selectedPlatform, setSelectedPlatform] = useState('whatsapp')
    const [username, setUsername] = useState('')

    const defaultSettings = useMemo(() => {
        const base = restaurant.settings || {}
        const defaultSchedule = {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '09:00', close: '23:00', closed: false },
            sunday: { open: '09:00', close: '21:00', closed: true },
        }
        const mergedSchedule = { ...defaultSchedule }
        if (base.hours?.schedule) {
            DAYS.forEach(day => {
                if (base.hours.schedule[day]) {
                    mergedSchedule[day] = {
                        ...defaultSchedule[day],
                        ...base.hours.schedule[day]
                    }
                }
            })
        }

        return {
            show_passport: base.show_passport ?? true,
            show_wifi: base.show_wifi ?? true,
            wifi_name: base.wifi_name ?? '',
            wifi_password: base.wifi_password ?? '',
            passport_goal: base.passport_goal ?? 10,
            passport_reward: base.passport_reward ?? '',
            payment_methods_list: base.payment_methods_list ?? ['orange', 'wave', 'cash'],
            gsheet_webhook: base.gsheet_webhook ?? '',
            events: base.events ?? [],
            theme: base.theme ?? { primaryColor: '#FF6B3D', secondaryColor: '#FF6B3D', useGradient: false },
            currency: base.currency,
            identity: {
                slogan: '',
                cuisine_type: '',
                ...(base.identity || {}),
            },
            contact: {
                whatsapp: '',
                ...(base.contact || {}),
            },
            hours: {
                schedule: mergedSchedule,
                ...base.hours
            },
        }
    }, [restaurant.settings])

    const [settings, setSettings] = useState<Record<string, any>>(defaultSettings)

    const searchParams = useSearchParams()

    // Default to 'profile' if no section in URL
    const [activeSection, setActiveSection] = useState<string>(searchParams.get('section') || 'profile')

    useEffect(() => {
        const section = searchParams.get('section')
        if (section && section !== activeSection) {
            setActiveSection(section)
        }
    }, [searchParams])

    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const initialSnapshotRef = useRef<string>('')

    const themePresets = useMemo(() => ([
        { label: 'Bissap', color: '#FF5C3C' },
        { label: 'Ivoire', color: '#FFB703' },
        { label: 'Menthe', color: '#14B8A6' },
        { label: 'Indigo', color: '#4338CA' },
    ]), [])

    const themeColor = settings?.theme?.primaryColor || '#FF6B3D'
    const secondaryColor = settings?.theme?.secondaryColor || '#FF6B3D'
    const useGradient = settings?.theme?.useGradient || false

    const currentSnapshot = useMemo(() => ({
        name: name || '',
        slug: slug || '',
        description: description || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
        logoUrl: logoUrl || '',
        bannerUrl: bannerUrl || '',
        socialLinks,
        settings,
    }), [name, slug, description, phone, email, address, logoUrl, bannerUrl, socialLinks, settings])

    useEffect(() => {
        if (!initialSnapshotRef.current) {
            initialSnapshotRef.current = JSON.stringify(currentSnapshot)
            return
        }
        const serialized = JSON.stringify(currentSnapshot)
        setIsDirty(serialized !== initialSnapshotRef.current)
    }, [currentSnapshot])

    useEffect(() => {
        if (!state.message) return
        if (!state.errors || Object.keys(state.errors).length === 0) {
            toast.success(state.message)
            setLastSavedAt(new Date())
            initialSnapshotRef.current = JSON.stringify(currentSnapshot)
            setIsDirty(false)
        } else {
            toast.error(state.message)
        }
    }, [state, currentSnapshot])

    // State Hydration
    useEffect(() => {
        setName(restaurant.name || '')
        setSlug(restaurant.slug || '')
        setDescription(restaurant.description || '')
        setPhone(restaurant.phone || '')
        setEmail(restaurant.email || '')
        setAddress(restaurant.address || '')

        const nextLogo = restaurant.logo_url || ''
        const nextBanner = restaurant.banner_url || ''
        const nextSocial = restaurant.social_links || {}
        const nextSettings = restaurant.settings || {}
        setLogoUrl(nextLogo)
        setBannerUrl(nextBanner)
        setSocialLinks(nextSocial)
        setSettings(nextSettings)
        setLastSavedAt(restaurant.updated_at ? new Date(restaurant.updated_at) : null)
        initialSnapshotRef.current = JSON.stringify({
            name: restaurant.name || '',
            slug: restaurant.slug || '',
            description: restaurant.description || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            address: restaurant.address || '',
            logoUrl: nextLogo,
            bannerUrl: nextBanner,
            socialLinks: nextSocial,
            settings: nextSettings,
        })
        setIsDirty(false)
        setSettings(defaultSettings)
    }, [restaurant, defaultSettings])

    const handleAddSocial = () => {
        if (!username) return
        setSocialLinks(prev => ({ ...prev, [selectedPlatform]: username }))
        setUsername('')
    }
    const handleRemoveSocial = (platformId: string) => {
        const newLinks = { ...socialLinks }
        delete newLinks[platformId]
        setSocialLinks(newLinks)
    }
    const handleReset = useCallback(() => {
        if (!initialSnapshotRef.current) return
        const parsed = JSON.parse(initialSnapshotRef.current)
        setName(parsed.name || '')
        setSlug(parsed.slug || '')
        setDescription(parsed.description || '')
        setPhone(parsed.phone || '')
        setEmail(parsed.email || '')
        setAddress(parsed.address || '')
        setLogoUrl(parsed.logoUrl || '')
        setBannerUrl(parsed.bannerUrl || '')
        setSocialLinks(parsed.socialLinks || {})
        setSettings(parsed.settings || {})
        setIsDirty(false)
    }, [])
    const handleThemeChange = useCallback((color: string, field: 'primaryColor' | 'secondaryColor' = 'primaryColor') => {
        setSettings(prev => ({
            ...prev,
            theme: {
                ...(prev.theme || {}),
                [field]: color
            }
        }))
    }, [])

    const toggleGradient = useCallback((enabled: boolean) => {
        setSettings(prev => ({
            ...prev,
            theme: {
                ...(prev.theme || {}),
                useGradient: enabled,
                // If enabling gradient, default secondary to slightly darker/lighter if not set, or just same 
                secondaryColor: prev.theme?.secondaryColor || prev.theme?.primaryColor
            }
        }))
    }, [])

    const isExternalView = ['menu', 'legal', 'analytics', 'notifications', 'demo'].includes(activeSection)

    return (
        <div className="flex flex-col min-h-[80vh]">
            <main className="flex-1 w-full max-w-5xl mx-auto pb-20 pt-4">
                {activeSection === 'menu' && <MenuSettings restaurant={restaurant} />}
                {activeSection === 'legal' && <LegalSettings restaurant={restaurant} />}
                {activeSection === 'analytics' && <AnalyticsSettings restaurant={restaurant} />}
                {activeSection === 'notifications' && <NotificationsSettings restaurant={restaurant} />}
                {activeSection === 'demo' && <DemoDataSection />}

                {!isExternalView && (
                    <form action={formAction} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Hidden Inputs for Form Submission: Source of Truth is State */}
                        <input type="hidden" name="name" value={name || ''} />
                        <input type="hidden" name="slug" value={slug || ''} />
                        <input type="hidden" name="description" value={description || ''} />
                        <input type="hidden" name="phone" value={phone || ''} />
                        <input type="hidden" name="email" value={email || ''} />
                        <input type="hidden" name="address" value={address || ''} />
                        <input type="hidden" name="logo_url" value={logoUrl || ''} />
                        <input type="hidden" name="banner_url" value={bannerUrl || ''} />
                        <input type="hidden" name="social_links" value={JSON.stringify(socialLinks)} />
                        <input type="hidden" name="settings" value={JSON.stringify(settings)} />

                        {activeSection === 'profile' && (
                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 pb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Profil & Identité</CardTitle>
                                            <CardDescription>Informations visibles sur votre page publique.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label>Nom de l'établissement</Label>
                                            <Input value={name || ''} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
                                            {state.errors?.name && <p className="text-red-500 text-xs font-medium">{state.errors.name[0]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug (URL)</Label>
                                            <Input value={slug || ''} onChange={e => setSlug(e.target.value)} className="h-11 rounded-xl" />
                                            {state.errors?.slug && <p className="text-red-500 text-xs font-medium">{state.errors.slug[0]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description courte</Label>
                                            <Textarea value={description || ''} onChange={e => setDescription(e.target.value)} className="min-h-[100px] rounded-xl" />
                                            {state.errors?.description && <p className="text-red-500 text-xs font-medium">{state.errors.description[0]}</p>}
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Téléphone</Label>
                                                <Input value={phone || ''} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl" />
                                                {state.errors?.phone && <p className="text-red-500 text-xs font-medium">{state.errors.phone[0]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input value={email || ''} onChange={e => setEmail(e.target.value)} className="h-11 rounded-xl" />
                                                {state.errors?.email && <p className="text-red-500 text-xs font-medium">{state.errors.email[0]}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Adresse</Label>
                                            <Textarea value={address || ''} onChange={e => setAddress(e.target.value)} placeholder="Rue, Quartier, Ville" className="rounded-xl" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'social' && (
                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 pb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Réseaux Sociaux</CardTitle>
                                            <CardDescription>Vos points de contact numériques.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <select
                                            value={selectedPlatform}
                                            onChange={e => setSelectedPlatform(e.target.value)}
                                            className="h-11 rounded-xl border px-3 text-sm bg-background"
                                        >
                                            {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <Input
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Nom d'utilisateur"
                                            className="h-11 rounded-xl"
                                        />
                                        <Button type="button" onClick={handleAddSocial} className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Ajouter</Button>
                                    </div>

                                    <div className="space-y-3">
                                        {SOCIAL_PLATFORMS.map(platform => {
                                            const val = socialLinks[platform.id]
                                            if (!val) return null
                                            return (
                                                <div key={platform.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <platform.icon className="h-5 w-5 text-slate-500" />
                                                        <span className="font-medium text-sm">{platform.name}: <span className="text-slate-600 font-normal">{val}</span></span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSocial(platform.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-400" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {Object.keys(socialLinks).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun réseau configuré.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'design' && (
                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Marque & Apparence</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <ImageUpload label="Logo" id="logo" defaultImage={logoUrl} onImageUploaded={setLogoUrl} onImageRemoved={() => setLogoUrl('')} />
                                        <ImageUpload label="Bannière" id="banner" defaultImage={bannerUrl} onImageUploaded={setBannerUrl} onImageRemoved={() => setBannerUrl('')} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Couleurs de la Marque</Label>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="gradient-mode" className="text-xs font-normal text-muted-foreground cursor-pointer">Mode Dégradé</Label>
                                                <FeatureToggle
                                                    label=""
                                                    description=""
                                                    checked={useGradient}
                                                    onChange={toggleGradient}
                                                    compact
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            {/* PRIMARY COLOR */}
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                    {useGradient ? 'Couleur de départ' : 'Couleur Principale'}
                                                </span>
                                                <div className="flex gap-3 flex-wrap">
                                                    {themePresets.map(t => (
                                                        <button key={t.color} type="button" onClick={() => handleThemeChange(t.color, 'primaryColor')}
                                                            className={cn(
                                                                "h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                                                                themeColor === t.color ? "border-slate-900 scale-110 shadow-md" : "border-transparent"
                                                            )}
                                                            style={{ backgroundColor: t.color }}
                                                            title={t.label}
                                                        />
                                                    ))}

                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-white relative overflow-hidden",
                                                                !themePresets.some(t => t.color === themeColor) ? "border-slate-900 scale-110 shadow-md" : "border-slate-200"
                                                            )}
                                                        >
                                                            {!themePresets.some(t => t.color === themeColor) ? (
                                                                <div className="absolute inset-0" style={{ backgroundColor: themeColor }} />
                                                            ) : (
                                                                <div className="bg-gradient-to-br from-red-500 via-green-500 to-blue-500 w-full h-full opacity-50" />
                                                            )}
                                                            <Plus className={cn("h-4 w-4 relative z-10", !themePresets.some(t => t.color === themeColor) ? "text-white mix-blend-difference" : "text-slate-600")} />
                                                        </button>
                                                        <input
                                                            id="primary-color-input"
                                                            type="color"
                                                            value={themeColor}
                                                            onChange={e => handleThemeChange(e.target.value, 'primaryColor')}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECONDARY COLOR (Only if Gradient) */}
                                            {useGradient && (
                                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Couleur de fin</span>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {themePresets.map(t => (
                                                            <button key={`sec-${t.color}`} type="button" onClick={() => handleThemeChange(t.color, 'secondaryColor')}
                                                                className={cn(
                                                                    "h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                                                                    secondaryColor === t.color ? "border-slate-900 scale-110 shadow-md" : "border-transparent"
                                                                )}
                                                                style={{ backgroundColor: t.color }}
                                                                title={t.label}
                                                            />
                                                        ))}

                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-white relative overflow-hidden",
                                                                    !themePresets.some(t => t.color === secondaryColor) ? "border-slate-900 scale-110 shadow-md" : "border-slate-200"
                                                                )}
                                                            >
                                                                <div className="absolute inset-0" style={{ backgroundColor: secondaryColor }} />
                                                                <Plus className="h-4 w-4 relative z-10 text-white mix-blend-difference" />
                                                            </button>
                                                            <input
                                                                id="secondary-color-input"
                                                                type="color"
                                                                value={secondaryColor}
                                                                onChange={e => handleThemeChange(e.target.value, 'secondaryColor')}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <BrandPreview logoUrl={logoUrl} bannerUrl={bannerUrl} primaryColor={themeColor} secondaryColor={secondaryColor} useGradient={useGradient} />
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'passport' && (
                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50"><CardTitle>Passeport & Fidélité</CardTitle></CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4">
                                        <FeatureToggle label="Activer le Passeport" description="Permet aux clients de collecter des tampons." checked={settings.show_passport !== false} onChange={v => setSettings(s => ({ ...s, show_passport: v }))} />
                                        {settings.show_passport !== false && (
                                            <div className="pl-14 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nombre de tampons</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="10"
                                                        value={settings.passport_goal || ''}
                                                        onChange={e => setSettings({ ...settings, passport_goal: parseInt(e.target.value) || 0 })}
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Récompense</Label>
                                                    <Input
                                                        placeholder="Un cocktail offert"
                                                        value={settings.passport_reward || ''}
                                                        onChange={e => setSettings({ ...settings, passport_reward: e.target.value })}
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <FeatureToggle label="Afficher le Wi-Fi" description="Partage facile du Wi-Fi." checked={settings.show_wifi !== false} onChange={v => setSettings(s => ({ ...s, show_wifi: v }))} />
                                        {settings.show_wifi !== false && (
                                            <div className="pl-14 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nom du réseau (SSID)</Label>
                                                    <Input
                                                        placeholder="WiFi-Restaurant"
                                                        value={settings.wifi_name || ''}
                                                        onChange={e => setSettings({ ...settings, wifi_name: e.target.value })}
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Mot de passe</Label>
                                                    <Input
                                                        placeholder="********"
                                                        value={settings.wifi_password || ''}
                                                        onChange={e => setSettings({ ...settings, wifi_password: e.target.value })}
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex flex-col gap-1 px-2">
                                            <Label className="text-sm font-bold">Modes de Paiement</Label>
                                            <p className="text-xs text-muted-foreground">Sélectionnez les moyens de paiement que vous acceptez à table.</p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-2">
                                            {[
                                                { id: 'orange', label: 'Orange Money' },
                                                { id: 'wave', label: 'Wave' },
                                                { id: 'moov', label: 'Moov Money' },
                                                { id: 'mtn', label: 'MTN Money' },
                                                { id: 'cash', label: 'Espèces' },
                                                { id: 'visa', label: 'Carte Visa' },
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = settings.payment_methods_list || []
                                                        const next = current.includes(method.id)
                                                            ? current.filter((m: string) => m !== method.id)
                                                            : [...current, method.id]
                                                        setSettings({ ...settings, payment_methods_list: next })
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-tight",
                                                        (settings.payment_methods_list || []).includes(method.id)
                                                            ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                                                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                                    )}
                                                >
                                                    {(settings.payment_methods_list || []).includes(method.id) ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                                                    )}
                                                    {method.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'events' && (
                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                                    <CardTitle>Événements</CardTitle>
                                    <Button type="button" size="sm" onClick={() => setSettings(s => ({ ...s, events: [...(s.events || []), { id: Math.random().toString(36).substring(2, 9), title: 'Nouvel Événement', description: '', date: '', image_url: '' }] }))}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {(settings.events || []).map((ev: any, idx: number) => (
                                        <div key={ev.id} className="p-5 rounded-2xl border bg-slate-50/50 space-y-4 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Événement #{idx + 1}</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    onClick={() => setSettings(s => ({ ...s, events: s.events.filter((e: any) => e.id !== ev.id) }))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titre</Label>
                                                    <Input
                                                        value={ev.title}
                                                        onChange={e => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].title = e.target.value;
                                                            setSettings({ ...settings, events: newEvents })
                                                        }}
                                                        placeholder="Titre de l'événement"
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date / Période</Label>
                                                    <Input
                                                        type="date"
                                                        value={ev.date || ''}
                                                        onChange={e => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].date = e.target.value;
                                                            setSettings({ ...settings, events: newEvents })
                                                        }}
                                                        className="bg-white rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</Label>
                                                    <Textarea
                                                        value={ev.description}
                                                        onChange={e => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].description = e.target.value;
                                                            setSettings({ ...settings, events: newEvents })
                                                        }}
                                                        placeholder="Détails de l'événement..."
                                                        className="bg-white min-h-[100px] rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Affiche / Image</Label>
                                                    <ImageUpload
                                                        label="Importer l'affiche"
                                                        id={`event-upload-${ev.id}`}
                                                        defaultImage={ev.image_url}
                                                        onImageUploaded={(url) => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].image_url = url;
                                                            setSettings({ ...settings, events: newEvents });
                                                        }}
                                                        onImageRemoved={() => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].image_url = '';
                                                            setSettings({ ...settings, events: newEvents });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!settings.events?.length) && <p className="text-center text-sm text-muted-foreground">Aucun événement.</p>}
                                </CardContent>
                            </Card>
                        )}

                        <div className="sticky bottom-6 z-50 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
                            <div className="flex items-center gap-2 px-2">
                                <CircleAlert className={cn("h-4 w-4", isDirty ? "text-orange-400" : "text-green-400")} />
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                    {isDirty ? 'Modifications non enregistrées' : 'Synchronisé'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {isDirty && (
                                    <Button type="button" variant="ghost" onClick={handleReset} className="h-9 px-4 text-white hover:text-white hover:bg-white/10 rounded-xl text-xs font-medium">
                                        Annuler
                                    </Button>
                                )}
                                <Button type="submit" disabled={isPending || !isDirty} className="h-9 px-6 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold shadow-sm">
                                    {isPending ? '...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    )
}

function FeatureToggle({ label, description, checked, onChange, compact }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void, compact?: boolean }) {
    if (compact) {
        return (
            <button type="button" onClick={() => onChange(!checked)} className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-slate-900" : "bg-slate-200")}>
                <span className={cn("block h-4 w-4 rounded-full bg-white shadow transform transition-transform ml-0.5 mt-0.5", checked ? "translate-x-4" : "translate-x-0")} />
            </button>
        )
    }
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border hover:border-orange-200 transition-colors bg-white">
            <div className="space-y-1">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <button type="button" onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-orange-600" : "bg-slate-200")}>
                <span className={cn("block h-5 w-5 rounded-full bg-white shadow transform transition-transform ml-0.5", checked ? "translate-x-5" : "translate-x-0")} />
            </button>
        </div>
    )
}

function BrandPreview({ logoUrl, bannerUrl, primaryColor, secondaryColor, useGradient }: { logoUrl?: string | null, bannerUrl?: string | null, primaryColor: string, secondaryColor?: string, useGradient?: boolean }) {
    const bgStyle = useGradient
        ? { backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }
        : { backgroundColor: primaryColor }

    return (
        <div className="border rounded-xl overflow-hidden shadow-sm opacity-80 scale-95 origin-left">
            <div className="h-24 bg-slate-100 relative bg-cover bg-center" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}>
                {logoUrl && <img src={logoUrl} className="absolute -bottom-6 left-4 h-16 w-16 rounded-xl border-4 border-white shadow-md object-cover" />}
            </div>
            <div className="pt-8 pb-4 px-4 bg-white">
                <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-20 bg-slate-50 rounded" />
                <button className="mt-4 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm" style={bgStyle}>ACTION</button>
            </div>
        </div>
    )
}
