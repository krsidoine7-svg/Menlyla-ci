'use client'

import { User } from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

type OwnerPassportProps = {
    passport: {
        profile_image?: string
        full_name: string
        bio: string
        social_links?: {
            whatsapp?: string
            instagram?: string
            facebook?: string
            linkedin?: string
        }
        phone?: string
        email?: string
    }
}

export function OwnerPassportSection({ passport }: OwnerPassportProps) {
    const handleAddToContacts = () => {
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${passport.full_name}
${passport.phone ? `TEL:${passport.phone}` : ''}
${passport.email ? `EMAIL:${passport.email}` : ''}
NOTE:${passport.bio}
END:VCARD`

        const blob = new Blob([vCard], { type: 'text/vcard' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${passport.full_name}.vcf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {passport.profile_image ? (
                                <img
                                    src={passport.profile_image}
                                    alt={passport.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight text-slate-800">
                            {passport.full_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Propriétaire</p>
                    </div>
                </div>

                {/* Bio */}
                {passport.bio && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {passport.bio}
                    </p>
                )}

                {/* Contact Button */}
                <Button
                    onClick={handleAddToContacts}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    <User className="w-4 h-4 mr-2" />
                    Ajouter aux contacts
                </Button>

                {/* Social Links */}
                {passport.social_links && Object.keys(passport.social_links).length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Suivez-moi
                        </p>
                        <div className="flex justify-center gap-3">
                            {passport.social_links.whatsapp && (
                                <a
                                    href={passport.social_links.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                                >
                                    <FaWhatsapp className="w-5 h-5" />
                                </a>
                            )}
                            {passport.social_links.instagram && (
                                <a
                                    href={passport.social_links.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                                >
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                            )}
                            {passport.social_links.facebook && (
                                <a
                                    href={passport.social_links.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                                >
                                    <FaFacebook className="w-5 h-5" />
                                </a>
                            )}
                            {passport.social_links.linkedin && (
                                <a
                                    href={passport.social_links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                                >
                                    <FaLinkedin className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
