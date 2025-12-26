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

    useEffect(() => {
        if (state.message && !state.errors) {
            toast.success(state.message)
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state])

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
