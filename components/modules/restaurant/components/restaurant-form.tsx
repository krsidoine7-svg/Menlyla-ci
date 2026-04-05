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
import { CheckCircle2, Circle, CreditCard, LayoutGrid, ShoppingBag, QrCode, Phone, Mail, MapPin, MessageSquare, Globe, Copy } from 'lucide-react'
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

const CUISINE_TYPES = [
    { id: 'Ivoirienne', label: '🇨🇮 Ivoirienne' },
    { id: 'Africaine', label: '🌍 Africaine' },
    { id: 'Afro-fusion', label: '🪴 Afro-fusion' },
    { id: 'Fast-food', label: '🍔 Fast-food' },
    { id: 'Pizza', label: '🍕 Pizzas' },
    { id: 'Grillades', label: '🍗 Grillades' },
    { id: 'Gastro', label: '🍷 Gastro' },
    { id: 'Café', label: '☕ Petit Déj / Café' },
    { id: 'Asiatique', label: '🍜 Asiatique' },
    { id: 'Autre', label: '✨ Autre' },
]
const THEME_COLORS = [
    '#FF5C3C', // Orange Menlyla
    '#14B8A6', // Teal
    '#4338CA', // Indigo
    '#E11D48', // Rose
    '#8B5CF6', // Violet
    '#059669', // Emerald
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#0F172A', // Slate/Dark
    '#CA8A04', // Bronze/Gold
    '#DB2777', // Pink
]
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
    simpleOpen: '',
    simpleClose: '',
    advancedHours: DAYS.reduce((acc, day) => {
        acc[day.key] = { open: '', close: '', closed: day.key === 'sunday' }
        return acc
    }, {} as Record<DayKey, DaySchedule>),
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
            const foundCode = COUNTRY_CODES.find(c => rawWhatsapp.startsWith(c.code))
            const countryCode = foundCode?.code || '225'
            const numberOnly = rawWhatsapp.startsWith(countryCode) ? rawWhatsapp.substring(countryCode.length) : rawWhatsapp

            // If the user feels '0202' is hardcoded, it's likely a remnant from previous tests. we'll clear it.
            const cleanPhone = initialRestaurant.phone === '0202' ? '' : (initialRestaurant.phone || '')
            const cleanWhatsappNumber = numberOnly === '0202' ? '' : numberOnly
            const cleanWhatsapp = (initialRestaurant.whatsapp === '2250202' || initialRestaurant.whatsapp === '0202') ? '' : rawWhatsapp

            return {
                ...initialDraft,
                name: initialRestaurant.name === 'Mon Restaurant' ? '' : initialRestaurant.name,
                slug: initialRestaurant.slug?.startsWith('temp-') ? '' : initialRestaurant.slug,
                description: initialRestaurant.description || '',
                phone: cleanPhone,
                whatsapp: cleanWhatsapp,
                whatsappCountryCode: countryCode,
                whatsappNumber: cleanWhatsappNumber,
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
        const stepId = currentSteps[step].id as StepId

        return (
            <div key={stepId} className="animate-in fade-in slide-in-from-right-4 duration-500">
                {renderStepContent(stepId)}
            </div>
        )
    }

    const renderStepContent = (stepId: StepId) => {
        switch (stepId) {
            case 'welcome':
                return (
                    <div className="space-y-12 py-6">
                        {/* Hero message - More bold and immersive */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 rounded-full text-orange-700 text-xs font-black uppercase tracking-widest animate-pulse">
                                <span className="h-2 w-2 bg-orange-500 rounded-full" />
                                Prêt en 5 minutes ⏱️
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tighter leading-[1.1]">
                                Votre restaurant<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600">mérite d'être digital.</span>
                            </h2>
                            <p className="mt-4 text-zinc-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                                Finissez-en avec les menus PDF illisibles. Créez une expérience unique pour vos clients en quelques clics.
                            </p>
                        </div>

                        {/* Feature cards - Visual cards with icons */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                { 
                                    title: 'Menu Interactif', 
                                    desc: 'Un menu fluide, beau et rapide sur tous les téléphones.', 
                                    icon: <ShoppingBag className="w-5 h-5" />,
                                    color: 'bg-blue-50 border-blue-100 text-blue-600' 
                                },
                                { 
                                    title: 'WhatsApp Direct', 
                                    desc: 'Recevez les commandes et réservations directement sur votre WhatsApp.', 
                                    icon: <MessageSquare className="w-5 h-5" />,
                                    color: 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                },
                                { 
                                    title: 'Google Maps & Appels', 
                                    desc: 'Itinéraires et appels intégrés pour que vos clients vous trouvent partout.', 
                                    icon: <MapPin className="w-5 h-5" />,
                                    color: 'bg-rose-50 border-rose-100 text-rose-600' 
                                },
                                { 
                                    title: 'QR Codes par Table', 
                                    desc: 'Imprimez vos codes et permettez à vos clients de commander de leur table.', 
                                    icon: <QrCode className="w-5 h-5" />,
                                    color: 'bg-amber-50 border-amber-100 text-amber-600' 
                                },
                            ].map(f => (
                                <div key={f.title} className="p-6 rounded-[32px] border-2 border-zinc-100 bg-white hover:border-orange-200 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/5 group flex flex-col items-start gap-4">
                                    <div className={cn("p-3 rounded-2xl", f.color)}>
                                        {f.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-zinc-900 text-base">{f.title}</p>
                                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Small trust indicator */}
                        <div className="flex justify-center items-center gap-2 text-zinc-400">
                            <span className="text-[10px] uppercase font-black tracking-widest">Rejoint par +50 restaurants</span>
                        </div>
                    </div>
                )

            case 'identity':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] ml-1">
                                <Badge className="bg-orange-500 text-white border-0 hover:bg-orange-600">1</Badge>
                                🏢 Identité du Restaurant
                            </div>
                            <Label className="flex items-center gap-2">Nom du restaurant</Label>
                            <Input value={draft.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ex : Restaurant Ivoire Saveurs" />
                            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                        </div>
                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] ml-1">
                                <Badge className="bg-zinc-900 text-white border-0">2</Badge>
                                🔗 Adresse Web & Identifiant
                            </div>
                            <Label className="flex items-center gap-2">Identifiant URL (slug)</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input value={draft.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="ivoire-saveurs" className="flex-1" />
                                <Button type="button" variant="ghost" onClick={resetSlug}>Recalculer</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Lien public : menlyla.app/{draft.slug || 'votre-slug'}</p>
                            {state?.errors?.slug && <p className="text-sm text-destructive">{state.errors.slug}</p>}
                        </div>
                        <div className="grid gap-8 lg:grid-cols-[2fr,1fr] pt-4 border-t border-zinc-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] ml-1">
                                    <Badge className="bg-orange-100 text-orange-700 border-0">3</Badge>
                                    🍽️ Style & Description
                                </div>
                                <Label className="flex items-center gap-2">Description courte</Label>
                                <Textarea value={draft.description} onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))} placeholder="Cuisine afro-chic, grillades, ambiance cosy…" rows={3} className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200 transition-all text-base" />
                                <Label className="flex items-center gap-2">Type de cuisine</Label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINE_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setDraft(prev => ({ ...prev, cuisineType: type.id }))}
                                            className={cn(
                                                'px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200',
                                                draft.cuisineType === type.id
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
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
                    <div className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* COMMUNICATION CARD */}
                            <Card className="border-2 border-zinc-100 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden">
                                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Communication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Numéro de Téléphone (Appels)</Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-orange-50 rounded-xl group-focus-within:bg-orange-500 group-focus-within:text-white transition-all">
                                                    <Phone className="w-3.5 h-3.5 text-orange-600 group-focus-within:text-inherit" />
                                                </div>
                                                <Input 
                                                    value={draft.phone}
                                                    onChange={(e) => setDraft(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="07 00 00 00 00"
                                                    className="pl-14 h-14 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200 transition-all text-base font-bold"
                                                />
                                                {draft.phone.length >= 8 && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Numéro WhatsApp</Label>
                                            <div className="flex gap-2">
                                                <div className="relative w-36 shrink-0 group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <Globe className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                                                    </div>
                                                    <select 
                                                        value={draft.whatsappCountryCode}
                                                        onChange={(e) => handleWhatsappCountryChange(e.target.value)}
                                                        className="w-full h-14 pl-9 pr-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 text-sm font-bold appearance-none focus:bg-white focus:border-orange-200 focus:outline-none transition-all cursor-pointer"
                                                    >
                                                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="relative flex-1 group">
                                                    <Input 
                                                        value={draft.whatsappNumber}
                                                        onChange={(e) => handleWhatsappNumberChange(e.target.value)}
                                                        placeholder="Ex: 07 00 00 00"
                                                        className="h-14 pr-12 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200 transition-all text-base font-bold"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(draft.whatsapp.replace(/\D/g, ''))
                                                            toast.success('Numéro WhatsApp copié !')
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-orange-500 transition-colors"
                                                        title="Copier le numéro"
                                                    >
                                                        <Copy className="w-4 h-4" /> 
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Email</Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 rounded-xl group-focus-within:bg-orange-500 group-focus-within:text-white transition-all">
                                                    <Mail className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-inherit" />
                                                </div>
                                                <Input 
                                                    type="email"
                                                    value={draft.email}
                                                    onChange={(e) => setDraft(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="contact@votre-resto.com"
                                                    className={cn(
                                                        "pl-14 h-14 rounded-2xl border-2 transition-all text-base font-bold",
                                                        draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
                                                            ? "border-rose-100 bg-rose-50 focus:border-rose-200"
                                                            : "border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* LOCALISATION CARD */}
                            <Card className="border-2 border-zinc-100 shadow-xl shadow-zinc-200/20 rounded-[32px] overflow-hidden">
                                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Localisation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Ville & Quartier</Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 rounded-xl group-focus-within:bg-orange-500 group-focus-within:text-white transition-all">
                                                    <Globe className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-inherit" />
                                                </div>
                                                <Input 
                                                    value={draft.city} 
                                                    onChange={(e) => setDraft(prev => ({ ...prev, city: e.target.value }))} 
                                                    placeholder="Abidjan, Cocody..." 
                                                    className="pl-14 h-14 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200 transition-all text-base font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Adresse / Indications</Label>
                                            <Textarea 
                                                value={draft.address} 
                                                onChange={(e) => setDraft(prev => ({ ...prev, address: e.target.value }))} 
                                                placeholder="Rue des jardins, face à la banque..." 
                                                rows={2} 
                                                className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200 transition-all text-base font-bold min-h-[100px] resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1 flex justify-between items-center">
                                                <span>Lien Google Maps</span>
                                                {draft.mapsLink && (
                                                    /^(https?:\/\/)/.test(draft.mapsLink) 
                                                    ? <span className="text-[9px] text-emerald-500 font-black uppercase bg-emerald-50 px-2 py-0.5 rounded-md">✓ Validé</span>
                                                    : <span className="text-[9px] text-rose-500 font-black uppercase bg-rose-50 px-2 py-0.5 rounded-md">⚠ Invalide</span>
                                                )}
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-100 rounded-xl group-focus-within:bg-orange-500 group-focus-within:text-white transition-all">
                                                    <MapPin className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-inherit" />
                                                </div>
                                                <Input 
                                                    value={draft.mapsLink} 
                                                    onChange={(e) => setDraft(prev => ({ ...prev, mapsLink: e.target.value }))} 
                                                    placeholder="https://maps.app.goo.gl/..." 
                                                    className={cn(
                                                        "pl-14 h-14 rounded-2xl border-2 transition-all text-base font-bold",
                                                        draft.mapsLink && !/^(https?:\/\/)/.test(draft.mapsLink) 
                                                            ? "border-rose-100 bg-rose-50 focus:border-rose-200" 
                                                            : "border-zinc-100 bg-zinc-50 focus:bg-white focus:border-orange-200"
                                                    )}
                                                />
                                            </div>
                                            {draft.mapsLink && !/^(https?:\/\/)/.test(draft.mapsLink) && (
                                                <p className="text-[10px] text-rose-500 font-bold italic mt-1 ml-1">Ajoutez "https://" au début.</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            case 'persona':
                return (
                    <div className="space-y-6">
                        <Card className={cn("transition-all overflow-hidden", draft.createPersona ? "border-orange-500 shadow-lg shadow-orange-500/10" : "")}>
                            <CardHeader className={cn("transition-colors", draft.createPersona ? "bg-orange-50/50" : "bg-zinc-50")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>Votre page perso de propriétaire</CardTitle>
                                        <CardDescription>
                                            Présentez-vous à vos clients : votre nom, votre photo et un petit mot. Cela crée la confiance.
                                        </CardDescription>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={draft.createPersona}
                                            onChange={(e) => setDraft(prev => ({ ...prev, createPersona: e.target.checked }))}
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
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
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Votre identifiant public</Label>
                                            <div className="relative">
                                                <Input
                                                    value={draft.personaUsername}
                                                    onChange={(e) => setDraft(prev => ({ ...prev, personaUsername: formatSlug(e.target.value) }))}
                                                    placeholder="moussa-kone"
                                                    className="pl-7 rounded-xl"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">@</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400">
                                                Votre page sera visible ici : <span className="text-orange-600 font-medium">menlyla.app/passport/{draft.personaUsername || '...'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Présentez-vous en une phrase</Label>
                                            <Textarea
                                                value={draft.personaBio}
                                                onChange={(e) => setDraft(prev => ({ ...prev, personaBio: e.target.value }))}
                                                placeholder="Passionné de cuisine ivoirienne, fondateur de Chez Moussa. Bienvenue !"
                                                rows={4}
                                                className="rounded-xl resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Votre photo</Label>
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
                            <div className="text-center py-10 px-6 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col items-center gap-3">
                                <p className="font-semibold text-zinc-700">Étape facultative</p>
                                <p className="text-sm text-zinc-500 max-w-md mx-auto">Vous n'êtes pas obligé de remplir cette page. Votre menu sera publié normalement. Vous pourrez toujours la créer plus tard.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDraft(prev => ({ ...prev, createPersona: true }))}
                                    className="rounded-full px-8 mt-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                    Créer ma page perso
                                </Button>
                            </div>
                        )}
                    </div>
                )
            case 'hours':
                return (
                    <div className="space-y-6">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Horaires d'ouverture</CardTitle>
                                <CardDescription>Indiquez quand vos clients peuvent commander.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 space-y-6">
                                {/* Mode Selection Chips */}
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setDraft(prev => ({ ...prev, hoursMode: 'simple' }))}
                                        className={cn(
                                            'px-6 py-3 rounded-2xl text-sm font-bold border-2 transition-all',
                                            draft.hoursMode === 'simple' 
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                                                : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300'
                                        )}
                                    >
                                        🕒 Horaires identiques
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setDraft(prev => ({ ...prev, hoursMode: 'advanced' }))}
                                        className={cn(
                                            'px-6 py-3 rounded-2xl text-sm font-bold border-2 transition-all',
                                            draft.hoursMode === 'advanced' 
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                                                : 'border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300'
                                        )}
                                    >
                                        📅 Par jour (Lundi-Dim)
                                    </button>
                                </div>

                                {/* Temporary Closure Toggle */}
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                    draft.isTemporarilyClosed ? "border-rose-200 bg-rose-50" : "border-zinc-100 bg-zinc-50/50"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl", draft.isTemporarilyClosed ? "bg-rose-100 text-rose-600" : "bg-zinc-200 text-zinc-500")}>
                                            <span className="text-xl">🚪</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Le restaurant est fermé actuellement</p>
                                            <p className="text-xs text-zinc-500">Cochez si vous faites des travaux ou congés.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={draft.isTemporarilyClosed} 
                                            onChange={(e) => setDraft(prev => ({ ...prev, isTemporarilyClosed: e.target.checked }))} 
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                    </label>
                                </div>

                                {!draft.isTemporarilyClosed && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        {draft.hoursMode === 'simple' ? (
                                            <div className="grid grid-cols-2 gap-4 p-6 rounded-[28px] border-2 border-zinc-100 bg-white shadow-sm">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Ouverture</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type="time" 
                                                            value={draft.simpleOpen} 
                                                            onChange={(e) => setDraft(prev => ({ ...prev, simpleOpen: e.target.value }))} 
                                                            className="h-14 text-lg font-bold rounded-2xl border-zinc-100 pl-4 bg-zinc-50"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Fermeture</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type="time" 
                                                            value={draft.simpleClose} 
                                                            onChange={(e) => setDraft(prev => ({ ...prev, simpleClose: e.target.value }))} 
                                                            className="h-14 text-lg font-bold rounded-2xl border-zinc-100 pl-4 bg-zinc-50"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="col-span-2 text-xs text-zinc-400 text-center mt-2 italic">
                                                    Ces horaires seront appliqués à tous les jours de la semaine.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {DAYS.map(day => (
                                                    <div key={day.key} className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                                        draft.advancedHours[day.key].closed 
                                                            ? "bg-zinc-50 border-zinc-100 opacity-60" 
                                                            : "bg-white border-zinc-100 hover:border-orange-200"
                                                    )}>
                                                        <div className="w-24 shrink-0">
                                                            <p className="text-sm font-black text-zinc-900">{day.label}</p>
                                                        </div>
                                                        
                                                        <button 
                                                            type="button"
                                                            onClick={() => updateAdvancedHour(day.key, 'closed', !draft.advancedHours[day.key].closed)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                                                                draft.advancedHours[day.key].closed 
                                                                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                                                                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                                            )}
                                                        >
                                                            {draft.advancedHours[day.key].closed ? 'Fermé ❌' : 'Ouvert ✅'}
                                                        </button>

                                                        {!draft.advancedHours[day.key].closed && (
                                                            <div className="flex flex-1 items-center gap-2">
                                                                <Input 
                                                                    type="time" 
                                                                    value={draft.advancedHours[day.key].open} 
                                                                    onChange={(e) => updateAdvancedHour(day.key, 'open', e.target.value)} 
                                                                    className="h-10 text-sm font-bold border-none bg-zinc-50 rounded-xl"
                                                                />
                                                                <span className="text-zinc-300">→</span>
                                                                <Input 
                                                                    type="time" 
                                                                    value={draft.advancedHours[day.key].close} 
                                                                    onChange={(e) => updateAdvancedHour(day.key, 'close', e.target.value)} 
                                                                    className="h-10 text-sm font-bold border-none bg-zinc-50 rounded-xl"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            case 'tables':
                return (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-zinc-900">Configuration des tables</h3>
                            <p className="text-sm text-zinc-500">Définissez le nombre de QR codes à générer pour vos tables.</p>
                        </div>

                        <div className="grid gap-6">
                            {/* Pro Selector Card */}
                            <div className="p-10 rounded-[40px] border-2 border-zinc-100 bg-white shadow-xl shadow-zinc-200/20 flex flex-col items-center">
                                <div className="p-4 bg-orange-50 rounded-3xl mb-6">
                                    <LayoutGrid className="w-8 h-8 text-orange-600" />
                                </div>
                                <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Nombre de tables</Label>
                                
                                <div className="flex items-center gap-12 bg-zinc-50 p-3 rounded-[32px] border border-zinc-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setDraft(prev => ({ ...prev, tableCount: Math.max(0, prev.tableCount - 1) }))}
                                        className="w-14 h-14 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-all text-2xl font-light text-zinc-400 hover:text-zinc-900 shadow-sm"
                                    >
                                        −
                                    </button>
                                    <div className="w-20 text-center">
                                        <span className="text-6xl font-black text-zinc-900 tabular-nums">{draft.tableCount}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setDraft(prev => ({ ...prev, tableCount: Math.min(100, prev.tableCount + 1) }))}
                                        className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-black transition-all text-2xl font-light text-white shadow-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Status Confirmation */}
                            <div className={cn(
                                "flex items-center gap-5 p-5 rounded-[28px] border-2 transition-all duration-500",
                                draft.tableCount === 0 
                                    ? "bg-zinc-50 border-zinc-200 text-zinc-600" 
                                    : "bg-orange-50 border-orange-100 text-orange-900"
                            )}>
                                <div className={cn(
                                    "p-4 rounded-2xl shrink-0 transition-colors",
                                    draft.tableCount === 0 ? "bg-zinc-200 text-zinc-500" : "bg-white text-orange-600 shadow-sm"
                                )}>
                                    {draft.tableCount === 0 ? <ShoppingBag className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight">
                                        {draft.tableCount === 0 
                                            ? "Mode Vente à Emporter & Livraison uniquement" 
                                            : `Mode Restauration sur place — ${draft.tableCount} tables`}
                                    </p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {draft.tableCount === 0 
                                            ? "Utile pour la commande directe au comptoir sans QR code table." 
                                            : `Nous générons automatiquement ${draft.tableCount} QR codes prêts à imprimer.`}
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                <div className="rounded-3xl border-2 border-zinc-100 bg-white p-6 shadow-sm relative overflow-hidden group">
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500" 
                                        style={{ backgroundColor: draft.themeColor }}
                                    />
                                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-zinc-300" /> Aperçu client
                                    </p>
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 space-y-2">
                                            <h4 className="font-black text-zinc-900 text-lg leading-tight uppercase tracking-tight">
                                                {draft.primaryDishName || 'Nom de votre plat'}
                                            </h4>
                                            <p className="text-zinc-500 text-sm font-medium leading-relaxed italic">
                                                {draft.primaryDishDescription || 'Décrivez brièvement la composition du plat...'}
                                            </p>
                                            <div className="pt-2 flex items-center gap-2">
                                                <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-100 font-bold text-[10px] uppercase px-2 py-0">Menu digital</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="px-4 py-2 bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-900/10">
                                                <p className="text-xl font-black text-white tabular-nums">
                                                    {draft.primaryDishPrice ? `${Number(draft.primaryDishPrice).toLocaleString()}` : '0'}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{draft.currency}</span>
                                        </div>
                                    </div>
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
                                <div className="flex flex-wrap gap-4 p-4 bg-zinc-50/50 rounded-[32px] border-2 border-zinc-100">
                                    {THEME_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setDraft(prev => ({ ...prev, themeColor: color }))}
                                            className={cn(
                                                'h-11 w-11 rounded-full transition-all duration-300 relative',
                                                draft.themeColor === color
                                                    ? 'scale-110 shadow-lg'
                                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                            )}
                                            style={{ backgroundColor: color }}
                                        >
                                            {draft.themeColor === color && (
                                                <div className="absolute inset-[-6px] rounded-full border-2 animate-in zoom-in-50 duration-500" style={{ borderColor: color }} />
                                            )}
                                        </button>
                                    ))}
                                    
                                    {/* Custom Color Picker */}
                                    <div className="relative group ml-auto">
                                        <input 
                                            type="color" 
                                            value={draft.themeColor} 
                                            onChange={(e) => setDraft(prev => ({ ...prev, themeColor: e.target.value }))}
                                            className="h-11 w-11 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                                        />
                                        <div className={cn(
                                            "h-11 w-11 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center transition-all bg-white group-hover:border-orange-400",
                                            !THEME_COLORS.includes(draft.themeColor) && "border-solid"
                                        )}
                                        style={!THEME_COLORS.includes(draft.themeColor) ? { borderColor: draft.themeColor, boxShadow: `0 0 0 2px white, 0 0 0 4px ${draft.themeColor}` } : {}}>
                                            <span className="text-lg">🎨</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {THEME_STYLES.map(style => (
                                        <button key={style.id} type="button" onClick={() => setDraft(prev => ({ ...prev, themeStyle: style.id }))} className={cn('rounded-2xl border p-3 text-left', draft.themeStyle === style.id ? 'border-orange-500 bg-orange-50' : 'border-muted')}>
                                            <p className="font-semibold">{style.label}</p>
                                            <p className="text-xs text-muted-foreground">{style.description}</p>
                                        </button>
                                    ))}
                                </div>
                                {/* Phone mockup preview */}
                                <div className="flex justify-center">
                                    <div className="w-[260px] rounded-[32px] border-[6px] border-zinc-900 bg-zinc-900 p-1 shadow-2xl">
                                        <div className="rounded-[26px] overflow-hidden bg-white">
                                            {/* Status bar */}
                                            <div className="flex items-center justify-between px-5 py-2 bg-zinc-50">
                                                <span className="text-[9px] font-bold text-zinc-400">9:41</span>
                                                <div className="flex gap-1">
                                                    <div className="w-3 h-1.5 bg-zinc-300 rounded-sm" />
                                                    <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                                                </div>
                                            </div>
                                            {/* Header */}
                                            <div className="px-5 py-4" style={{ backgroundColor: designPreview.bg }}>
                                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{designPreview.styleLabel}</p>
                                                <p className="text-base font-black text-white mt-1 leading-tight">{draft.name || 'Votre restaurant'}</p>
                                            </div>
                                            {/* Menu item */}
                                            <div className="px-5 py-3 border-b border-zinc-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-800">{draft.primaryDishName || 'Plat vedette'}</p>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5">{draft.primaryDishDescription || 'Description...'}</p>
                                                    </div>
                                                    <p className="text-xs font-black" style={{ color: designPreview.bg }}>{draft.primaryDishPrice ? `${Number(draft.primaryDishPrice).toLocaleString()} ${draft.currency}` : '— FCFA'}</p>
                                                </div>
                                            </div>
                                            <div className="px-5 py-3">
                                                <div className="h-2 bg-zinc-100 rounded-full w-3/4" />
                                                <div className="h-2 bg-zinc-100 rounded-full w-1/2 mt-2" />
                                            </div>
                                        </div>
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
        <div className="w-full max-w-5xl mx-auto mt-6 mb-12">

            {/* ── BRANDED HEADER ── */}
            <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] px-10 py-10">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <span className="text-2xl font-black text-white">M</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Créez votre restaurant</h1>
                        <p className="text-sm text-white/50 font-medium mt-0.5">Étape {step + 1} sur {currentSteps.length} — {currentSteps[step].title}</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="relative z-10 mt-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ── STEP INDICATOR BAR ── */}
            <div className="bg-[#fafafa] border-x border-b border-zinc-200/80 px-6 py-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-0 min-w-max">
                    {currentSteps.map((metadata, index) => {
                        const isLocked = index > step
                        const isCompleted = index < step || (stepCompleted[metadata.id] && index !== step)
                        const isCurrent = index === step

                        return (
                            <div key={metadata.id} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => canAccessStep(index) && setStep(index)}
                                    disabled={isLocked}
                                    className={cn(
                                        'flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap',
                                        isCurrent && 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105',
                                        isCompleted && !isCurrent && 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer',
                                        isLocked && 'text-zinc-300 cursor-not-allowed',
                                        !isCurrent && !isCompleted && !isLocked && 'text-zinc-400'
                                    )}
                                >
                                    <span className={cn(
                                        'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black transition-all',
                                        isCurrent && 'bg-white text-orange-600',
                                        isCompleted && !isCurrent && 'bg-emerald-500 text-white',
                                        isLocked && 'bg-zinc-100 text-zinc-300',
                                        !isCurrent && !isCompleted && !isLocked && 'bg-zinc-100 text-zinc-400'
                                    )}>
                                        {isCompleted && !isCurrent ? '✓' : index + 1}
                                    </span>
                                    <span className="hidden sm:inline">{metadata.title}</span>
                                </button>
                                {index < currentSteps.length - 1 && (
                                    <div className={cn(
                                        'w-6 h-[2px] mx-1 rounded-full transition-colors',
                                        index < step ? 'bg-emerald-300' : 'bg-zinc-200'
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── FORM CONTENT ── */}
            <div className="bg-white border-x border-b border-zinc-200/80 rounded-b-[28px] shadow-xl shadow-black/[0.03]">
                <form action={formAction}>
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

                    {/* Step Content */}
                    <div className="px-8 py-10 sm:px-12 text-zinc-900" style={{ '--card': '#ffffff', '--card-foreground': '#09090b', '--foreground': '#09090b', '--muted': '#f4f4f5', '--muted-foreground': '#52525b', '--border': '#e4e4e7', '--input': '#ffffff', '--accent': '#f4f4f5', '--accent-foreground': '#18181b', '--popover': '#ffffff', '--popover-foreground': '#09090b', '--secondary': '#f4f4f5', '--secondary-foreground': '#18181b', '--destructive': '#ef4444', '--ring': '#FF7A00' } as React.CSSProperties}>
                        {renderStep()}

                        {(state?.message || (state?.errors && Object.keys(state.errors).length > 0)) && (
                            <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm space-y-2">
                                {state?.message && <p className="font-black">{state.message}</p>}
                                {state?.errors && Object.entries(state.errors).map(([field, messages]) => (
                                    <div key={field} className="flex gap-2 items-start">
                                        <span className="font-black uppercase text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-md mt-0.5">{field}</span>
                                        <ul className="list-disc pl-4 font-semibold">
                                            {messages?.map((msg, i) => <li key={i}>{msg}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── NAVIGATION FOOTER ── */}
                    {(!(currentSteps[step].id !== 'welcome' && needsPaymentNow)) && (
                        <div className="flex items-center justify-between px-8 py-6 sm:px-12 border-t border-zinc-100 bg-[#fafafa] rounded-b-[28px]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 0 || isPending}
                                className="h-12 px-8 rounded-2xl font-bold text-zinc-600 border-zinc-300 bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-200 disabled:opacity-30"
                            >
                                ← Précédent
                            </Button>

                            {isLastStep ? (
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-12 px-10 rounded-2xl font-black bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200"
                                    disabled={isPending || !stepCompleted[currentStepId]}
                                >
                                    {isPending ? 'Publication...' : '🚀 Finaliser et Créer'}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!stepCompleted[currentSteps[step].id]}
                                    className={cn(
                                        "h-12 px-10 rounded-2xl font-black transition-all duration-300",
                                        stepCompleted[currentSteps[step].id]
                                            ? "bg-zinc-900 text-white border-0 shadow-xl shadow-zinc-900/20 hover:scale-[1.02] hover:-translate-y-0.5 animate-[pulse_2s_infinite]"
                                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed border-0"
                                    )}
                                >
                                    Continuer →
                                </Button>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
