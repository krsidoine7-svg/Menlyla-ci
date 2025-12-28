'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Star, Trash2, User, Clock, Utensils, Reply, Send, X, CheckCheck, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { deleteReview, replyToReview, updateReviewStatus } from '../review-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
    initialReviews: any[]
}

export function ReviewModeration({ initialReviews }: Props) {
    const [reviews, setReviews] = useState(initialReviews)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [loading, setLoading] = useState(false)

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return

        try {
            await deleteReview(id)
            setReviews(reviews.filter(r => r.id !== id))
            toast.success("Avis supprimé")
        } catch (error: any) {
            toast.error("Erreur lors de la suppression")
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            await updateReviewStatus(id, newStatus)
            setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r))
            toast.success(newStatus === 'approved' ? "Avis approuvé et publié" : "Avis rejeté et masqué")
        } catch (error: any) {
            toast.error("Erreur lors de la mise à jour")
        }
    }

    const handleSendReply = async (id: string) => {
        if (!replyText.trim()) return
        setLoading(true)
        try {
            await replyToReview(id, replyText)
            setReviews(reviews.map(r => r.id === id ? { ...r, owner_reply: replyText } : r))
            setReplyingTo(null)
            setReplyText('')
            toast.success("Réponse envoyée")
        } catch (error: any) {
            toast.error("Erreur lors de l'envoi")
        } finally {
            setLoading(false)
        }
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-[3rem] bg-muted/20 opacity-60">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-bold">Aucun avis pour le moment.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
                <Card key={review.id} className={cn(
                    "rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden group flex flex-col h-full transition-all duration-300",
                    review.status === 'pending' && "ring-2 ring-orange-500/20 bg-orange-50/10",
                    review.status === 'rejected' && "opacity-60 saturate-50"
                )}>
                    <CardContent className="p-6 space-y-4 flex-1">
                        {/* Status Header */}
                        <div className="flex justify-between items-center mb-2">
                            {review.status === 'pending' && (
                                <Badge className="bg-orange-500 text-white border-none text-[8px] font-black uppercase px-2 py-0.5">
                                    En attente
                                </Badge>
                            )}
                            {review.status === 'approved' && (
                                <Badge className="bg-green-500 text-white border-none text-[8px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                    <Eye className="h-2.5 w-2.5" /> Public
                                </Badge>
                            )}
                            {review.status === 'rejected' && (
                                <Badge className="bg-slate-500 text-white border-none text-[8px] font-black uppercase px-2 py-0.5 flex items-center gap-1">
                                    <EyeOff className="h-2.5 w-2.5" /> Masqué
                                </Badge>
                            )}
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm uppercase tracking-tight truncate max-w-[120px]">
                                        {review.customer_name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                            <Clock className="h-3 w-3" />
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                        {review.is_verified && (
                                            <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 text-[8px] font-black uppercase px-2 py-0">
                                                <CheckCheck className="h-2.5 w-2.5 mr-1" /> Vérifié
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-destructive hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(review.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "h-4 w-4",
                                        review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted/20"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Review Photos */}
                        {review.image_urls && review.image_urls.length > 0 && (
                            <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
                                {review.image_urls.map((url: string, i: number) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt="Review photo"
                                        className="h-20 w-20 rounded-2xl object-cover border border-muted"
                                    />
                                ))}
                            </div>
                        )}

                        <p className="text-sm font-medium leading-relaxed italic text-slate-700">
                            "{review.comment}"
                        </p>

                        {review.dishes?.name && (
                            <div className="flex items-center gap-2 pt-3 border-t">
                                <Utensils className="h-3 w-3 text-orange-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                                    Plat : {review.dishes.name}
                                </span>
                            </div>
                        )}

                        {review.owner_reply && (
                            <div className="bg-orange-50/50 rounded-2xl p-4 mt-2 space-y-1 relative border border-orange-100">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-600 mb-1">
                                    <Reply className="h-3 w-3" /> Votre réponse
                                </div>
                                <p className="text-xs font-semibold text-orange-900 leading-relaxed">
                                    {review.owner_reply}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    {/* Moderation Controls */}
                    <div className="px-4 py-3 bg-muted/20 border-t flex gap-2">
                        {review.status !== 'approved' && (
                            <Button
                                size="sm"
                                className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase"
                                onClick={() => handleUpdateStatus(review.id, 'approved')}
                            >
                                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Approuver
                            </Button>
                        )}
                        {review.status !== 'rejected' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl border-slate-200 text-slate-600 text-[10px] font-black uppercase"
                                onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            >
                                <ShieldAlert className="h-3.5 w-3.5 mr-2" /> Masquer
                            </Button>
                        )}
                    </div>

                    {/* Footer for Replying */}
                    <div className="p-4 bg-muted/30 border-t">
                        {replyingTo === review.id ? (
                            <div className="flex gap-2 items-center">
                                <Input
                                    placeholder="Votre réponse..."
                                    className="bg-white rounded-xl h-9 text-xs border-none shadow-sm"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    autoFocus
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-xl bg-orange-600 hover:bg-orange-700 shrink-0"
                                    onClick={() => handleSendReply(review.id)}
                                    disabled={loading || !replyText.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl shrink-0"
                                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 h-9 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
                                onClick={() => {
                                    setReplyingTo(review.id)
                                    setReplyText(review.owner_reply || '')
                                }}
                            >
                                <Reply className="h-4 w-4" />
                                {review.owner_reply ? "Modifier la réponse" : "Répondre"}
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    )
}
