// GeniusPay Webhook Receiver
// POST /api/webhooks/geniuspay
// Receives and processes payment status updates from GeniusPay

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, handleWebhookEvent, type GeniusPayWebhookEvent } from '@/lib/geniuspay/webhook'

export async function POST(request: NextRequest) {
    try {
        // Get webhook signature from headers
        const signature = request.headers.get('x-webhook-signature')
        const timestamp = request.headers.get('x-webhook-timestamp')
        const eventType = request.headers.get('x-webhook-event')

        if (!signature) {
            console.error('[Webhook] Missing signature header')
            return NextResponse.json(
                { error: 'Missing webhook signature' },
                { status: 401 }
            )
        }

        // Get raw body for parsing and verification
        const rawBody = await request.text()
        
        // Parse webhook payload UNVERIFIED first to find context (restaurant_id)
        let unverifiedEvent: GeniusPayWebhookEvent
        try {
            unverifiedEvent = JSON.parse(rawBody)
        } catch (e) {
            console.error('[Webhook] Failed to parse payload')
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        // Determine which webhook secret to use
        let webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET || ''
        const restaurantId = unverifiedEvent.data?.metadata?.restaurant_id
        
        if (restaurantId) {
            // Find restaurant-specific secret
            const supabase = await createClient()
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('geniuspay_webhook_secret')
                .eq('id', restaurantId)
                .single()
            
            if (restaurant?.geniuspay_webhook_secret) {
                webhookSecret = restaurant.geniuspay_webhook_secret
            }
        }

        if (!webhookSecret) {
            console.error('[Webhook] No webhook secret found for this context')
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            )
        }

        if (!timestamp) {
            console.error('[Webhook] Missing timestamp header')
            return NextResponse.json(
                { error: 'Missing webhook timestamp' },
                { status: 401 }
            )
        }

        const isValid = verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret)

        if (!isValid && restaurantId && process.env.GENIUSPAY_WEBHOOK_SECRET) {
             // Fallback: Try platform secret if restaurant secret failed (might happen during migration)
             const isPlatformValid = verifyWebhookSignature(rawBody, signature, timestamp, process.env.GENIUSPAY_WEBHOOK_SECRET)
             if (isPlatformValid) {
                 console.log('[Webhook] Valid with platform secret fallback')
             } else {
                 console.error('[Webhook] Invalid signature (tried both restaurant and platform)')
                 return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
             }
        } else if (!isValid) {
            console.error('[Webhook] Invalid signature')
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            )
        }

        // Use the verified event
        const event = unverifiedEvent

        console.log(`[Webhook] Verified event: ${event.event} for payment ${event.data.reference}`)

        // Handle the webhook event
        await handleWebhookEvent(event)

        // Return 200 to acknowledge receipt
        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('[Webhook] Processing error:', error)

        // Return 500 so GeniusPay will retry
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs'
