'use client'

import { useActionState, useMemo, useState } from 'react'
import { createRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { ImageUpload } from '@/components/modules/menu/components/image-upload'

const formatSlug = (value: string) => value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const STEPS = [
    { id: 'welcome', title: 'Bienvenue', description: 'Promesse & démarrage en douceur' },
    { id: 'identity', title: 'Identité', description: 'Nom, slug, style de cuisine' },
    { id: 'contact', title: 'Contact & localisation', description: 'Téléphone, WhatsApp, adresse' },
    { id: 'hours', title: 'Horaires', description: 'Ouvertures simples ou détaillées' },
    { id: 'menu', title: 'Menu minimum', description: 'Catégorie + plat signature' },
    { id: 'design', title: 'Design & publication', description: 'Couleur, style et QR code' },
] as const

type StepId = typeof STEPS[number]['id']
type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const DAYS: { key: DayKey, label: string }[] = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
]

const CUISINE_TYPES = ['Ivoirienne', 'Africaine', 'Fast-food', 'Gastro', 'Café', 'Street-food']
const THEME_COLORS = ['#FF5C3C', '#FFB703', '#14B8A6', '#4338CA']
const THEME_STYLES: { id: 'minimal' | 'moderne' | 'premium', label: string, description: string }[] = [
    { id: 'minimal', label: 'Minimal', description: 'Sobriété et lisibilité' },
    { id: 'moderne', label: 'Moderne', description: 'Contrastes forts et badges' },
    { id: 'premium', label: 'Premium', description: 'Typo audacieuse et relief' },
]

type DaySchedule = { open: string, close: string, closed: boolean }

type Draft = {
    name: string
    slug: string
    description: string
    cuisineType: string
    logoUrl: string
    phone: string
    whatsapp: string
    city: string
    address: string
    mapsLink: string
    email: string
    currency: string
    hoursMode: 'simple' | 'advanced'
    simpleOpen: string
    simpleClose: string
    advancedHours: Record<DayKey, DaySchedule>
    isTemporarilyClosed: boolean
    primaryCategoryName: string
    primaryDishName: string
    primaryDishPrice: string
    primaryDishDescription: string
    themeColor: string
    themeStyle: 'minimal' | 'moderne' | 'premium'
    publishNow: boolean
}

const defaultAdvancedSchedule: Record<DayKey, DaySchedule> = DAYS.reduce((acc, day) => {
    acc[day.key] = { open: '08:00', close: '22:00', closed: day.key === 'sunday' }
    return acc
}, {} as Record<DayKey, DaySchedule>)

const initialDraft: Draft = {
    name: '',
    slug: '',
    description: '',
    cuisineType: '',
    logoUrl: '',
    phone: '',
    whatsapp: '',
    city: '',
    address: '',
    mapsLink: '',
    email: '',
    currency: 'FCFA',
    hoursMode: 'simple',
    simpleOpen: '08:00',
    simpleClose: '22:00',
    advancedHours: defaultAdvancedSchedule,
    isTemporarilyClosed: false,
    primaryCategoryName: 'Signature',
    primaryDishName: '',
    primaryDishPrice: '',
    primaryDishDescription: '',
    themeColor: THEME_COLORS[0],
    themeStyle: 'minimal',
    publishNow: true,
}

export function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(createRestaurant, { message: null, errors: {} })
    const [step, setStep] = useState(0)
    const [draft, setDraft] = useState<Draft>(initialDraft)
    const [slugEdited, setSlugEdited] = useState(false)

    const progress = (step / (STEPS.length - 1)) * 100

    const identityComplete = useMemo(() => Boolean(draft.name.trim() && draft.slug.trim()), [draft.name, draft.slug])
    const contactComplete = useMemo(() => Boolean(draft.phone.trim() && draft.whatsapp.trim()), [draft.phone, draft.whatsapp])
    const hoursComplete = useMemo(() => {
        if (draft.isTemporarilyClosed) return true
        if (draft.hoursMode === 'simple') {
            return Boolean(draft.simpleOpen && draft.simpleClose)
        }
        return DAYS.every(day => draft.advancedHours[day.key].closed || (draft.advancedHours[day.key].open && draft.advancedHours[day.key].close))
    }, [draft.isTemporarilyClosed, draft.hoursMode, draft.simpleOpen, draft.simpleClose, draft.advancedHours])
    const dishPriceNumber = Number(draft.primaryDishPrice)
    const menuComplete = useMemo(() => Boolean(draft.primaryCategoryName.trim() && draft.primaryDishName.trim() && !Number.isNaN(dishPriceNumber) && dishPriceNumber > 0), [draft.primaryCategoryName, draft.primaryDishName, dishPriceNumber])
    const designComplete = true

    const stepCompleted: Record<StepId, boolean> = {
        welcome: true,
        identity: identityComplete,
        contact: contactComplete,
        hours: hoursComplete,
        menu: menuComplete,
        design: identityComplete && contactComplete && menuComplete,
    }

    const reminders = useMemo(() => {
        const items: string[] = []
        if (!identityComplete) items.push('Complétez nom + slug. Vous pourrez changer plus tard.')
        if (!contactComplete) items.push('Ajoutez téléphone et WhatsApp pour rassurer vos clients.')
        if (!hoursComplete) items.push('Choisissez des horaires simples ou marquez le resto comme fermé.')
        if (!menuComplete) items.push('Un plat signature suffit pour publier votre menu.')
        if (items.length === 0) items.push('Tout est prêt ! Personnalisez votre menu puis publiez-le.')
        return items
    }, [identityComplete, contactComplete, hoursComplete, menuComplete])

    const handleNameChange = (value: string) => {
        setDraft(prev => ({ ...prev, name: value }))
        if (!slugEdited) {
            setDraft(prev => ({ ...prev, slug: formatSlug(value) }))
        }
    }

    const handleSlugChange = (value: string) => {
        setSlugEdited(true)
        setDraft(prev => ({ ...prev, slug: formatSlug(value) }))
    }

    const resetSlug = () => {
        setSlugEdited(false)
        setDraft(prev => ({ ...prev, slug: formatSlug(prev.name) }))
    }

    const copyPhoneToWhatsApp = () => setDraft(prev => ({ ...prev, whatsapp: prev.phone }))

    const updateAdvancedHour = (day: DayKey, field: keyof DaySchedule, value: string | boolean) => {
        setDraft(prev => ({
            ...prev,
            advancedHours: {
                ...prev.advancedHours,
                [day]: {
                    ...prev.advancedHours[day],
                    [field]: value,
                }
            }
        }))
    }

    const nextStep = () => {
        const currentStepId = STEPS[step].id
        if (!stepCompleted[currentStepId]) return
        setStep(s => Math.min(s + 1, STEPS.length - 1))
    }

    const prevStep = () => setStep(s => Math.max(s - 1, 0))

    const settingsPayload = useMemo(() => ({
        cuisine_type: draft.cuisineType,
        logo_url: draft.logoUrl,
        hours: {
            mode: draft.hoursMode,
            simple: { open: draft.simpleOpen, close: draft.simpleClose },
            advanced: draft.advancedHours,
            is_closed: draft.isTemporarilyClosed,
        },
        menu_seed: {
            category: draft.primaryCategoryName,
            dish: {
                name: draft.primaryDishName,
                price: draft.primaryDishPrice,
                description: draft.primaryDishDescription,
            }
        },
        design: {
            color: draft.themeColor,
            style: draft.themeStyle,
        },
        maps_link: draft.mapsLink,
        publish_now: draft.publishNow,
    }), [draft])

    const designPreview = useMemo(() => ({
        bg: draft.themeColor,
        styleLabel: THEME_STYLES.find(style => style.id === draft.themeStyle)?.label ?? 'Style',
    }), [draft.themeColor, draft.themeStyle])

    const renderStep = () => {
        switch (STEPS[step].id) {
            case 'welcome':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bienvenue sur Menlyla</CardTitle>
                                <CardDescription>Créez votre menu digital, partagez le QR code et recevez des commandes en moins de 5 minutes.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                                <div>
                                    <p className="font-semibold text-orange-600">📱 Mobile-first</p>
                                    <p className="mt-1">WhatsApp, appels et itinéraires intégrés automatiquement.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-orange-600">⚡ Gain de temps</p>
                                    <p className="mt-1">Un plat suffira pour publier. Vous pourrez compléter plus tard.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            case 'identity':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Nom du restaurant</Label>
                            <Input value={draft.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ex : Restaurant Ivoire Saveurs" />
                            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Identifiant URL (slug)</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input value={draft.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="ivoire-saveurs" className="flex-1" />
                                <Button type="button" variant="ghost" onClick={resetSlug}>Recalculer</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Lien public : menlyla.app/{draft.slug || 'votre-slug'}</p>
                            {state?.errors?.slug && <p className="text-sm text-destructive">{state.errors.slug}</p>}
                        </div>
                        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                            <div className="space-y-3">
                                <Label>Description courte</Label>
                                <Textarea value={draft.description} onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))} placeholder="Cuisine afro-chic, grillades, ambiance cosy…" rows={3} />
                                <Label>Type de cuisine</Label>
                                <select className="h-11 rounded-2xl border px-3" value={draft.cuisineType} onChange={(e) => setDraft(prev => ({ ...prev, cuisineType: e.target.value }))}>
                                    <option value="">Choisir…</option>
                                    {CUISINE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Logo (optionnel)</Label>
                                <ImageUpload
                                    id="onboarding-logo"
                                    label="Uploader"
                                    defaultImage={draft.logoUrl}
                                    onImageUploaded={(url: string) => setDraft(prev => ({ ...prev, logoUrl: url }))}
                                    onImageRemoved={() => setDraft(prev => ({ ...prev, logoUrl: '' }))}
                                />
                            </div>
                        </div>
                    </div>
                )
            case 'contact':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Téléphone principal</Label>
                                <Input value={draft.phone} onChange={(e) => setDraft(prev => ({ ...prev, phone: e.target.value }))} placeholder="Ex : +225 0700000000" />
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <div className="flex gap-2">
                                    <Input value={draft.whatsapp} onChange={(e) => setDraft(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="wa.me/2250700000000" className="flex-1" />
                                    <Button type="button" variant="outline" onClick={copyPhoneToWhatsApp}>Copier</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Utilisé pour le bouton WhatsApp du menu.</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Ville / quartier</Label>
                                <Input value={draft.city} onChange={(e) => setDraft(prev => ({ ...prev, city: e.target.value }))} placeholder="Abidjan, Cocody" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (optionnel)</Label>
                                <Input type="email" value={draft.email} onChange={(e) => setDraft(prev => ({ ...prev, email: e.target.value }))} placeholder="contact@restaurant.ci" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Textarea value={draft.address} onChange={(e) => setDraft(prev => ({ ...prev, address: e.target.value }))} placeholder="Rue, repère, précision" rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lien Google Maps (optionnel)</Label>
                            <Input value={draft.mapsLink} onChange={(e) => setDraft(prev => ({ ...prev, mapsLink: e.target.value }))} placeholder="https://maps.app.goo.gl/..." />
                        </div>
                    </div>
                )
            case 'hours':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-3 text-sm">
                            <button type="button" className={cn('rounded-full border px-4 py-2', draft.hoursMode === 'simple' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-muted')} onClick={() => setDraft(prev => ({ ...prev, hoursMode: 'simple' }))}>Horaires simples</button>
                            <button type="button" className={cn('rounded-full border px-4 py-2', draft.hoursMode === 'advanced' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-muted')} onClick={() => setDraft(prev => ({ ...prev, hoursMode: 'advanced' }))}>Horaires détaillés</button>
                        </div>
                        <label className="flex items-center gap-3 text-sm font-medium">
                            <input type="checkbox" checked={draft.isTemporarilyClosed} onChange={(e) => setDraft(prev => ({ ...prev, isTemporarilyClosed: e.target.checked }))} className="h-4 w-4" />
                            Restaurant fermé temporairement
                        </label>
                        {!draft.isTemporarilyClosed && draft.hoursMode === 'simple' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ouverture</Label>
                                    <Input type="time" value={draft.simpleOpen} onChange={(e) => setDraft(prev => ({ ...prev, simpleOpen: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fermeture</Label>
                                    <Input type="time" value={draft.simpleClose} onChange={(e) => setDraft(prev => ({ ...prev, simpleClose: e.target.value }))} />
                                </div>
                            </div>
                        )}
                        {!draft.isTemporarilyClosed && draft.hoursMode === 'advanced' && (
                            <div className="grid gap-3">
                                {DAYS.map(day => (
                                    <div key={day.key} className="flex flex-wrap items-center gap-3 rounded-2xl border px-3 py-2">
                                        <div className="w-24 text-sm font-semibold">{day.label}</div>
                                        <label className="flex items-center gap-2 text-xs font-medium">
                                            <input type="checkbox" checked={draft.advancedHours[day.key].closed} onChange={(e) => updateAdvancedHour(day.key, 'closed', e.target.checked)} /> Fermé
                                        </label>
                                        {!draft.advancedHours[day.key].closed && (
                                            <div className="flex flex-1 items-center gap-2 text-sm">
                                                <Input type="time" value={draft.advancedHours[day.key].open} onChange={(e) => updateAdvancedHour(day.key, 'open', e.target.value)} />
                                                <span>→</span>
                                                <Input type="time" value={draft.advancedHours[day.key].close} onChange={(e) => updateAdvancedHour(day.key, 'close', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case 'menu':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Catégorie</CardTitle>
                                <CardDescription>Suggérée : Entrées, Plats, Boissons, Desserts…</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input value={draft.primaryCategoryName} onChange={(e) => setDraft(prev => ({ ...prev, primaryCategoryName: e.target.value }))} placeholder="Signature" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Plat signature</CardTitle>
                                <CardDescription>Ajoutez juste un plat pour démarrer.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                                    <div className="space-y-2">
                                        <Label>Nom du plat</Label>
                                        <Input value={draft.primaryDishName} onChange={(e) => setDraft(prev => ({ ...prev, primaryDishName: e.target.value }))} placeholder="Poulet braisé royal" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prix ({draft.currency})</Label>
                                        <Input type="number" min="0" step="100" value={draft.primaryDishPrice} onChange={(e) => setDraft(prev => ({ ...prev, primaryDishPrice: e.target.value }))} placeholder="8000" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description (optionnel)</Label>
                                    <Textarea value={draft.primaryDishDescription} onChange={(e) => setDraft(prev => ({ ...prev, primaryDishDescription: e.target.value }))} placeholder="Servi avec attiéké et sauce maison." rows={3} />
                                </div>
                                <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
                                    <p className="font-semibold">Aperçu</p>
                                    <p className="mt-1">{draft.primaryDishName || 'Plat à définir'} — {draft.primaryDishPrice ? `${Number(draft.primaryDishPrice).toLocaleString()} ${draft.currency}` : 'Prix à définir'}</p>
                                    <p className="text-muted-foreground text-xs mt-1">{draft.primaryDishDescription || 'Ajoutez une phrase appétissante pour donner envie.'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            case 'design':
            default:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Couleur & style</CardTitle>
                                <CardDescription>Choisissez une ambiance, modifiable ensuite.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {THEME_COLORS.map(color => (
                                        <button key={color} type="button" onClick={() => setDraft(prev => ({ ...prev, themeColor: color }))} className={cn('h-10 w-10 rounded-full border-2', draft.themeColor === color ? 'border-black' : 'border-transparent')} style={{ backgroundColor: color }} aria-label={`Couleur ${color}`} />
                                    ))}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {THEME_STYLES.map(style => (
                                        <button key={style.id} type="button" onClick={() => setDraft(prev => ({ ...prev, themeStyle: style.id }))} className={cn('rounded-2xl border p-3 text-left', draft.themeStyle === style.id ? 'border-orange-500 bg-orange-50' : 'border-muted')}>
                                            <p className="font-semibold">{style.label}</p>
                                            <p className="text-xs text-muted-foreground">{style.description}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="rounded-2xl border bg-white p-4">
                                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Preview</p>
                                    <div className="mt-3 rounded-2xl p-4 text-white" style={{ backgroundColor: designPreview.bg }}>
                                        <p className="text-sm">{designPreview.styleLabel}</p>
                                        <p className="text-2xl font-black">{draft.name || 'Votre restaurant'}</p>
                                        <p className="text-sm opacity-80">{draft.primaryDishName || 'Plat signature'} — {draft.primaryDishPrice ? `${Number(draft.primaryDishPrice).toLocaleString()} ${draft.currency}` : 'Prix ?'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Résumé & publication</CardTitle>
                                <CardDescription>Vérifiez vos infos, puis publiez.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div>
                                    <p className="font-semibold">Identité</p>
                                    <p>{draft.name || 'Nom manquant'}</p>
                                    <p>menlyla.app/{draft.slug || 'votre-slug'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Contact</p>
                                    <p>Tel : {draft.phone || '—'} / WhatsApp : {draft.whatsapp || '—'}</p>
                                    <p>{draft.city && `Ville : ${draft.city}`}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Plat signature</p>
                                    <p>{draft.primaryDishName || '—'} ({draft.primaryCategoryName})</p>
                                </div>
                                <label className="mt-3 flex items-center gap-3 font-medium text-black">
                                    <input type="checkbox" checked={draft.publishNow} onChange={(e) => setDraft(prev => ({ ...prev, publishNow: e.target.checked }))} className="h-4 w-4" />
                                    Publier automatiquement et générer mon QR code
                                </label>
                                <p className="text-xs text-muted-foreground">Décochez pour enregistrer en brouillon et revenir plus tard.</p>
                            </CardContent>
                        </Card>
                    </div>
                )
        }
    }

    const canAccessStep = (index: number) => index <= step

    return (
        <Card className="w-full max-w-5xl mx-auto mt-10">
            <CardHeader className="pb-4">
                <CardTitle>Onboarding Menlyla</CardTitle>
                <CardDescription>Complétez chaque étape (max 4 champs obligatoires) et publiez.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-8">
                    <input type="hidden" name="name" value={draft.name} />
                    <input type="hidden" name="slug" value={draft.slug} />
                    <input type="hidden" name="description" value={draft.description} />
                    <input type="hidden" name="phone" value={draft.phone} />
                    <input type="hidden" name="whatsapp" value={draft.whatsapp} />
                    <input type="hidden" name="city" value={draft.city} />
                    <input type="hidden" name="address" value={draft.address} />
                    <input type="hidden" name="email" value={draft.email} />
                    <input type="hidden" name="logo_url" value={draft.logoUrl} />
                    <input type="hidden" name="cuisine_type" value={draft.cuisineType} />
                    <input type="hidden" name="maps_link" value={draft.mapsLink} />
                    <input type="hidden" name="settings" value={JSON.stringify(settingsPayload)} />

                    <Progress value={progress} className="h-2" />

                    <div className="space-y-6">
                        <div className="overflow-x-auto pb-2">
                            <div className="grid min-w-[900px] gap-4 md:grid-cols-6">
                                {STEPS.map((metadata, index) => {
                                    const isLocked = index > step
                                    const statusIcon = index < step
                                        ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        : index === step
                                            ? <Badge variant="secondary">En cours</Badge>
                                            : <Circle className="h-5 w-5 text-muted-foreground" />
                                    return (
                                        <button
                                            key={metadata.id}
                                            type="button"
                                            onClick={() => canAccessStep(index) && setStep(index)}
                                            className={cn(
                                                'rounded-3xl border px-4 py-3 text-left transition-colors flex flex-col gap-2',
                                                index === step ? 'border-orange-500 bg-orange-50' : 'border-muted bg-white',
                                                isLocked && 'cursor-not-allowed opacity-70'
                                            )}
                                            aria-disabled={!canAccessStep(index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Étape {index + 1}</p>
                                                    <p className="font-semibold text-sm">{metadata.title}</p>
                                                </div>
                                                {statusIcon}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{metadata.description}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-muted/20 p-4 space-y-2">
                            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Rappels</p>
                            <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                                {reminders.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            {renderStep()}

                            {state?.message && (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                    {state.message}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 justify-between pt-4 border-t">
                                <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>Précédent</Button>
                                {step < STEPS.length - 1 ? (
                                    <Button type="button" onClick={nextStep} disabled={!stepCompleted[STEPS[step].id]}>
                                        Continuer
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isPending || !stepCompleted.design}>
                                        {draft.publishNow ? 'Publier mon menu' : 'Enregistrer en brouillon'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
