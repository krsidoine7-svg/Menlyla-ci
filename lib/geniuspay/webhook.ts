// GeniusPay Webhook Handling
// Verifies webhook signatures and processes payment events

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export interface GeniusPayWebhookEvent {
    event: 'payment.initiated' | 'payment.success' | 'payment.failed' | 'payment.cancelled' | 'payment.refunded' | 'payment.expired' | 'webhook.test'
    data: {
        id: number
        reference: string
        amount: number
        fees: number
        net_amount: number
        currency: string
        status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'expired'
        payment_method?: string
        gateway?: string
        customer?: {
            name: string
            email?: string
            phone: string
        }
        metadata?: Record<string, any>
        created_at: string
        confirmed_at?: string
    }
    timestamp: string
}

/**
 * Verify webhook signature from GeniusPay
 * @param payload Raw webhook payload as string
 * @param signature Signature from X-Webhook-Signature header
 * @param secret Webhook secret from GeniusPay dashboard
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string,
    secret: string
): boolean {
    try {
        // GeniusPay uses HMAC-SHA256(timestamp + "." + json_payload, secret)
        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(`${timestamp}.${payload}`)
        const expectedSignature = hmac.digest('hex')

        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )
    } catch (error) {
        console.error('Webhook signature verification failed:', error)
        return false
    }
}

/**
 * Handle GeniusPay webhook events
 * Updates payment and order status based on payment events
 */
export async function handleWebhookEvent(event: GeniusPayWebhookEvent): Promise<void> {
    const supabase = await createClient()
    const { event: eventType, data: payment } = event

    console.log(`[GeniusPay Webhook] Received event: ${eventType} for payment ${payment.reference}`)

    // Handle test webhook
    if (eventType === 'webhook.test') {
        console.log('[GeniusPay Webhook] Test event received and verified')
        return
    }

    try {
        // Check if payment already exists (idempotency)
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('id, status')
            .eq('geniuspay_reference', payment.reference)
            .single()

        if (existingPayment && existingPayment.status === 'success') {
            console.log(`[GeniusPay Webhook] Payment ${payment.reference} already processed, skipping`)
            return
        }

        // Map GeniusPay status to our payment_status enum
        const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'refunded'> = {
            pending: 'pending',
            success: 'success',
            failed: 'failed',
            cancelled: 'failed',
            refunded: 'refunded',
            expired: 'failed',
        }

        const mappedStatus = statusMap[payment.status] || 'pending'

        // Update or insert payment record
        const paymentData = {
            geniuspay_reference: payment.reference,
            geniuspay_payment_id: payment.id,
            amount: payment.amount,
            fees: payment.fees,
            net_amount: payment.net_amount,
            currency: payment.currency,
            status: mappedStatus,
            gateway: payment.gateway,
            payment_method_detail: payment.payment_method,
            confirmed_at: payment.confirmed_at ? new Date(payment.confirmed_at).toISOString() : null,
            provider: 'GENIUSPAY' as const,
            // NEW: Enhanced tracking columns
            webhook_payload: event,
            webhook_received_at: new Date().toISOString(),
            webhook_event_type: eventType
        }

        if (existingPayment) {
            // Update existing payment
            const { error: updateError } = await supabase
                .from('payments')
                .update(paymentData)
                .eq('id', existingPayment.id)

            if (updateError) {
                console.error('[GeniusPay Webhook] Failed to update payment:', updateError)
                throw updateError
            }

            console.log(`[GeniusPay Webhook] Updated payment ${payment.reference}`)
        } else {
            // Try to find the order or restaurant from metadata
            const orderId = payment.metadata?.order_id
            const restaurantId = payment.metadata?.restaurant_id
            const type = payment.metadata?.type

            if (!orderId && !restaurantId) {
                console.error('[GeniusPay Webhook] No order_id or restaurant_id in payment metadata')
                return
            }

            // Create new payment record
            const { error: insertError } = await supabase
                .from('payments')
                .insert({
                    ...paymentData,
                    order_id: orderId || null,
                    restaurant_id: restaurantId || null,
                })

            if (insertError) {
                console.error('[GeniusPay Webhook] Failed to create payment:', insertError)
                throw insertError
            }

            console.log(`[GeniusPay Webhook] Created payment ${payment.reference}`)
        }

        // 3. Handle specific event logic (Activation, Order status, etc.)
        if (eventType === 'payment.success') {
            const orderId = payment.metadata?.order_id
            const restaurantId = payment.metadata?.restaurant_id
            const type = payment.metadata?.type

            // Activate restaurant if onboarding or subscription payment
            if ((type === 'onboarding' || type === 'subscription') && restaurantId) {
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 30) // Default 30 days

                const { error: restaurantError } = await supabase
                    .from('restaurants')
                    .update({ 
                        subscription_status: 'active',
                        subscription_expires_at: expiresAt.toISOString()
                    })
                    .eq('id', restaurantId)

                if (restaurantError) {
                    console.error('[GeniusPay Webhook] Failed to update restaurant subscription:', restaurantError)
                } else {
                    console.log(`[GeniusPay Webhook] Restaurant ${restaurantId} subscription updated. Expires: ${expiresAt.toISOString()}`)
                }
            }

            if (orderId) {
                const { error: orderError } = await supabase
                    .from('orders')
                    .update({ status: 'confirmed' })
                    .eq('id', orderId)

                if (orderError) {
                    console.error('[GeniusPay Webhook] Failed to update order status:', orderError)
                } else {
                    console.log(`[GeniusPay Webhook] Order ${orderId} marked as confirmed`)
                }
            }
        } else if (eventType === 'payment.failed' || eventType === 'payment.cancelled') {
            const orderId = payment.metadata?.order_id

            if (orderId) {
                const { error: orderError } = await supabase
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', orderId)

                if (orderError) {
                    console.error('[GeniusPay Webhook] Failed to update order status:', orderError)
                } else {
                    console.log(`[GeniusPay Webhook] Order ${orderId} marked as cancelled`)
                }
            }
        }

    } catch (error) {
        console.error('[GeniusPay Webhook] Error processing webhook:', error)
        throw error
    }
}
