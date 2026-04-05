"use client";

import { useState } from "react";
import { 
    MessageSquare, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Star, 
    Store, 
    User,
    Calendar,
    UtensilsCrossed,
    SearchX,
    Loader2,
    Reply
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { adminDeleteReview, adminUpdateReviewStatus, adminReplyToReview } from "@/app/(super-admin)/admin/actions";

interface GlobalReviewModerationProps {
    initialReviews: any[];
}

export function GlobalReviewModeration({ initialReviews }: GlobalReviewModerationProps) {
    const [reviews, setReviews] = useState(initialReviews);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setIsProcessing(id);
        const res = await adminUpdateReviewStatus(id, status);
        if (res.success) {
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            toast.success(`Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`);
        } else {
            toast.error(res.error || "Erreur de mise à jour");
        }
        setIsProcessing(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer définitivement cet avis ?")) return;
        setIsProcessing(id);
        const res = await adminDeleteReview(id);
        if (res.success) {
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success("Avis supprimé définitivement");
        } else {
            toast.error(res.error || "Erreur de suppression");
        }
        setIsProcessing(null);
    };

    const handleSendReply = async (id: string) => {
        if (!replyText.trim()) return;
        setIsProcessing(id);
        const res = await adminReplyToReview(id, replyText);
        if (res.success) {
            setReviews(prev => prev.map(r => r.id === id ? { 
                ...r, 
                platform_reply: replyText, 
                platform_replied_at: new Date().toISOString() 
            } : r));
            toast.success("Votre réponse officielle a été publiée");
            setReplyingTo(null);
            setReplyText("");
        } else {
            toast.error(res.error || "Erreur lors de l'envoi");
        }
        setIsProcessing(null);
    };

    if (reviews.length === 0) {
        return (
            <div className="py-32 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 text-center">
                <SearchX className="h-20 w-20 text-white/5 mb-6" />
                <h3 className="text-2xl font-bold text-white/20 italic tracking-tight">Aucun avis client</h3>
                <p className="text-white/10 text-xs font-medium uppercase tracking-widest mt-2">La plateforme est calme pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {reviews.map((review) => (
                <div key={review.id} className={cn(
                    "group relative overflow-hidden rounded-[3rem] border border-white/10 p-8 pt-10 transition-all duration-500 bg-black/40 backdrop-blur-xl",
                    review.status === 'rejected' && "opacity-60 bg-red-600/5",
                    review.status === 'approved' && "border-emerald-500/10"
                )}>
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-red-600/10 transition-all" />

                    <div className="relative z-10 space-y-8">
                        {/* Header: Restaurant & User */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:rotate-3 transition-transform duration-500">
                                    <Store className="h-8 w-8 text-white/20 group-hover:text-red-500 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold text-white italic tracking-tight">{review.restaurants?.name}</h4>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
                                        <User className="h-3.5 w-3.5 text-red-600" /> {review.customer_name}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 text-right">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn(
                                            "h-4 w-4",
                                            i < review.rating ? "text-red-600 fill-red-600 shadow-pulse" : "text-white/10"
                                        )} />
                                    ))}
                                </div>
                                <Badge className={cn(
                                    "font-black text-[9px] py-1 px-3 rounded-full italic tracking-widest",
                                    review.status === 'approved' ? "bg-emerald-600 text-white" : 
                                    review.status === 'rejected' ? "bg-red-600 text-white" : "bg-white/10 text-white/40"
                                )}>
                                    {review.status ? review.status.toUpperCase() : 'PENDING'}
                                </Badge>
                            </div>
                        </div>

                        {/* Content: Comment & Dish */}
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                            <p className="text-white/80 font-medium italic text-sm leading-relaxed">
                                "{review.comment}"
                            </p>
                            {review.dishes && (
                                <div className="pt-4 border-t border-white/5 flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest italic">
                                    <UtensilsCrossed className="h-3.5 w-3.5 text-red-600" /> {review.dishes.name}
                                </div>
                            )}

                            {/* Platform Reply Existing */}
                            {review.platform_reply && (
                                <div className="mt-6 p-5 rounded-2xl bg-red-600/10 border border-red-600/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-red-600 text-white font-black text-[8px] uppercase tracking-widest italic">Menlyla Team</Badge>
                                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{new Date(review.platform_replied_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-white/60 text-xs font-medium italic leading-relaxed">
                                        "{review.platform_reply}"
                                    </p>
                                </div>
                            )}

                            {/* Reply Input */}
                            {replyingTo === review.id ? (
                                <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <Textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Votre réponse officielle en tant qu'admin..."
                                        className="bg-black/40 border-white/5 rounded-2xl text-white text-xs p-5 focus:border-red-600 min-h-[100px]"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button 
                                            onClick={() => setReplyingTo(null)}
                                            variant="ghost" 
                                            className="h-9 px-4 rounded-xl text-white/20 text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Annuler
                                        </Button>
                                        <Button 
                                            onClick={() => handleSendReply(review.id)}
                                            disabled={isProcessing === review.id || !replyText.trim()}
                                            className="h-9 px-6 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-600/20"
                                        >
                                            {isProcessing === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Envoyer la réponse"}
                                        </Button>
                                    </div>
                                </div>
                            ) : !review.platform_reply && (
                                <div className="pt-2">
                                    <Button 
                                        onClick={() => {setReplyingTo(review.id); setReplyText("")}}
                                        variant="ghost" 
                                        className="h-10 px-4 rounded-xl text-white/20 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest italic gap-2"
                                    >
                                        <Reply className="h-3.5 w-3.5" /> Répondre officiellement
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer: Date & Actions */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3 text-[10px] font-black text-white/10 uppercase tracking-widest">
                                <Calendar className="h-3.5 w-3.5" /> {new Date(review.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-3">
                                {review.status !== 'approved' && (
                                    <Button 
                                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                                        disabled={isProcessing === review.id}
                                        variant="outline" 
                                        className="h-11 px-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approuver
                                    </Button>
                                )}
                                {review.status !== 'rejected' && (
                                    <Button 
                                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                        disabled={isProcessing === review.id}
                                        variant="outline" 
                                        className="h-11 px-6 rounded-2xl border-white/10 bg-white/5 text-white/40 font-bold text-[9px] uppercase tracking-widest hover:bg-red-600/10 hover:text-red-500 transition-all"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" /> Rejeter
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => handleDelete(review.id)}
                                    disabled={isProcessing === review.id}
                                    variant="ghost" 
                                    className="h-11 w-11 p-0 rounded-2xl text-white/10 hover:text-red-600 hover:bg-red-600/10 transition-all border border-transparent hover:border-red-600/20"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
