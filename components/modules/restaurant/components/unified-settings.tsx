'use client'

import { useState, useActionState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { updateRestaurant } from '@/components/modules/restaurant/actions'
import type { RestaurantState } from '@/components/modules/restaurant/actions'
import { ImageUpload } from '@/components/modules/menu/components/image-upload'
import {
    Palette,
    User,
    Share2,
    Stamp,
    CalendarDays,
    Settings,
    UtensilsCrossed,
    Shield,
    BarChart3,
    Bell,
    CheckCircle2,
    Plus,
    Trash2,
    PlayCircle,
    ExternalLink,
    MessageSquare,
    Clock3
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MenuSettings } from './menu-settings'
import { LegalSettings } from './legal-settings'
import { AnalyticsSettings } from './analytics-settings'
import { NotificationsSettings } from './notifications-settings'
import { DemoDataSection } from '../../settings/components/demo-data-section'
import { PassportCard } from '@/components/modules/passport/passport-card'
import { ReviewModeration } from './review-moderation'
import { ReviewStats } from './review-stats'
import { PaymentGateways } from './payment-gateways'

const themePresets = [
    { color: '#0f172a', label: 'Ardoise' },
    { color: '#dc2626', label: 'Rouge' },
    { color: '#16a34a', label: 'Vert' },
    { color: '#2563eb', label: 'Bleu' },
    { color: '#ea580c', label: 'Orange' },
    { color: '#7c3aed', label: 'Violet' },
    { color: '#db2777', label: 'Rose' },
    { color: '#4b5563', label: 'Gris' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<typeof DAYS[number], string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
}

export function UnifiedSettings({ restaurant, initialProfile, initialReviews }: { restaurant: any, initialProfile: any, initialReviews?: any[] }) {
    const searchParams = useSearchParams()
    const activeSection = searchParams.get('section') || 'profile'

    // --- Restaurant State ---
    const [name, setName] = useState(restaurant.name)
    const [slug, setSlug] = useState(restaurant.slug)
    const [description, setDescription] = useState(restaurant.description)
    const [phone, setPhone] = useState(restaurant.phone)
    const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp || '')
    const [email, setEmail] = useState(restaurant.email)
    const [address, setAddress] = useState(restaurant.address)
    const [logoUrl, setLogoUrl] = useState(restaurant.settings?.logo_url || restaurant.logo_url)
    const [bannerUrl, setBannerUrl] = useState(restaurant.settings?.banner_url || restaurant.settings?.cover_image_url || restaurant.banner_url)
    const [socialLinks, setSocialLinks] = useState(restaurant.settings?.social_links || {})
    const [settings, setSettings] = useState(restaurant.settings || {})
    const [themeColor, setThemeColor] = useState(restaurant.settings?.primary_color || '#0f172a')
    const [secondaryColor, setSecondaryColor] = useState(restaurant.settings?.secondary_color || '#f8fafc')
    const [useGradient, setUseGradient] = useState(restaurant.settings?.use_gradient || false)

    const [profileCustomLinks, setProfileCustomLinks] = useState(initialProfile?.custom_links || [])

    const updateRestaurantWithId = updateRestaurant.bind(null, restaurant.id)
    const [state, formAction, isPending] = useActionState(updateRestaurantWithId, { success: false, errors: {} } as RestaurantState)

    // Dirty check logic (unfied)
    const isDirty = useMemo(() => {
        const restoDirty = name !== restaurant.name ||
            slug !== restaurant.slug ||
            description !== restaurant.description ||
            phone !== restaurant.phone ||
            email !== (restaurant.email || '') ||
            address !== restaurant.address ||
            whatsapp !== (restaurant.whatsapp || '') ||
            logoUrl !== restaurant.settings?.logo_url ||
            bannerUrl !== restaurant.settings?.cover_image_url ||
            themeColor !== (restaurant.settings?.primary_color || '#0f172a') ||
            secondaryColor !== (restaurant.settings?.secondary_color || '#f8fafc') ||
            useGradient !== (restaurant.settings?.use_gradient || false) ||
            JSON.stringify(socialLinks) !== JSON.stringify(restaurant.settings?.social_links || {}) ||
            JSON.stringify(settings) !== JSON.stringify(restaurant.settings || {}) ||
            JSON.stringify(profileCustomLinks) !== JSON.stringify(initialProfile?.custom_links || [])

        return restoDirty
    }, [name, slug, description, phone, email, address, logoUrl, bannerUrl, themeColor, secondaryColor, useGradient, socialLinks, settings, restaurant, profileCustomLinks, initialProfile, whatsapp])

    useEffect(() => {
        if (state.success) {
            toast.success('Paramètres enregistrés avec succès')
        } else if (state.message && !state.success) {
            toast.error(state.message)
        }
    }, [state])

    const handleThemeChange = (color: string, type: 'primaryColor' | 'secondaryColor') => {
        if (type === 'primaryColor') {
            setThemeColor(color)
            setSettings({ ...settings, primary_color: color })
        } else {
            setSecondaryColor(color)
            setSettings({ ...settings, secondary_color: color })
        }
    }

    const toggleGradient = (val: boolean) => {
        setUseGradient(val)
        setSettings({ ...settings, use_gradient: val })
    }

    const handleReset = () => {
        setName(restaurant.name)
        setSlug(restaurant.slug)
        setDescription(restaurant.description)
        setPhone(restaurant.phone)
        setWhatsapp(restaurant.whatsapp || '')
        setEmail(restaurant.email || '')
        setAddress(restaurant.address)
        setLogoUrl(restaurant.settings?.logo_url)
        setBannerUrl(restaurant.settings?.cover_image_url)
        setSocialLinks(restaurant.settings?.social_links || {})
        setSettings(restaurant.settings || {})
        setThemeColor(restaurant.settings?.primary_color || '#0f172a')
        setSecondaryColor(restaurant.settings?.secondary_color || '#f8fafc')
        setUseGradient(restaurant.settings?.use_gradient || false)
        setProfileCustomLinks(initialProfile?.custom_links || [])
    }

    const isExternalView = ['menu', 'legal', 'analytics', 'notifications', 'demo', 'reviews'].includes(activeSection)

    return (
        <div className="flex flex-col min-h-[80vh]">
            <main className="flex-1 w-full max-w-5xl mx-auto pb-20 pt-4">
                {activeSection === 'menu' && <MenuSettings restaurant={restaurant} />}
                {activeSection === 'legal' && <LegalSettings restaurant={restaurant} />}
                {activeSection === 'analytics' && <AnalyticsSettings restaurant={restaurant} />}
                {activeSection === 'notifications' && <NotificationsSettings restaurant={restaurant} settings={settings} setSettings={setSettings} />}
                {activeSection === 'demo' && <DemoDataSection />}
                {activeSection === 'reviews' && initialReviews && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ReviewStats reviews={initialReviews} />
                        <ReviewModeration initialReviews={initialReviews} />
                    </div>
                )}

                {!isExternalView && (
                    <div className="space-y-6">
                        <form action={formAction} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input type="hidden" name="id" value={restaurant.id} />
                            <input type="hidden" name="name" value={name || ''} />
                            <input type="hidden" name="slug" value={slug || ''} />
                            <input type="hidden" name="description" value={description || ''} />
                            <input type="hidden" name="phone" value={phone || ''} />
                            <input type="hidden" name="whatsapp" value={whatsapp || ''} />
                            <input type="hidden" name="email" value={email || ''} />
                            <input type="hidden" name="address" value={address || ''} />
                            <input type="hidden" name="logo_url" value={logoUrl || ''} />
                            <input type="hidden" name="banner_url" value={bannerUrl || ''} />
                            <input type="hidden" name="social_links" value={JSON.stringify(socialLinks)} />
                            <input type="hidden" name="settings" value={JSON.stringify(settings)} />

                            {/* Passport specifics - now pointing to consolidated restaurant fields where possible */}
                            <input type="hidden" name="profile_username" value={slug || ''} />
                            <input type="hidden" name="profile_full_name" value={name || ''} />
                            <input type="hidden" name="profile_bio" value={description || ''} />
                            <input type="hidden" name="profile_phone" value={phone || ''} />
                            <input type="hidden" name="profile_email" value={email || ''} />
                            <input type="hidden" name="profile_image" value={logoUrl || ''} />
                            <input type="hidden" name="profile_social_links" value={JSON.stringify({ ...socialLinks, whatsapp })} />
                            <input type="hidden" name="profile_custom_links" value={JSON.stringify(profileCustomLinks)} />

                            {activeSection === 'profile' && (
                                <div className="space-y-12">
                                    <div className="grid lg:grid-cols-5 gap-8">
                                        <div className="lg:col-span-3 space-y-6">
                                            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                                <CardHeader className="bg-slate-50/50 pb-8">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle>Profil & Identité Digitale</CardTitle>
                                                            <CardDescription>Configurez comment votre établissement et votre Passport apparaissent.</CardDescription>
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
                                                                <Label>Téléphone Professionnel</Label>
                                                                <Input value={phone || ''} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl" placeholder="+225 ..." />
                                                                {state.errors?.phone && <p className="text-red-500 text-xs font-medium">{state.errors.phone[0]}</p>}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Email Professionnel</Label>
                                                                <Input value={email || ''} onChange={e => setEmail(e.target.value)} className="h-11 rounded-xl" placeholder="contact@..." />
                                                                {state.errors?.email && <p className="text-red-500 text-xs font-medium">{state.errors.email[0]}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Adresse Physique</Label>
                                                            <Textarea value={address || ''} onChange={e => setAddress(e.target.value)} placeholder="Rue, Quartier, Ville" className="rounded-xl" />
                                                        </div>

                                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Réseaux Sociaux & Contact Direct</Label>
                                                            </div>
                                                            <div className="grid sm:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px] flex items-center gap-2">
                                                                        <MessageSquare className="h-3 w-3 text-green-500" /> WhatsApp (Lien ou Numéro)
                                                                    </Label>
                                                                    <Input
                                                                        value={whatsapp}
                                                                        onChange={(e) => setWhatsapp(e.target.value)}
                                                                        placeholder="wa.me/225..."
                                                                        className="h-11 rounded-xl text-xs"
                                                                    />
                                                                </div>

                                                                {['instagram', 'facebook', 'tiktok'].map(platform => (
                                                                    <div key={platform} className="space-y-1">
                                                                        <Label className="capitalize text-[10px] flex items-center gap-2">
                                                                            {platform === 'instagram' && <Palette className="h-3 w-3 text-pink-500" />}
                                                                            {platform === 'facebook' && <ExternalLink className="h-3 w-3 text-blue-600" />}
                                                                            {platform === 'tiktok' && <PlayCircle className="h-3 w-3 text-black" />}
                                                                            {platform}
                                                                        </Label>
                                                                        <Input
                                                                            value={socialLinks[platform] || ''}
                                                                            onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                                                                            placeholder={`Lien ${platform}`}
                                                                            className="h-11 rounded-xl text-xs"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="pt-4 flex flex-wrap gap-2">
                                                                {Object.keys(socialLinks).filter(p => !['instagram', 'facebook', 'tiktok', 'whatsapp'].includes(p)).map(platform => (
                                                                    <div key={platform} className="flex gap-2 items-center animate-in slide-in-from-left-2 fade-in duration-300 w-full">
                                                                        <div className="flex-1 space-y-1">
                                                                            <Label className="capitalize text-[10px]">{platform}</Label>
                                                                            <Input
                                                                                value={socialLinks[platform]}
                                                                                onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                                                                                placeholder={`Lien ${platform}`}
                                                                                className="h-10 rounded-xl text-xs"
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="mt-5 h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl"
                                                                            onClick={() => {
                                                                                const next = { ...socialLinks };
                                                                                delete next[platform];
                                                                                setSocialLinks(next);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}

                                                                <select
                                                                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                    onChange={(e) => {
                                                                        const platform = e.target.value;
                                                                        if (platform && !socialLinks[platform]) {
                                                                            setSocialLinks({ ...socialLinks, [platform]: '' });
                                                                        }
                                                                        e.target.value = '';
                                                                    }}
                                                                >
                                                                    <option value="">+ Autre réseau</option>
                                                                    <option value="twitter">X (Twitter)</option>
                                                                    <option value="linkedin">LinkedIn</option>
                                                                    <option value="snapchat">Snapchat</option>
                                                                    <option value="youtube">YouTube</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Liens Personnalisés (Passport)</Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setProfileCustomLinks([...profileCustomLinks, { label: '', url: '' }])}
                                                                    className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700"
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Ajouter
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {profileCustomLinks.map((link: any, idx: number) => (
                                                                    <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-bottom-2 fade-in">
                                                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                                                            <Input
                                                                                value={link.label}
                                                                                onChange={e => {
                                                                                    const next = [...profileCustomLinks];
                                                                                    next[idx].label = e.target.value;
                                                                                    setProfileCustomLinks(next);
                                                                                }}
                                                                                placeholder="Label"
                                                                                className="h-10 rounded-xl text-xs"
                                                                            />
                                                                            <Input
                                                                                value={link.url}
                                                                                onChange={e => {
                                                                                    const next = [...profileCustomLinks];
                                                                                    next[idx].url = e.target.value;
                                                                                    setProfileCustomLinks(next);
                                                                                }}
                                                                                placeholder="URL"
                                                                                className="h-10 rounded-xl text-xs"
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => setProfileCustomLinks(profileCustomLinks.filter((_: any, i: number) => i !== idx))}
                                                                            className="h-10 w-10 text-slate-300 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="sticky top-24 space-y-4">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Aperçu Passport</span>
                                                <PassportCard
                                                    profileImage={logoUrl}
                                                    fullName={name || 'Votre Établissement'}
                                                    bio={description || 'Description de votre restaurant...'}
                                                    socialLinks={{ ...socialLinks, whatsapp }}
                                                    customLinks={profileCustomLinks}
                                                    phone={phone}
                                                    email={email}
                                                    reviews={initialReviews?.filter((r: any) => r.status === 'approved')}
                                                    bannerImage={bannerUrl}
                                                />
                                                {slug && (
                                                    <Button type="button" variant="outline" className="w-full rounded-2xl" asChild>
                                                        <a href={`/passport/${slug}`} target="_blank">
                                                            <ExternalLink className="h-4 w-4 mr-2" /> Voir ma page publique
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-base font-bold">Identité Visuelle</Label>
                                                    <p className="text-xs text-muted-foreground mt-1">Personnalisez les couleurs de votre interface client.</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGradient(false)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                                            !useGradient ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                                        )}
                                                    >
                                                        Couleur Unie
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGradient(true)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                                            useGradient ? "bg-white shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600" : "text-slate-500 hover:text-slate-700"
                                                        )}
                                                    >
                                                        Dégradé
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid lg:grid-cols-2 gap-12 items-start">
                                                <div className="space-y-8">
                                                    {/* COLOR PICKERS CONTAINER */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <Label className="mb-3 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                                {useGradient ? 'Couleur de départ (Gauche/Haut)' : 'Couleur Principale'}
                                                            </Label>
                                                            <div className="flex gap-3 flex-wrap">
                                                                {themePresets.map(t => (
                                                                    <button key={t.color} type="button" onClick={() => handleThemeChange(t.color, 'primaryColor')}
                                                                        className={cn(
                                                                            "h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                                                                            themeColor === t.color ? "border-slate-900 scale-110 shadow-md ring-2 ring-offset-2 ring-slate-200" : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: t.color }}
                                                                        title={t.label}
                                                                    />
                                                                ))}
                                                                <div className="relative group">
                                                                    <input
                                                                        type="color"
                                                                        value={themeColor}
                                                                        onChange={e => handleThemeChange(e.target.value, 'primaryColor')}
                                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                                                    />
                                                                    <button type="button" className={cn(
                                                                        "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-white overflow-hidden",
                                                                        !themePresets.some(t => t.color === themeColor) ? "border-slate-900 scale-110 shadow-md ring-2 ring-offset-2 ring-slate-200" : "border-slate-200 group-hover:border-slate-300"
                                                                    )}>
                                                                        <div className="absolute inset-0" style={{ backgroundColor: themeColor }} />
                                                                        <Plus className={cn("h-4 w-4 relative z-10", !themePresets.some(t => t.color === themeColor) ? "text-white mix-blend-difference" : "text-slate-400")} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Input
                                                                        value={themeColor}
                                                                        onChange={e => handleThemeChange(e.target.value, 'primaryColor')}
                                                                        className="w-24 h-10 rounded-xl font-mono text-xs uppercase tracking-wider"
                                                                        placeholder="#000000"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {useGradient && (
                                                            <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                                                                <Label className="mb-3 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                                    Couleur de fin (Droite/Bas)
                                                                </Label>
                                                                <div className="flex gap-3 flex-wrap">
                                                                    {themePresets.map(t => (
                                                                        <button key={`sec-${t.color}`} type="button" onClick={() => handleThemeChange(t.color, 'secondaryColor')}
                                                                            className={cn(
                                                                                "h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                                                                                secondaryColor === t.color ? "border-slate-900 scale-110 shadow-md ring-2 ring-offset-2 ring-slate-200" : "border-transparent"
                                                                            )}
                                                                            style={{ backgroundColor: t.color }}
                                                                            title={t.label}
                                                                        />
                                                                    ))}
                                                                    <div className="relative group">
                                                                        <input
                                                                            type="color"
                                                                            value={secondaryColor}
                                                                            onChange={e => handleThemeChange(e.target.value, 'secondaryColor')}
                                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                                                        />
                                                                        <button type="button" className={cn(
                                                                            "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-white overflow-hidden",
                                                                            !themePresets.some(t => t.color === secondaryColor) ? "border-slate-900 scale-110 shadow-md ring-2 ring-offset-2 ring-slate-200" : "border-slate-200 group-hover:border-slate-300"
                                                                        )}>
                                                                            <div className="absolute inset-0" style={{ backgroundColor: secondaryColor }} />
                                                                            <Plus className={cn("h-4 w-4 relative z-10", !themePresets.some(t => t.color === secondaryColor) ? "text-white mix-blend-difference" : "text-slate-400")} />
                                                                        </button>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Input
                                                                            value={secondaryColor}
                                                                            onChange={e => handleThemeChange(e.target.value, 'secondaryColor')}
                                                                            className="w-24 h-10 rounded-xl font-mono text-xs uppercase tracking-wider"
                                                                            placeholder="#000000"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aperçu en direct</Label>
                                                    <BrandPreview
                                                        logoUrl={logoUrl}
                                                        bannerUrl={bannerUrl}
                                                        primaryColor={themeColor}
                                                        secondaryColor={secondaryColor}
                                                        useGradient={useGradient}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}



                            {activeSection === 'hours' && (
                                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 pb-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-black">Horaires d&apos;ouverture</CardTitle>
                                                <CardDescription>Configurez vos plages d&apos;ouverture habituelles.</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                                                <Clock3 className="h-3.5 w-3.5 text-orange-600" />
                                                <span className="text-xs font-bold text-orange-700">Fuseau : GMT</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-8 space-y-8">
                                        <div className="p-4 rounded-3xl border bg-slate-50/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base font-bold">Fermeture temporaire</Label>
                                                    <p className="text-xs text-muted-foreground">Activez cette option si vous partez en congés ou faites des travaux.</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_on_break"
                                                        className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                                                        checked={settings.hours?.is_on_break || false}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            hours: { ...(settings.hours || {}), is_on_break: e.target.checked }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {!(settings.hours?.is_on_break) && (
                                            <div className="space-y-4">
                                                {DAYS.map(day => {
                                                    const daySchedule = settings.hours?.schedule?.[day] || { open: '09:00', close: '22:00', closed: false }
                                                    return (
                                                        <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:border-orange-100/50 hover:shadow-md">
                                                            <div className="flex items-center gap-3 w-32">
                                                                <div className={cn("h-2 w-2 rounded-full", daySchedule.closed ? "bg-slate-200" : "bg-green-400")} />
                                                                <span className="font-bold capitalize text-slate-700">{DAY_LABELS[day]}</span>
                                                            </div>

                                                            <div className="flex-1 flex items-center justify-end gap-3">
                                                                {daySchedule.closed ? (
                                                                    <span className="text-sm font-medium text-slate-400 italic px-4">Fermé toute la journée</span>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border">
                                                                        <Input
                                                                            type="time"
                                                                            value={daySchedule.open}
                                                                            onChange={(e) => {
                                                                                const currentSchedule = settings.hours?.schedule || {}
                                                                                setSettings({
                                                                                    ...settings,
                                                                                    hours: {
                                                                                        ...(settings.hours || {}),
                                                                                        schedule: {
                                                                                            ...currentSchedule,
                                                                                            [day]: { ...daySchedule, open: e.target.value }
                                                                                        }
                                                                                    }
                                                                                })
                                                                            }}
                                                                            className="h-9 w-24 border-none bg-transparent text-center font-semibold focus-visible:ring-0 px-0"
                                                                        />
                                                                        <span className="text-slate-300 font-light">|</span>
                                                                        <Input
                                                                            type="time"
                                                                            value={daySchedule.close}
                                                                            onChange={(e) => {
                                                                                const currentSchedule = settings.hours?.schedule || {}
                                                                                setSettings({
                                                                                    ...settings,
                                                                                    hours: {
                                                                                        ...(settings.hours || {}),
                                                                                        schedule: {
                                                                                            ...currentSchedule,
                                                                                            [day]: { ...daySchedule, close: e.target.value }
                                                                                        }
                                                                                    }
                                                                                })
                                                                            }}
                                                                            className="h-9 w-24 border-none bg-transparent text-center font-semibold focus-visible:ring-0 px-0"
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="h-6 w-px bg-slate-100 mx-1" />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const closed = !daySchedule.closed
                                                                        const currentSchedule = settings.hours?.schedule || {}
                                                                        setSettings({
                                                                            ...settings,
                                                                            hours: {
                                                                                ...(settings.hours || {}),
                                                                                schedule: {
                                                                                    ...currentSchedule,
                                                                                    [day]: { ...daySchedule, closed }
                                                                                }
                                                                            }
                                                                        })
                                                                    }}
                                                                    className={cn(
                                                                        "h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
                                                                        daySchedule.closed
                                                                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                                    )}
                                                                    title={daySchedule.closed ? "Ouvrir ce jour" : "Fermer ce jour"}
                                                                >
                                                                    {daySchedule.closed ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'passport' && (
                                <div className="space-y-12">
                                    <div className="pt-12 italic text-slate-400">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-px bg-slate-200 flex-1" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Configuration Fidélité (Prochainement)</span>
                                            <div className="h-px bg-slate-200 flex-1" />
                                        </div>
                                    </div>

                                    <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden mb-12">
                                        <CardHeader className="bg-slate-50/50 pb-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Stamp className="h-5 w-5 text-orange-600" />
                                                        Fidélité & Passport
                                                    </CardTitle>
                                                    <CardDescription>Configuration du système de points et du scan client.</CardDescription>
                                                </div>
                                                <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Bientôt</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-8 pt-6 opacity-40 pointer-events-none grayscale">
                                            <div className="grid gap-8">
                                                <FeatureToggle
                                                    label="Activer le système de points"
                                                    description="Permet aux clients de cumuler des points à chaque scan ou commande."
                                                    checked={settings.points_enabled}
                                                    onChange={(val) => setSettings({ ...settings, points_enabled: val })}
                                                />
                                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                                    <div className="grid sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label>Ratio de points</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    value={settings.points_ratio || 1}
                                                                    onChange={(e) => setSettings({ ...settings, points_ratio: parseInt(e.target.value) })}
                                                                    className="h-11 rounded-xl"
                                                                />
                                                                <span className="text-xs text-muted-foreground font-medium">pts / 1,000 FCFA</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Bonus de premier scan</Label>
                                                            <Input
                                                                type="number"
                                                                value={settings.welcome_points || 0}
                                                                onChange={(e) => setSettings({ ...settings, welcome_points: parseInt(e.target.value) })}
                                                                className="h-11 rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                        <CardHeader className="bg-slate-50/50">
                                            <CardTitle>Moyens de Paiement Acceptés</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {[
                                                    { id: 'wave', label: 'Wave' },
                                                    { id: 'orange_money', label: 'Orange Money' },
                                                    { id: 'mtn_momo', label: 'MTN MoMo' },
                                                    { id: 'moov_money', label: 'Moov Money' },
                                                    { id: 'visa_mastercard', label: 'Carte Bancaire' },
                                                    { id: 'cash', label: 'Espèces' }
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
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeSection === 'events' && (
                                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                                        <CardTitle>Événements</CardTitle>
                                        <Button type="button" size="sm" onClick={() => setSettings((s: any) => ({ ...s, events: [...(s.events || []), { id: Math.random().toString(36).substring(2, 9), title: 'Nouvel Événement', description: '', date: '', image_url: '' }] }))}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
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
                                                        onClick={() => setSettings((s: any) => ({ ...s, events: s.events.filter((e: any) => e.id !== ev.id) }))}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-4">
                                                    <Input
                                                        value={ev.title}
                                                        onChange={(e) => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].title = e.target.value;
                                                            setSettings({ ...settings, events: newEvents });
                                                        }}
                                                        placeholder="Titre de l'événement"
                                                        className="h-11 rounded-xl bg-white"
                                                    />
                                                    <Textarea
                                                        value={ev.description}
                                                        onChange={(e) => {
                                                            const newEvents = [...settings.events];
                                                            newEvents[idx].description = e.target.value;
                                                            setSettings({ ...settings, events: newEvents });
                                                        }}
                                                        placeholder="Description"
                                                        className="rounded-xl bg-white"
                                                    />
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <Input
                                                            type="date"
                                                            value={ev.date}
                                                            onChange={(e) => {
                                                                const newEvents = [...settings.events];
                                                                newEvents[idx].date = e.target.value;
                                                                setSettings({ ...settings, events: newEvents });
                                                            }}
                                                            className="h-11 rounded-xl bg-white text-xs"
                                                        />
                                                        <ImageUpload
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

                            {activeSection === 'payments' && (
                                <PaymentGateways settings={settings} setSettings={setSettings} />
                            )}

                            <div className="sticky bottom-8 z-50 flex items-center justify-between p-2 pl-6 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 text-white shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto ring-1 ring-black/5">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        isDirty ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                    )} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                        {isDirty ? 'Changements à sauver' : 'Synchronisé'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isDirty && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleReset}
                                            className="h-11 px-5 text-white hover:text-white hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Annuler
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isPending || !isDirty}
                                        className={cn(
                                            "h-11 px-8 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95 border-none",
                                            isDirty
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-500/40 hover:-translate-y-0.5"
                                                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        {isPending ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Sauvegarde...</span>
                                            </div>
                                        ) : (
                                            'Enregistrer'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    )
}

function FeatureToggle({ label, description, checked, onChange, compact, disabled }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void, compact?: boolean, disabled?: boolean }) {
    if (compact) {
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    checked ? "bg-slate-900" : "bg-slate-200",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span className={cn("block h-4 w-4 rounded-full bg-white shadow transform transition-transform ml-0.5 mt-0.5", checked ? "translate-x-4" : "translate-x-0")} />
            </button>
        )
    }
    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-colors bg-white",
            disabled ? "opacity-60 border-slate-100" : "hover:border-orange-200"
        )}>
            <div className="space-y-1">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    checked ? "bg-orange-600" : "bg-slate-200",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
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
