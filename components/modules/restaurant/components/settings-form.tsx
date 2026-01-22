'use client'

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { updateRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/modules/menu/components/image-upload'
import { MessageCircle, Instagram, Facebook, Video, Plus, Trash2, UserRound, Share2, Stamp, CalendarDays, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    restaurant: any
}

const SOCIAL_PLATFORMS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, prefix: 'https://wa.me/', placeholder: '2250102030405' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: 'votre_nom' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'votre_page' },
    { id: 'tiktok', name: 'TikTok', icon: Video, prefix: 'https://tiktok.com/@', placeholder: 'votre_nom' },
]

export function SettingsForm({ restaurant }: Props) {
    const updateWithId = updateRestaurant.bind(null, restaurant.id)
    const [state, formAction, isPending] = useActionState(updateWithId, { message: null, errors: {} })

    const [logoUrl, setLogoUrl] = useState(restaurant.logo_url)
    const [bannerUrl, setBannerUrl] = useState(restaurant.banner_url)

    // Social Links State
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>(restaurant.social_links || {})
    const [selectedPlatform, setSelectedPlatform] = useState('whatsapp')
    const [username, setUsername] = useState('')
    const [settings, setSettings] = useState<Record<string, any>>(restaurant.settings || {})

    const sectionLinks = useMemo(() => ([
        { id: 'profile', label: 'Profil', description: 'Identité publique, coordonnées et présentation.', icon: UserRound },
        { id: 'social', label: 'Réseaux', description: 'Ajoutez vos messageries et réseaux sociaux.', icon: Share2 },
        { id: 'passport', label: 'Passeport', description: 'Activez les avantages du Passeport Manly.', icon: Stamp },
        { id: 'events', label: 'Événements', description: 'Programmez vos soirées, offres et annonces.', icon: CalendarDays },
        { id: 'design', label: 'Design & Devise', description: 'Logos, images, devise et intégrations.', icon: Palette },
    ]), [])

    const statusLabel = restaurant?.is_active === false ? 'En pause' : 'Actif'
    const statusColor = restaurant?.is_active === false ? 'text-red-600' : 'text-green-600'
    const [activeSection, setActiveSection] = useState<string>('profile')
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const formRef = useRef<HTMLFormElement | null>(null)

    const themePresets = useMemo(() => ([
        { label: 'Bissap', color: '#FF5C3C' },
        { label: 'Ivoire', color: '#FFB703' },
        { label: 'Menthe', color: '#14B8A6' },
        { label: 'Indigo', color: '#4338CA' },
    ]), [])

    const themeColor = settings?.theme?.primaryColor || '#FF6B3D'

    const initialSnapshotRef = useRef<string>('')

    const currentSnapshot = useMemo(() => ({
        logoUrl: logoUrl || '',
        bannerUrl: bannerUrl || '',
        socialLinks,
        settings,
    }), [logoUrl, bannerUrl, socialLinks, settings])

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

    // Sync state with props when data is updated from server (revalidation)
    useEffect(() => {
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
            logoUrl: nextLogo,
            bannerUrl: nextBanner,
            socialLinks: nextSocial,
            settings: nextSettings,
        })
        setIsDirty(false)
    }, [restaurant])

    const handleAddSocial = () => {
        if (!username) return
        setSocialLinks(prev => ({
            ...prev,
            [selectedPlatform]: username
        }))
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
        setLogoUrl(parsed.logoUrl || '')
        setBannerUrl(parsed.bannerUrl || '')
        setSocialLinks(parsed.socialLinks || {})
        setSettings(parsed.settings || {})
        setIsDirty(false)
    }, [])

    const handleThemeChange = useCallback((color: string) => {
        setSettings(prev => ({
            ...prev,
            theme: {
                ...(prev.theme || {}),
                primaryColor: color
            }
        }))
    }, [])

    const activeSectionMeta = sectionLinks.find((link) => link.id === activeSection)
    const lastSavedLabel = lastSavedAt
        ? lastSavedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : null
    const statusMessage = isDirty
        ? 'Modifications en attente'
        : lastSavedLabel
            ? `Sauvegardé à ${lastSavedLabel}`
            : 'Aucune modification en attente'
    const statusBadgeClass = isDirty ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'

    return (
        <form action={formAction} className="space-y-12 scroll-smooth">
            <input type="hidden" name="logo_url" value={logoUrl || ''} />
            <input type="hidden" name="banner_url" value={bannerUrl || ''} />
            <input type="hidden" name="social_links" value={JSON.stringify(socialLinks)} />
            <input type="hidden" name="settings" value={JSON.stringify(settings)} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border bg-white/80 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Statut</p>
                    <p className={`text-2xl font-black mt-2 ${statusColor}`}>{statusLabel}</p>
                    <p className="text-xs text-muted-foreground">Visible sur le passeport</p>
                </div>
                <div className="rounded-3xl border bg-white/80 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Lien public</p>
                    <p className="text-2xl font-black mt-2 break-all">{restaurant.slug || 'non défini'}</p>
                    <p className="text-xs text-muted-foreground">manly.app/{restaurant.slug || '...'}</p>
                </div>
                <div className="rounded-3xl border bg-white/80 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Réseaux actifs</p>
                    <p className="text-2xl font-black mt-2">{Object.keys(socialLinks).length}</p>
                    <p className="text-xs text-muted-foreground">WhatsApp, Instagram, etc.</p>
                </div>
                <div className="rounded-3xl border bg-white/80 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Devise</p>
                    <p className="text-2xl font-black mt-2">{restaurant.currency || 'FCFA'}</p>
                    <p className="text-xs text-muted-foreground">Utilisée pour tout le menu</p>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-[260px,1fr] gap-8 items-start">
                <aside className="space-y-4 rounded-3xl border bg-white/80 p-4 shadow-sm lg:sticky lg:top-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Navigation</p>
                        <p className="text-sm text-muted-foreground">Choisissez une section à modifier.</p>
                    </div>
                    <nav className="flex items-center gap-2 overflow-auto pb-1 text-sm font-semibold text-muted-foreground lg:flex-col lg:gap-3 lg:overflow-visible">
                        {sectionLinks.map((link) => (
                            <button
                                key={link.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(link.id)
                                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                className={cn(
                                    "rounded-full px-4 py-2 transition-colors flex items-center gap-2 whitespace-nowrap lg:w-full",
                                    activeSection === link.id
                                        ? "bg-orange-600/10 text-orange-600 border border-orange-200 shadow-sm"
                                        : "hover:bg-orange-600/10 hover:text-orange-600"
                                )}
                                aria-current={activeSection === link.id ? 'page' : undefined}
                            >
                                {link.icon && <link.icon className="h-4 w-4" />}
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    {activeSectionMeta && (
                        <div className="rounded-3xl border bg-orange-50/40 p-4 shadow-sm flex items-center gap-3 text-sm text-orange-900">
                            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-orange-600">
                                {activeSectionMeta.icon && <activeSectionMeta.icon className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.4em] text-orange-500">Section active</p>
                                <p className="font-semibold">{activeSectionMeta.description}</p>
                            </div>
                        </div>
                    )}
                </aside>

                <div className="space-y-10">
                    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                        <div className="space-y-8">
                            <Card
                                id="profile"
                                className={cn(
                                    "scroll-mt-32 rounded-[2.5rem] border-none shadow-sm overflow-hidden",
                                    activeSection !== 'profile' && "hidden"
                                )}
                            >
                                <CardHeader className="bg-muted/30 pb-8">
                                    <CardTitle className="text-xl font-black">Profil du restaurant</CardTitle>
                                    <CardDescription>Informations générales visibles sur votre page.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Nom du restaurant
                                        </Label>
                                        <Input
                                            name="name"
                                            placeholder="Ex: Bistro Manly"
                                            defaultValue={restaurant.name || ''}
                                            className="rounded-2xl border-muted h-12 text-base font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            Description
                                        </Label>
                                        <Textarea
                                            name="description"
                                            placeholder="Décrivez votre concept, ambiance et cuisine."
                                            defaultValue={restaurant.description || ''}
                                            className="rounded-2xl border-muted min-h-[120px] text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</Label>
                                            <Input
                                                name="phone"
                                                placeholder="+225 01 02 03 04"
                                                defaultValue={restaurant.phone || ''}
                                                className="rounded-2xl border-muted h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                                            <Input
                                                name="email"
                                                placeholder="contact@restaurant.com"
                                                defaultValue={restaurant.email || ''}
                                                className="rounded-2xl border-muted h-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse</Label>
                                        <Textarea
                                            name="address"
                                            placeholder="Rue, ville, pays"
                                            defaultValue={restaurant.address || ''}
                                            className="rounded-2xl border-muted min-h-[90px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                id="social"
                                className={cn(
                                    "scroll-mt-32 rounded-[2.5rem] border-none shadow-sm overflow-hidden",
                                    activeSection !== 'social' && "hidden"
                                )}
                            >
                                <CardHeader className="bg-muted/30 pb-8">
                                    <CardTitle className="text-xl font-black">Réseaux & Contact</CardTitle>
                                    <CardDescription>Connectez vos plateformes sociales et messageries.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Ajouter un réseau</Label>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <select
                                                value={selectedPlatform}
                                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                                className="h-12 rounded-2xl border-muted bg-muted/20 px-4 text-sm font-semibold"
                                            >
                                                {SOCIAL_PLATFORMS.map(platform => (
                                                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                                                ))}
                                            </select>
                                            <Input
                                                placeholder="Identifiant ou numéro"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="rounded-2xl border-muted h-12 flex-1"
                                            />
                                            <Button type="button" onClick={handleAddSocial} className="rounded-2xl h-12 px-6 bg-orange-600 hover:bg-orange-700">
                                                Ajouter
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {SOCIAL_PLATFORMS.map(platform => {
                                            const value = socialLinks[platform.id]
                                            if (!value) return null
                                            const Icon = platform.icon
                                            return (
                                                <div key={platform.id} className="flex items-center justify-between rounded-3xl border border-muted bg-muted/10 px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-semibold">{platform.name}</p>
                                                            <p className="text-xs text-muted-foreground">{platform.prefix}{value}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSocial(platform.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {Object.keys(socialLinks).length === 0 && (
                                            <p className="text-xs font-semibold text-muted-foreground text-center py-6">Aucun réseau ajouté encore.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                id="passport"
                                className={cn(
                                    "scroll-mt-32 rounded-[2.5rem] border-none shadow-sm overflow-hidden",
                                    activeSection !== 'passport' && "hidden"
                                )}
                            >
                                <CardHeader className="bg-muted/30 pb-8">
                                    <CardTitle className="text-xl font-black">Passeport & Expérience</CardTitle>
                                    <CardDescription>Activez les fonctionnalités du passeport Manly.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-8">
                                    <FeatureToggle
                                        label="Afficher le passeport"
                                        description="Permet aux clients de timbrer leurs visites et débloquer des récompenses."
                                        checked={settings.show_passport !== false}
                                        onChange={(val) => setSettings(s => ({ ...s, show_passport: val }))}
                                    />
                                    <FeatureToggle
                                        label="Afficher les événements"
                                        description="Mettez en avant vos soirées, brunchs et offres limitées."
                                        checked={settings.show_events !== false}
                                        onChange={(val) => setSettings(s => ({ ...s, show_events: val }))}
                                    />
                                    <FeatureToggle
                                        label="Afficher le Wi-Fi"
                                        description="Diffusez automatiquement les infos Wi-Fi aux clients."
                                        checked={settings.show_wifi !== false}
                                        onChange={(val) => setSettings(s => ({ ...s, show_wifi: val }))}
                                    />
                                </CardContent>
                            </Card>

                            <Card
                                id="events"
                                className={cn(
                                    "scroll-mt-32 rounded-[2.5rem] border-none shadow-sm overflow-hidden border-2 border-orange-100/50 animation-in fade-in slide-in-from-top-4 duration-500",
                                    activeSection !== 'events' && "hidden"
                                )}
                            >
                                <CardHeader className="bg-orange-50/30 pb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-orange-950">Événements & Offres</CardTitle>
                                            <CardDescription className="font-medium">Annoncez vos soirées, promotions ou événements.</CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-100"
                                            onClick={() => {
                                                setSettings(s => {
                                                    const events = [...(s.events || [])]
                                                    events.push({
                                                        id: crypto.randomUUID(),
                                                        title: 'Nouvel événement',
                                                        date: '',
                                                        description: '',
                                                        image_url: ''
                                                    })
                                                    return { ...s, events }
                                                })
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    {(settings.events || []).map((event: any, index: number) => (
                                        <div key={event.id} className="p-6 rounded-[2rem] bg-orange-50/20 border border-orange-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Événement #{index + 1}</h4>
                                                    <Input
                                                        value={event.title}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            setSettings(s => {
                                                                const events = [...(s.events || [])]
                                                                events[index] = { ...events[index], title: value }
                                                                return { ...s, events }
                                                            })
                                                        }}
                                                        className="mt-2 rounded-2xl border-orange-200 bg-white/80 text-sm font-semibold"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSettings(s => {
                                                            const events = (s.events || []).filter((e: any) => e.id !== event.id)
                                                            return { ...s, events }
                                                        })
                                                    }}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={event.date}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            setSettings(s => {
                                                                const events = [...(s.events || [])]
                                                                events[index] = { ...events[index], date: value }
                                                                return { ...s, events }
                                                            })
                                                        }}
                                                        className="rounded-2xl border-orange-100 bg-white/80 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visuel</Label>
                                                    <ImageUpload
                                                        label="Image"
                                                        id={`event-image-${event.id}`}
                                                        defaultImage={event.image_url}
                                                        onImageUploaded={(url) => {
                                                            setSettings(s => {
                                                                const events = [...(s.events || [])]
                                                                events[index] = { ...events[index], image_url: url }
                                                                return { ...s, events }
                                                            })
                                                        }}
                                                        onImageRemoved={() => {
                                                            setSettings(s => {
                                                                const events = [...(s.events || [])]
                                                                events[index] = { ...events[index], image_url: '' }
                                                                return { ...s, events }
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                                                <Textarea
                                                    value={event.description}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])]
                                                            events[index] = { ...events[index], description: value }
                                                            return { ...s, events }
                                                        })
                                                    }}
                                                    className="rounded-2xl border-orange-100 bg-white/80 text-sm"
                                                    placeholder="Détails de l'événement, horaires, dress code..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {(!settings.events || settings.events.length === 0) && (
                                        <div className="py-12 text-center space-y-3 bg-muted/5 rounded-[2.5rem] border-2 border-dashed">
                                            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-bold text-muted-foreground">Aucun événement à afficher. Ajoutez-en un !</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <Card
                                id="design"
                                className={cn(
                                    "scroll-mt-32 rounded-[2.5rem] border-none shadow-sm overflow-hidden",
                                    activeSection !== 'design' && "hidden"
                                )}
                            >
                                <CardHeader className="bg-muted/30 pb-8">
                                    <CardTitle className="text-xl font-black">Design & Devise</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-6">
                                        <ImageUpload
                                            label="Logo"
                                            id="logo-upload"
                                            defaultImage={logoUrl}
                                            onImageUploaded={setLogoUrl}
                                            onImageRemoved={() => setLogoUrl('')}
                                        />
                                        <ImageUpload
                                            label="Bannière"
                                            id="banner-upload"
                                            defaultImage={bannerUrl}
                                            onImageUploaded={setBannerUrl}
                                            onImageRemoved={() => setBannerUrl('')}
                                        />
                                    </div>

                                    <BrandPreview logoUrl={logoUrl} bannerUrl={bannerUrl} primaryColor={themeColor} />

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Couleur principale</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {themePresets.map(preset => (
                                                <button
                                                    key={preset.label}
                                                    type="button"
                                                    onClick={() => handleThemeChange(preset.color)}
                                                    className={cn(
                                                        "h-10 w-10 rounded-2xl border-2 border-transparent ring-offset-2 transition",
                                                        themeColor === preset.color ? "ring-2 ring-orange-500" : "hover:border-orange-200"
                                                    )}
                                                    style={{ backgroundColor: preset.color }}
                                                    aria-label={`Palette ${preset.label}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={themeColor}
                                                onChange={(e) => handleThemeChange(e.target.value)}
                                                className="h-12 w-16 rounded-2xl border border-muted bg-white"
                                            />
                                            <span className="text-xs font-semibold text-muted-foreground">{themeColor}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t">
                                        <Label htmlFor="currency" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Devise du Restaurant</Label>
                                        <select
                                            id="currency"
                                            name="currency"
                                            defaultValue={restaurant.currency || 'FCFA'}
                                            className="flex h-12 w-full rounded-2xl border border-muted bg-muted/20 px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="FCFA">FCFA (CFA)</option>
                                            <option value="EUR">Euro (€)</option>
                                            <option value="USD">Dollar ($)</option>
                                            <option value="GNF">Franc Guinéen (FG)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Intégrations & Automatisation</Label>
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-2">
                                                <Label htmlFor="gsheet_webhook" className="text-[10px] font-black uppercase text-blue-600">Google Sheets Webhook (Make/Zapier)</Label>
                                                <Input
                                                    id="gsheet_webhook"
                                                    placeholder="https://hook.make.com/..."
                                                    value={settings.gsheet_webhook || ''}
                                                    onChange={(e) => setSettings(s => ({ ...s, gsheet_webhook: e.target.value }))}
                                                    className="rounded-2xl border-blue-200 bg-white h-10 text-sm"
                                                />
                                                <p className="text-[9px] font-bold text-blue-900/50 leading-tight px-1">
                                                    Collez ici l'URL de votre webhook pour synchroniser vos rapports Analytics.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden border-2 border-orange-100/60">
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Paiements acceptés</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cash', 'Carte bancaire', 'Mobile Money', 'Manly Pay'].map(method => {
                                                const selected = (settings.payment_methods_list || []).includes(method)
                                                return (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => {
                                                            setSettings(s => {
                                                                const list = new Set(s.payment_methods_list || [])
                                                                if (selected) {
                                                                    list.delete(method)
                                                                } else {
                                                                    list.add(method)
                                                                }
                                                                return { ...s, payment_methods_list: Array.from(list) }
                                                            })
                                                        }}
                                                        className={cn(
                                                            "rounded-full px-4 py-2 text-xs font-bold border",
                                                            selected ? "bg-orange-600/10 text-orange-700 border-orange-200" : "text-muted-foreground border-muted"
                                                        )}
                                                    >
                                                        {method}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="rounded-3xl border bg-white/90 p-4 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky bottom-4">
                        <div>
                            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.3em]", statusBadgeClass)}>
                                {isDirty ? 'Brouillon' : 'Synchronisé'}
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground mt-2" aria-live="polite">{statusMessage}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button type="button" variant="ghost" onClick={handleReset} disabled={!isDirty || isPending} className="rounded-2xl">
                                Annuler
                            </Button>
                            <Button type="submit" className="rounded-2xl h-12 px-6 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 font-black uppercase tracking-widest" disabled={isPending || !isDirty}>
                                {isPending ? 'Enregistrement...' : 'Mettre à jour'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

type BrandPreviewProps = {
    logoUrl?: string | null
    bannerUrl?: string | null
    primaryColor: string
}

function BrandPreview({ logoUrl, bannerUrl, primaryColor }: BrandPreviewProps) {
    return (
        <div className="rounded-[2rem] border bg-white overflow-hidden shadow-lg ring-1 ring-black/5">
            <div
                className="h-32 w-full bg-gradient-to-br from-orange-100 to-white relative"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
                {logoUrl ? (
                    <img src={logoUrl} alt="Aperçu logo" className="absolute left-6 top-6 h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md" />
                ) : (
                    <div className="absolute left-6 top-6 h-14 w-14 rounded-2xl border-2 border-white bg-white/70 flex items-center justify-center text-xs font-black text-muted-foreground">
                        LOGO
                    </div>
                )}
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground font-black">Passeport</p>
                    <h4 className="text-xl font-black">Le Bissap Club</h4>
                    <p className="text-sm text-muted-foreground">Découvrez nos soirées Afrobeats et plats signature.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-2xl border-2 border-white shadow-inner"
                        style={{ backgroundColor: primaryColor }}
                    />
                    <button
                        type="button"
                        className="rounded-full px-4 py-2 text-xs font-black tracking-[0.3em] text-white shadow-md"
                        style={{ backgroundColor: primaryColor }}
                    >
                        RÉSERVER
                    </button>
                </div>
            </div>
        </div>
    )
}

function FeatureToggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/10 border border-muted group hover:border-orange-200 transition-colors">
            <div className="flex-1 pr-4">
                <div className="text-sm font-black uppercase tracking-tight leading-none mb-1">{label}</div>
                <div className="text-[10px] font-bold text-muted-foreground leading-tight">{description}</div>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    checked ? "bg-orange-600" : "bg-slate-200"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    )
}
