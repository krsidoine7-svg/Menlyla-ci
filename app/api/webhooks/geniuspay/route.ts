// GeniusPay Webhook Receiver
// POST /api/webhooks/geniuspay
// Receives and processes payment status updates from GeniusPay

import { NextRequest, NextResponse } from 'next/server'
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

        // Get raw body for signature verification
        const rawBody = await request.text()

        // Verify webhook signature
        const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET || ''

        if (!webhookSecret) {
            console.error('[Webhook] GENIUSPAY_WEBHOOK_SECRET not configured')
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

        if (!isValid) {
            console.error('[Webhook] Invalid signature')
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            )
        }

        // Parse webhook payload
        const event: GeniusPayWebhookEvent = JSON.parse(rawBody)

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
