'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateRestaurant } from '@/components/modules/restaurant/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/modules/menu/components/image-upload'
import { MessageCircle, Instagram, Facebook, Video, Plus, Trash2, Globe, LayoutGrid } from 'lucide-react'
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

    useEffect(() => {
        if (state.message && !state.errors) {
            toast.success(state.message)
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state])

    // Sync state with props when data is updated from server (revalidation)
    useEffect(() => {
        setLogoUrl(restaurant.logo_url)
        setBannerUrl(restaurant.banner_url)
        setSocialLinks(restaurant.social_links || {})
        setSettings(restaurant.settings || {})
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

    return (
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="logo_url" value={logoUrl || ''} />
            <input type="hidden" name="banner_url" value={bannerUrl || ''} />
            <input type="hidden" name="social_links" value={JSON.stringify(socialLinks)} />
            <input type="hidden" name="settings" value={JSON.stringify(settings)} />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: General Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-8">
                            <CardTitle className="text-2xl font-black">Profil du Restaurant</CardTitle>
                            <CardDescription className="font-medium">Identité visuelle et informations de contact.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom</Label>
                                    <Input id="name" name="name" defaultValue={restaurant.name} required className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12" />
                                    {state?.errors?.name && <p className="text-xs text-destructive font-bold">{state.errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Slug URL</Label>
                                    <Input id="slug" name="slug" defaultValue={restaurant.slug} required className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12" />
                                    {state?.errors?.slug && <p className="text-xs text-destructive font-bold">{state.errors.slug}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={restaurant.email} className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</Label>
                                    <Input id="phone" name="phone" defaultValue={restaurant.phone} className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Bio)</Label>
                                <Textarea id="description" name="description" defaultValue={restaurant.description} rows={4} className="rounded-2xl border-muted bg-muted/20 focus:bg-background min-h-[120px]" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse physique</Label>
                                <Textarea id="address" name="address" defaultValue={restaurant.address} className="rounded-2xl border-muted bg-muted/20 focus:bg-background h-12" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media Section */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden border-2 border-orange-100">
                        <CardHeader className="bg-orange-50/50 pb-8">
                            <CardTitle className="text-2xl font-black text-orange-600">Présence Sociale</CardTitle>
                            <CardDescription className="font-medium text-orange-950/50">Configurez vos liens vers Instagram, Facebook, etc.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            {/* Selector & Input */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block ml-1">Choisir Réseau</Label>
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="flex h-12 w-full rounded-2xl border border-muted bg-muted/20 px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {SOCIAL_PLATFORMS.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block ml-1">Nom d'utilisateur / Numéro</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="rounded-2xl border-muted bg-muted/10 h-12"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="h-12 w-12 rounded-2xl bg-orange-600 text-white hover:bg-orange-700"
                                            onClick={handleAddSocial}
                                        >
                                            <Plus className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* List of active social links */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.entries(socialLinks).map(([platformId, val]) => {
                                    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId) || { name: 'Autre', icon: Globe, prefix: '' }
                                    return (
                                        <div key={platformId} className="flex items-center justify-between p-4 rounded-3xl bg-white border-2 border-orange-50 relative group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <platform.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase text-muted-foreground">{platform.name}</div>
                                                    <div className="font-bold text-sm truncate max-w-[150px]">{val}</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-destructive hover:bg-red-50"
                                                onClick={() => handleRemoveSocial(platformId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                                {Object.keys(socialLinks).length === 0 && (
                                    <div className="col-span-full py-8 text-center text-sm italic text-muted-foreground opacity-50 bg-muted/5 rounded-[2rem] border-2 border-dashed">
                                        Aucun réseau social configuré. Ajoutez-en un ci-dessus.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Passport Features Toggle */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden border-2 border-orange-100/50">
                        <CardHeader className="bg-orange-50/30 pb-8">
                            <CardTitle className="text-2xl font-black text-orange-950">Expertise du Passeport</CardTitle>
                            <CardDescription className="font-medium">Personnalisez finement ce que vos clients voient.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-10">
                            {/* Main Toggles */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FeatureToggle
                                    label="Horaires"
                                    description="Afficher vos créneaux"
                                    checked={settings.show_hours !== false}
                                    onChange={(val) => setSettings(s => ({ ...s, show_hours: val }))}
                                />
                                <FeatureToggle
                                    label="Paiements"
                                    description="Afficher les modes acceptés"
                                    checked={settings.show_payments !== false}
                                    onChange={(val) => setSettings(s => ({ ...s, show_payments: val }))}
                                />
                                <FeatureToggle
                                    label="Wi-Fi"
                                    description="Partager votre connexion"
                                    checked={settings.show_wifi !== false}
                                    onChange={(val) => setSettings(s => ({ ...s, show_wifi: val }))}
                                />
                                <FeatureToggle
                                    label="GPS"
                                    description="Bouton d'itinéraire"
                                    checked={settings.show_gps !== false}
                                    onChange={(val) => setSettings(s => ({ ...s, show_gps: val }))}
                                />
                                <FeatureToggle
                                    label="Événements"
                                    description="Afficher vos offres & soirées"
                                    checked={settings.show_events !== false}
                                    onChange={(val) => setSettings(s => ({ ...s, show_events: val }))}
                                />
                            </div>

                            {/* Detailed Hours */}
                            {settings.show_hours !== false && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Créneaux Horaires</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const slots = settings.opening_slots || []
                                                setSettings(s => ({ ...s, opening_slots: [...slots, { start: '09:00', end: '22:00' }] }))
                                            }}
                                            className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        >
                                            + Ajouter un créneau
                                        </Button>
                                    </div>
                                    <div className="grid gap-3">
                                        {(settings.opening_slots || [{ start: '09:00', end: '22:00' }]).map((slot: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <Input
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            setSettings(s => {
                                                                const slots = [...(s.opening_slots || [{ start: '09:00', end: '22:00' }])]
                                                                slots[i] = { ...slots[i], start: val }
                                                                return { ...s, opening_slots: slots }
                                                            })
                                                        }}
                                                        className="rounded-xl border-orange-100 bg-orange-50/20"
                                                    />
                                                    <Input
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            setSettings(s => {
                                                                const slots = [...(s.opening_slots || [{ start: '09:00', end: '22:00' }])]
                                                                slots[i] = { ...slots[i], end: val }
                                                                return { ...s, opening_slots: slots }
                                                            })
                                                        }}
                                                        className="rounded-xl border-orange-100 bg-orange-50/20"
                                                    />
                                                </div>
                                                {i > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const slots = settings.opening_slots.filter((_: any, idx: number) => idx !== i)
                                                            setSettings(s => ({ ...s, opening_slots: slots }))
                                                        }}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Payments */}
                            {settings.show_payments !== false && (
                                <div className="space-y-6 pt-6 border-t border-orange-100 animate-in slide-in-from-top-2 duration-300">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Modes de Paiement</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-1">Ajouter un mode de paiement</Label>
                                            <select
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (!val) return
                                                    const methods = settings.payment_methods_list || []
                                                    if (!methods.includes(val)) {
                                                        setSettings(s => ({ ...s, payment_methods_list: [...methods, val] }))
                                                    }
                                                    e.target.value = ""
                                                }}
                                                className="flex h-12 w-full rounded-2xl border border-orange-100 bg-orange-50/20 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            >
                                                <option value="">-- Sélectionner un mode --</option>
                                                <option value="orange">Orange Money</option>
                                                <option value="moov">Moov Money</option>
                                                <option value="mtn">MTN Money</option>
                                                <option value="wave">Wave</option>
                                                <option value="cash">Espèces</option>
                                                <option value="visa">Carte Visa (BETA)</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {(settings.payment_methods_list || []).map((methodId: string) => {
                                                const labels: Record<string, string> = {
                                                    orange: 'Orange Money',
                                                    moov: 'Moov Money',
                                                    mtn: 'MTN Money',
                                                    wave: 'Wave',
                                                    cash: 'Espèces',
                                                    visa: 'Carte Visa'
                                                }
                                                return (
                                                    <div key={methodId} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-2xl font-black text-xs shadow-md shadow-orange-200 animate-in zoom-in duration-300">
                                                        <span>{labels[methodId] || methodId}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const methods = settings.payment_methods_list.filter((m: string) => m !== methodId)
                                                                setSettings(s => ({ ...s, payment_methods_list: methods }))
                                                            }}
                                                            className="hover:text-red-200 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                            {(settings.payment_methods_list || []).length === 0 && (
                                                <p className="text-[10px] font-bold text-slate-400 italic py-2">Aucun mode sélectionné.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Wi-Fi Details */}
                            {settings.show_wifi !== false && (
                                <div className="pt-6 border-t border-orange-100 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-1">Nom du Réseau Wi-Fi</Label>
                                        <Input
                                            placeholder="ex: BISSAP_GUEST"
                                            value={settings.wifi_name || ''}
                                            onChange={(e) => setSettings(s => ({ ...s, wifi_name: e.target.value }))}
                                            className="rounded-2xl border-orange-100 bg-orange-50/20 h-10 font-bold"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Events Management */}
                    {settings.show_events !== false && (
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden border-2 border-orange-100/50 animation-in fade-in slide-in-from-top-4 duration-500">
                            <CardHeader className="bg-orange-50/30 pb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-orange-950">🎉 Événements & Offres</CardTitle>
                                        <CardDescription className="font-medium">Annoncez vos soirées, promotions ou événements.</CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setSettings(s => {
                                                const currentSettings = typeof s === 'object' && s !== null ? s : {};
                                                const events = Array.isArray(currentSettings.events) ? currentSettings.events : [];
                                                return {
                                                    ...currentSettings,
                                                    events: [
                                                        ...events,
                                                        {
                                                            id: Date.now(),
                                                            title: '',
                                                            description: '',
                                                            link: '',
                                                            date: '',
                                                            image_url: ''
                                                        }
                                                    ]
                                                };
                                            });
                                        }}
                                        className="rounded-2xl bg-orange-600 hover:bg-orange-700 font-black uppercase text-[10px] h-10 px-4"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouveau
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                {(settings.events || []).map((event: any, index: number) => (
                                    <div key={event.id} className="p-6 rounded-[2rem] bg-orange-50/20 border border-orange-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Événement #{index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSettings(s => {
                                                        const events = (s.events || []).filter((e: any) => e.id !== event.id);
                                                        return { ...s, events };
                                                    });
                                                }}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Titre de l'événement</Label>
                                                <Input
                                                    placeholder="ex: Soirée Salsa"
                                                    value={event.title || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], title: val };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                    className="rounded-xl border-orange-100 h-10 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Date ou Période</Label>
                                                <Input
                                                    placeholder="ex: Vendredi 15 Janvier - 20h"
                                                    value={event.date || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], date: val };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                    className="rounded-xl border-orange-100 h-10 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description courte</Label>
                                                <Textarea
                                                    placeholder="Décrivez l'événement..."
                                                    value={event.description || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], description: val };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                    className="rounded-xl border-orange-100 min-h-[80px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Lien (Social Media/Plus d'infos)</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={event.link || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], link: val };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                    className="rounded-xl border-orange-100 h-10 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Photo de l'événement</Label>
                                                <ImageUpload
                                                    label="Cliquer pour ajouter une photo"
                                                    id={`event-upload-${event.id}`}
                                                    defaultImage={event.image_url}
                                                    onImageUploaded={(url) => {
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], image_url: url };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                    onImageRemoved={() => {
                                                        setSettings(s => {
                                                            const events = [...(s.events || [])];
                                                            events[index] = { ...events[index], image_url: '' };
                                                            return { ...s, events };
                                                        });
                                                    }}
                                                />
                                            </div>
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
                    )}
                </div>

                {/* Right Column: Visuals & Currency */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-8">
                            <CardTitle className="text-xl font-black">Design & Devise</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Images</Label>
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
                        <CardFooter className="p-6 pt-0">
                            <Button type="submit" className="w-full rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest" disabled={isPending}>
                                {isPending ? 'Enregistrement...' : 'Mettre à jour'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
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
