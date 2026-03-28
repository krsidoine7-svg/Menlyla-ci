'use client'

import { useState } from 'react'
import { User, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'

type PassportProps = {
    profileImage?: string
    fullName: string
    bio: string
    socialLinks?: {
        whatsapp?: string
        instagram?: string
        facebook?: string
        linkedin?: string
    }
    customLinks?: {
        label: string
        url: string
    }[]
    phone?: string
    email?: string
    reviews?: any[]
    bannerImage?: string
}

export function PassportCard({
    profileImage,
    fullName,
    bio,
    socialLinks,
    customLinks,
    phone,
    email,
    reviews,
    bannerImage
}: PassportProps) {
    const [isSharing, setIsSharing] = useState(false)

    const handleAddToContacts = () => {
        // Create vCard
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
${phone ? `TEL:${phone}` : ''}
${email ? `EMAIL:${email}` : ''}
NOTE:${bio}
END:VCARD`

        const blob = new Blob([vCard], { type: 'text/vcard' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${fullName}.vcf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleShareContacts = async () => {
        setIsSharing(true)
        try {
            if (navigator.share) {
                await navigator.share({
                    title: fullName,
                    text: bio,
                    url: window.location.href
                })
            } else {
                // Fallback: copy link to clipboard
                await navigator.clipboard.writeText(window.location.href)
                alert('Lien copié dans le presse-papier!')
            }
        } catch (error) {
            console.error('Error sharing:', error)
        } finally {
            setIsSharing(false)
        }
    }

    return (
        <div className="max-w-sm mx-auto bg-gradient-to-br from-slate-50 to-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
            {/* Banner Image */}
            <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                {bannerImage ? (
                    <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-900 shadow-inner opacity-20" />
                )}
            </div>

            {/* Header with logo and profile */}
            <div className="bg-white p-6 relative -mt-10 pt-0">
                <div className="flex items-end gap-4 mb-6 relative z-10">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {profileImage ? (
                                <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logo and Name */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="text-3xl font-black tracking-tight">Ofika</div>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{fullName}</p>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {bio}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleAddToContacts}
                        className="w-full bg-black hover:bg-slate-800 text-white font-medium py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Ajouter aux contacts
                    </Button>
                </div>
            </div>

            {/* Social Links */}
            {socialLinks && (
                <div className="px-6 py-4 bg-white border-t border-slate-100">
                    <div className="flex justify-center gap-4">
                        {socialLinks.whatsapp && (
                            <a
                                href={socialLinks.whatsapp.startsWith('http') || socialLinks.whatsapp.startsWith('wa.me')
                                    ? socialLinks.whatsapp.startsWith('wa.me') ? `https://${socialLinks.whatsapp}` : socialLinks.whatsapp
                                    : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                            >
                                <FaWhatsapp className="w-6 h-6" />
                            </a>
                        )}
                        {socialLinks.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                            >
                                <FaInstagram className="w-6 h-6" />
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a
                                href={socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                            >
                                <FaFacebook className="w-6 h-6" />
                            </a>
                        )}
                        {socialLinks.linkedin && (
                            <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                            >
                                <FaLinkedin className="w-6 h-6" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Links */}
            {customLinks && customLinks.length > 0 && (
                <div className="px-6 py-4 space-y-2 bg-slate-50">
                    {customLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all hover:shadow-md group"
                        >
                            <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">
                                {link.label}
                            </span>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                        </a>
                    ))}
                </div>
            )}

            {/* Reviews Section */}
            {reviews && reviews.length > 0 && (
                <div className="px-6 py-6 border-t border-slate-100 bg-white">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <div className="h-1 w-4 bg-orange-500 rounded-full" />
                        Derniers Avis
                    </h3>
                    <div className="space-y-4">
                        {reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-800">{review.customer_name}</span>
                                    <div className="flex gap-0.5 text-orange-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-[8px] ${i < review.rating ? 'fill-current' : 'opacity-20'}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 italic leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
