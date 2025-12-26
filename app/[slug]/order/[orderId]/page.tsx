import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ slug: string, orderId: string }> }) {
    const { slug, orderId } = await params

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-12 w-12" />
            </div>

            <div>
                <h1 className="text-2xl font-bold">Commande Reçue !</h1>
                <p className="text-muted-foreground mt-2">
                    Votre commande #{orderId.slice(0, 8)} a bien été transmise en cuisine.
                </p>
            </div>

            <Link href={`/${slug}`}>
                <Button variant="outline">Retour au menu</Button>
            </Link>
        </div>
    )
}
