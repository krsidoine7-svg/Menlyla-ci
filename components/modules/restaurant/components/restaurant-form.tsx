'use client'

import { useActionState, useMemo, useState, useEffect } from 'react'
import { createRestaurant, initiateOnboardingPayment } from '@/components/modules/restaurant/actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, CreditCard } from 'lucide-react'
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
    { id: 'persona', title: 'Personnage', description: 'Votre carte de visite (optionnel)' },
    { id: 'hours', title: 'Horaires', description: 'Ouvertures simples ou détaillées' },
    { id: 'tables', title: 'Tables', description: 'Générez vos codes QR (optionnel)' },
    { id: 'menu', title: 'Menu minimum', description: 'Catégorie + premier plat' },
    { id: 'design', title: 'Design & publication', description: 'Couleur, style et QR code' },
    { id: 'billing', title: 'Forfait', description: 'Choisissez votre offre' },
    { id: 'payment', title: 'Paiement', description: 'Activation de votre compte' },
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

const COUNTRY_CODES = [
    { code: '225', label: '🇨🇮 +225', country: 'Côte d\'Ivoire' },
    { code: '221', label: '🇸🇳 +221', country: 'Sénégal' },
    { code: '223', label: '🇲🇱 +223', country: 'Mali' },
    { code: '226', label: '🇧🇫 +226', country: 'Burkina Faso' },
    { code: '229', label: '🇧🇯 +229', country: 'Bénin' },
    { code: '228', label: '🇹🇬 +228', country: 'Togo' },
    { code: '224', label: '🇬🇳 +224', country: 'Guinée' },
    { code: '237', label: '🇨🇲 +237', country: 'Cameroun' },
    { code: '33', label: '🇫🇷 +33', country: 'France' },
]

type Draft = {
    name: string
    slug: string
    description: string
    cuisineType: string
    logoUrl: string
    bannerUrl: string
    phone: string
    whatsapp: string
    whatsappCountryCode: string
    whatsappNumber: string
    city: string
    address: string
    mapsLink: string
    email: string
    currency: string
    tableCount: number
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
    createPersona: boolean
    personaName: string
    personaUsername: string
    personaBio: string
    personaImage: string
    plan: 'solo' | 'pro'
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
    bannerUrl: '',
    phone: '',
    whatsapp: '',
    whatsappCountryCode: '225',
    whatsappNumber: '',
    city: '',
    address: '',
    mapsLink: '',
    email: '',
    currency: 'FCFA',
    tableCount: 0,
    hoursMode: 'simple',
    simpleOpen: '08:00',
    simpleClose: '22:00',
    advancedHours: defaultAdvancedSchedule,
    isTemporarilyClosed: false,
    primaryCategoryName: '',
    primaryDishName: '',
    primaryDishPrice: '',
    primaryDishDescription: '',
    themeColor: THEME_COLORS[0],
    themeStyle: 'minimal',
    publishNow: true,
    createPersona: false,
    personaName: '',
    personaUsername: '',
    personaBio: '',
    personaImage: '',
    plan: 'solo',
}


interface OnboardingFormProps {
    initialRestaurant?: any
}

export function OnboardingForm({ initialRestaurant }: OnboardingFormProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlPlan = searchParams.get('plan') as 'pro' | 'solo' | null
    const hasPaidParam = searchParams.get('paid') === 'true'

    const [state, formAction, isPending] = useActionState(createRestaurant, { message: null, errors: {} })
    const [step, setStep] = useState(0)
    const [draft, setDraft] = useState<Draft>(() => {
        if (initialRestaurant) {
            const rawWhatsapp = initialRestaurant.whatsapp || ''
            // Try to extract country code from the start of the string
            const foundCode = COUNTRY_CODES.find(c => rawWhatsapp.startsWith(c.code))
            const countryCode = foundCode?.code || '225'
            const numberOnly = rawWhatsapp.startsWith(countryCode) ? rawWhatsapp.substring(countryCode.length) : rawWhatsapp

            return {
                ...initialDraft,
                name: initialRestaurant.name === 'Mon Restaurant' ? '' : initialRestaurant.name,
                slug: initialRestaurant.slug.startsWith('temp-') ? '' : initialRestaurant.slug,
                description: initialRestaurant.description || '',
                phone: initialRestaurant.phone || '',
                whatsapp: rawWhatsapp,
                whatsappCountryCode: countryCode,
                whatsappNumber: numberOnly,
                address: initialRestaurant.address || '',
                city: initialRestaurant.city || '',
                plan: initialRestaurant.plan || (urlPlan || 'solo'),
            }
        }
        return { ...initialDraft, plan: urlPlan || 'solo' }
    })

    const [slugEdited, setSlugEdited] = useState(false)

    useEffect(() => {
        if (urlPlan && draft.plan !== urlPlan) {
            setDraft(prev => ({ ...prev, plan: urlPlan }))
        }
    }, [urlPlan])

    useEffect(() => {
        if (hasPaidParam && step === 0) {
            setStep(1)
        }
    }, [hasPaidParam])

    // Pro flow: if they chose PRO but haven't paid, we'll suggest it in the welcome step
    const [isRedirecting, setIsRedirecting] = useState(false)


    const currentSteps = useMemo(() => {
        // Both plans skip these steps at the end now.
        // PRO pays at start. SOLO bypassing for now.
        return STEPS.filter(s => s.id !== 'billing' && s.id !== 'payment')
    }, [])

    const progress = (step / (currentSteps.length - 1)) * 100

    const identityComplete = useMemo(() => Boolean(draft.name.trim() && draft.slug.trim()), [draft.name, draft.slug])
    const contactComplete = useMemo(() => {
        const basics = Boolean(draft.phone.trim() && draft.whatsappNumber.trim())
        const validMaps = !draft.mapsLink || /^(https?:\/\/)/.test(draft.mapsLink)
        return basics && validMaps
    }, [draft.phone, draft.whatsappNumber, draft.mapsLink])

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
        persona: true, // Optional step
        hours: hoursComplete,
        tables: true,
        menu: menuComplete,
        design: identityComplete && contactComplete && menuComplete,
        billing: identityComplete && contactComplete && menuComplete,
        payment: identityComplete && contactComplete && menuComplete,
    }



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

    const handleWhatsappNumberChange = (num: string) => {
        const clean = num.replace(/\D/g, '')
        setDraft(prev => ({ 
            ...prev, 
            whatsappNumber: clean,
            whatsapp: prev.whatsappCountryCode + clean
        }))
    }

    const handleWhatsappCountryChange = (code: string) => {
        setDraft(prev => ({ 
            ...prev, 
            whatsappCountryCode: code,
            whatsapp: code + prev.whatsappNumber
        }))
    }

    const copyPhoneToWhatsApp = () => {
        // Try to clean potential country code if present at the start of phone
        let phoneNum = draft.phone.replace(/\D/g, '')
        if (phoneNum.startsWith(draft.whatsappCountryCode)) {
            phoneNum = phoneNum.substring(draft.whatsappCountryCode.length)
        }
        handleWhatsappNumberChange(phoneNum)
    }

    const handlePersonaNameChange = (name: string) => {
        setDraft(prev => ({
            ...prev,
            personaName: name,
            personaUsername: prev.personaUsername || formatSlug(name)
        }))
    }

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
        const currentStepId = currentSteps[step].id
        if (!stepCompleted[currentStepId]) return
        setStep(s => Math.min(s + 1, currentSteps.length - 1))
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
        plan: draft.plan,
    }), [draft])

    const designPreview = useMemo(() => ({
        bg: draft.themeColor,
        styleLabel: THEME_STYLES.find(style => style.id === draft.themeStyle)?.label ?? 'Style',
    }), [draft.themeColor, draft.themeStyle])

    const renderStep = () => {

        switch (currentSteps[step].id as StepId) {
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
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Logo (optionnel)</Label>
                                    <ImageUpload
                                        id="onboarding-logo"
                                        label="Uploader Logo"
                                        defaultImage={draft.logoUrl}
                                        onImageUploaded={(url: string) => setDraft(prev => ({ ...prev, logoUrl: url }))}
                                        onImageRemoved={() => setDraft(prev => ({ ...prev, logoUrl: '' }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bannière / Couverture</Label>
                                    <ImageUpload
                                        id="onboarding-banner"
                                        label="Uploader Bannière"
                                        defaultImage={draft.bannerUrl}
                                        onImageUploaded={(url: string) => setDraft(prev => ({ ...prev, bannerUrl: url }))}
                                        onImageRemoved={() => setDraft(prev => ({ ...prev, bannerUrl: '' }))}
                                    />
                                </div>
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
                                <Label>Compte WhatsApp Business</Label>
                                <div className="flex gap-2">
                                    <div className="relative w-32 shrink-0">
                                        <select
                                            value={draft.whatsappCountryCode}
                                            onChange={(e) => handleWhatsappCountryChange(e.target.value)}
                                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm font-bold focus:ring-2 focus:ring-orange-500 appearance-none"
                                        >
                                            {COUNTRY_CODES.map(c => (
                                                <option key={c.code} value={c.code}>{c.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            value={draft.whatsappNumber}
                                            onChange={(e) => handleWhatsappNumberChange(e.target.value)}
                                            placeholder="Ex: 0708091011"
                                            className="flex-1 rounded-xl font-bold"
                                        />
                                        <Button type="button" variant="outline" onClick={copyPhoneToWhatsApp} className="rounded-xl border-slate-200 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                            Copier
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                    💡 Le lien WhatsApp sera : <span className="text-orange-600 font-bold tracking-tight">wa.me/{draft.whatsapp || '...'}</span>
                                </p>
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
                            <Label className="flex items-center gap-2">
                                Lien Google Maps (optionnel)
                                {draft.mapsLink && (
                                    /^(https?:\/\/)/.test(draft.mapsLink) 
                                        ? <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 italic">✓ Lien Valide</span>
                                        : <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 italic animate-pulse">⚠ Format URL attendu (http/https)</span>
                                )}
                            </Label>
                            <Input 
                                value={draft.mapsLink} 
                                onChange={(e) => setDraft(prev => ({ ...prev, mapsLink: e.target.value }))} 
                                placeholder="https://maps.app.goo.gl/..." 
                                className={cn(
                                    "rounded-xl",
                                    draft.mapsLink && !/^(https?:\/\/)/.test(draft.mapsLink) && "border-rose-500 bg-rose-50/30 ring-4 ring-rose-500/10 focus-visible:ring-rose-500/20"
                                )}
                            />
                            {draft.mapsLink && !/^(https?:\/\/)/.test(draft.mapsLink) && (
                                <p className="text-[10px] font-bold text-rose-500 italic mt-1 bg-white inline-block px-2 py-0.5 rounded-lg border border-rose-100 shadow-sm animate-in slide-in-from-left-2 transition-all">
                                    Veuillez inclure le "https://" au début du lien (ex: copiez-collez depuis Maps).
                                </p>
                            )}
                        </div>

                    </div>
                )
            case 'persona':
                return (
                    <div className="space-y-6">
                        <Card className={cn("transition-all overflow-hidden", draft.createPersona ? "border-orange-500 shadow-lg shadow-orange-500/10" : "opacity-70 grayscale")}>
                            <CardHeader className={cn("transition-colors", draft.createPersona ? "bg-orange-50/50" : "bg-muted/50")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            👤 Carte de visite digitale
                                            {draft.createPersona && <Badge className="bg-orange-500">Activé</Badge>}
                                        </CardTitle>
                                        <CardDescription>
                                            Créez votre profil personnel ("Passport") pour rassurer vos clients et partager vos réseaux sociaux.
                                        </CardDescription>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={draft.createPersona}
                                            onChange={(e) => setDraft(prev => ({ ...prev, createPersona: e.target.checked }))}
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            </CardHeader>
                            {draft.createPersona && (
                                <CardContent className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Votre nom complet</Label>
                                            <Input
                                                value={draft.personaName}
                                                onChange={(e) => handlePersonaNameChange(e.target.value)}
                                                placeholder="Ex: Moussa Koné"
                                                className="rounded-xl border-orange-200 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Nom d'utilisateur public (@)</Label>
                                            <div className="relative">
                                                <Input
                                                    value={draft.personaUsername}
                                                    onChange={(e) => setDraft(prev => ({ ...prev, personaUsername: formatSlug(e.target.value) }))}
                                                    placeholder="moussa-kone"
                                                    className="pl-7 rounded-xl border-orange-200 focus:ring-orange-500"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                🔗 Lien public : <span className="text-orange-600 font-medium">menlyla.app/passport/{draft.personaUsername || 'slug'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Bio (Une phrase qui vous définit)</Label>
                                            <Textarea
                                                value={draft.personaBio}
                                                onChange={(e) => setDraft(prev => ({ ...prev, personaBio: e.target.value }))}
                                                placeholder="Passionné de cuisine ivoirienne, fondateur de Chez Moussa, je vous accueille avec plaisir !"
                                                rows={4}
                                                className="rounded-xl border-orange-200 focus:ring-orange-500 resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Photo de profil</Label>
                                            <div className="flex justify-center">
                                                <ImageUpload
                                                    id="persona-image"
                                                    label="Ajouter ma photo"
                                                    defaultImage={draft.personaImage}
                                                    onImageUploaded={(url: string) => setDraft(prev => ({ ...prev, personaImage: url }))}
                                                    onImageRemoved={() => setDraft(prev => ({ ...prev, personaImage: '' }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                        {!draft.createPersona && (
                            <div className="text-center py-12 px-6 bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted rounded-full">
                                    <Circle className="h-8 w-8 text-muted-foreground opacity-50" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Personnage sauté</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Vous avez choisi de ne pas créer de personnage pour le moment. Votre menu sera quand même publié. Vous pourrez créer votre Passport plus tard.</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setDraft(prev => ({ ...prev, createPersona: true }))}
                                    className="rounded-full px-8"
                                >
                                    ✨ Changer d'avis et créer mon personnage
                                </Button>
                            </div>
                        )}
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
            case 'tables':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration de la salle</CardTitle>
                                <CardDescription>Combien de tables possédez-vous ? Nous générerons les QR Codes pour chacune.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre de tables</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={draft.tableCount}
                                        onChange={(e) => setDraft(prev => ({ ...prev, tableCount: parseInt(e.target.value) || 0 }))}
                                        placeholder="Ex: 10"
                                        className="text-lg font-bold"
                                    />
                                    <p className="text-sm text-muted-foreground">Laissez à 0 si vous ne faites que de la vente à emporter ou livraison.</p>
                                </div>

                                {draft.tableCount > 0 && (
                                    <div className="rounded-2xl border bg-orange-50 p-4 flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-xl border shadow-sm">
                                            <div className="h-6 w-6 grid grid-cols-2 gap-0.5">
                                                <div className="bg-black" />
                                                <div className="bg-black" />
                                                <div className="bg-black" />
                                                <div className="bg-orange-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-950">Génération automatique</p>
                                            <p className="text-sm text-orange-800 mt-1">
                                                Nous allons créer <span className="font-bold">{draft.tableCount} tables</span> (Table 1 à Table {draft.tableCount}) et leurs QR Codes uniques prêts à imprimer.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
                                <Input value={draft.primaryCategoryName} onChange={(e) => setDraft(prev => ({ ...prev, primaryCategoryName: e.target.value }))} placeholder="Ex : Plats, Boissons..." />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Votre premier plat</CardTitle>
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
                                        <p className="text-sm opacity-80">{draft.primaryDishName || 'Plat à définir'} — {draft.primaryDishPrice ? `${Number(draft.primaryDishPrice).toLocaleString()} ${draft.currency}` : 'Prix ?'}</p>
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
                                    <p className="font-semibold">Premier plat</p>
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
            case 'billing':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card
                                className={cn(
                                    "relative cursor-pointer transition-all border-2",
                                    draft.plan === 'solo' ? "border-orange-500 shadow-lg" : "border-muted opacity-80 hover:opacity-100"
                                )}
                                onClick={() => setDraft(prev => ({ ...prev, plan: 'solo' }))}
                            >
                                {draft.plan === 'solo' && (
                                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle>OFFRE SOLO</CardTitle>
                                    <CardDescription>Idéal pour démarrer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-black">0 FCFA <span className="text-sm font-normal text-muted-foreground">/mois</span></div>
                                    <ul className="text-sm space-y-2">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Menu digital illimité</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 1 QR Code unique</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Photos HD</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    "relative cursor-pointer transition-all border-2",
                                    draft.plan === 'pro' ? "border-orange-500 shadow-lg" : "border-muted opacity-80 hover:opacity-100"
                                )}
                                onClick={() => setDraft(prev => ({ ...prev, plan: 'pro' }))}
                            >
                                {draft.plan === 'pro' && (
                                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                    CONSEILLÉ
                                </div>
                                <CardHeader>
                                    <CardTitle>OFFRE PRO</CardTitle>
                                    <CardDescription>Pour les restaurants sérieux</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-black">9.900 FCFA <span className="text-sm font-normal text-muted-foreground">/mois</span></div>
                                    <ul className="text-sm space-y-2">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tout de l'offre Solo</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> QR Code par table</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Gestion des commandes</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Support Prioritaire</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            case 'payment':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-2 border-orange-200 shadow-xl overflow-hidden">
                            <div className="bg-orange-500 p-6 text-white">
                                <h3 className="text-xl font-black">Finalisation de votre compte</h3>
                                <p className="opacity-80 text-sm">Plus qu'une étape pour lancer votre restaurant digital</p>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-center py-4 border-b">
                                    <span className="text-muted-foreground">Abonnement {draft.plan.toUpperCase()}</span>
                                    <span className="font-bold">{draft.plan === 'solo' ? 'GRATUIT' : '9.900 FCFA /mois'}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b">
                                    <span className="text-muted-foreground">Frais de livraison (autocollants QR)</span>
                                    <span className="font-black text-xl text-orange-600 underline decoration-orange-200 underline-offset-4">2,000 FCFA</span>
                                </div>

                                <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 flex flex-col items-center gap-4 text-center">
                                    <div className="text-sm text-orange-950 font-bold uppercase tracking-widest">Total à payer aujourd'hui</div>
                                    <div className="text-5xl font-black text-orange-600">
                                        {draft.plan === 'solo' ? '2.000' : '11.900'} FCFA
                                    </div>
                                    <p className="text-xs text-orange-800 opacity-80">
                                        {draft.plan === 'solo'
                                            ? 'Livraison unique + 0 FCFA/mois'
                                            : 'Livraison unique + Premier mois d\'abonnement'}
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-sm font-bold text-blue-900">Paiement via GeniusPay</p>
                                        <p className="text-xs text-blue-700 leading-tight">
                                            Utilisez Wave, Orange Money, MTN ou Moov pour activer votre compte instantanément.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-center gap-3 font-medium text-black">
                                        <input type="checkbox" checked={draft.publishNow} onChange={(e) => setDraft(prev => ({ ...prev, publishNow: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                        Publier mon restaurant immédiatement
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        En cliquant sur "Payer et Créer", vous acceptez nos conditions générales d'utilisation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
        }
    }

    const canAccessStep = (index: number) => index <= step

    const isLastStep = step === currentSteps.length - 1
    const currentStepId = currentSteps[step].id
    const needsPaymentNow = useMemo(() => draft.plan === 'pro' && !hasPaidParam, [draft.plan, hasPaidParam])

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
                    <input type="hidden" name="banner_url" value={draft.bannerUrl} />
                    <input type="hidden" name="cuisine_type" value={draft.cuisineType} />
                    <input type="hidden" name="maps_link" value={draft.mapsLink} />
                    <input type="hidden" name="table_count" value={draft.tableCount} />
                    <input type="hidden" name="plan" value={draft.plan} />
                    <input type="hidden" name="settings" value={JSON.stringify(settingsPayload)} />

                    {/* Profile / Persona Data */}
                    {draft.createPersona && (
                        <>
                            <input type="hidden" name="profile_full_name" value={draft.personaName} />
                            <input type="hidden" name="profile_username" value={draft.personaUsername} />
                            <input type="hidden" name="profile_bio" value={draft.personaBio} />
                            <input type="hidden" name="profile_image" value={draft.personaImage} />
                            <input type="hidden" name="profile_phone" value={draft.phone} />
                            <input type="hidden" name="profile_email" value={draft.email} />
                        </>
                    )}

                    <Progress value={progress} className="h-2" />

                    <div className="space-y-6">
                        <div className="overflow-x-auto no-scrollbar pb-4">

                            <div
                                className="grid gap-4 min-w-[max-content]"
                                style={{ gridTemplateColumns: `repeat(${currentSteps.length}, 180px)` }}
                            >
                                {currentSteps.map((metadata, index) => {
                                    const isLocked = index > step
                                    const isCompleted = stepCompleted[metadata.id]
                                    const statusIcon = index < step || (isCompleted && index !== step)
                                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        : index === step
                                            ? <Badge variant="secondary">En cours</Badge>
                                            : <Circle className="h-4 w-4 text-muted-foreground" />
                                    return (
                                        <button
                                            key={metadata.id}
                                            type="button"
                                            onClick={() => canAccessStep(index) && setStep(index)}
                                            className={cn(
                                                'rounded-2xl border px-3 py-2 text-left transition-all flex flex-col gap-1',
                                                index === step ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-muted bg-white opacity-70',
                                                isLocked && 'cursor-not-allowed'
                                            )}
                                            disabled={isLocked}
                                            aria-disabled={isLocked}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] uppercase font-bold text-muted-foreground">Étape {index + 1}</p>
                                                {statusIcon}
                                            </div>
                                            <p className="font-bold text-xs truncate">{metadata.title}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>


                        <div className="space-y-6">

                            {renderStep()}

                            {(state?.errors || state?.message) && (
                                <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive rounded-2xl text-sm space-y-2">
                                    {state?.message && <p className="font-black italic uppercase tracking-tight">{state.message}</p>}
                                    {state?.errors && Object.entries(state.errors).map(([field, messages]) => (
                                        <div key={field} className="flex gap-2 items-start">
                                            <span className="font-black uppercase text-[10px] bg-destructive text-white px-1.5 py-0.5 rounded-md mt-0.5">{field}</span>
                                            <ul className="list-disc pl-4 font-bold">
                                                {messages?.map((msg, i) => <li key={i}>{msg}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}


                            {/* Hide navigation if in payment overlay but allow welcome step */}
                            {(!(currentSteps[step].id !== 'welcome' && needsPaymentNow)) && (
                                <div className="flex flex-wrap gap-4 justify-between pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={step === 0 || isPending}
                                        className="h-12 px-6 rounded-xl font-bold"
                                    >
                                        Précédent
                                    </Button>

                                    {isLastStep ? (
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-12 rounded-xl shadow-xl shadow-orange-600/20 transition-all hover:scale-105"
                                            disabled={isPending || !stepCompleted[currentStepId]}
                                        >
                                            {isPending ? 'Publication...' : 'Finaliser et Créer'}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!stepCompleted[currentSteps[step].id]}
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-12 rounded-xl h-12 shadow-lg shadow-orange-600/10"
                                        >
                                            Continuer
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
