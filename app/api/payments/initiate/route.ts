// Payment Initiation API Endpoint
// POST /api/payments/initiate
// Initiates a payment with GeniusPay and returns checkout URL

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeniusPayClient } from '@/lib/geniuspay/client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const { order_id, amount, customer, payment_method } = body

        // Validate required fields
        if (!order_id || !amount || !customer?.name || !customer?.phone) {
            return NextResponse.json(
                { error: 'Missing required fields: order_id, amount, customer.name, customer.phone' },
                { status: 400 }
            )
        }

        // Verify order exists and get restaurant info
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, restaurant_id, total_amount, restaurants(name, slug)')
            .eq('id', order_id)
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Verify amount matches order total
        if (Math.abs(amount - parseFloat(order.total_amount)) > 0.01) {
            return NextResponse.json(
                { error: 'Amount mismatch with order total' },
                { status: 400 }
            )
        }

        // Get app URL for redirects
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const restaurantSlug = (order.restaurants as any)?.slug || 'restaurant'

        // Initialize GeniusPay client
        const geniuspay = new GeniusPayClient()

        // Initiate payment
        const paymentResponse = await geniuspay.initiatePayment({
            amount: Math.round(amount), // Convert to minor units (cents)
            currency: 'XOF',
            payment_method,
            description: `Commande #${order_id.slice(0, 8)} - ${(order.restaurants as any)?.name || 'Restaurant'}`,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
            success_url: `${appUrl}/payment/success?order_id=${order_id}`,
            error_url: `${appUrl}/payment/error?order_id=${order_id}`,
            metadata: {
                order_id: order.id,
                restaurant_id: order.restaurant_id,
                restaurant_slug: restaurantSlug,
            },
        })

        if (!paymentResponse.success) {
            return NextResponse.json(
                { error: 'Failed to initiate payment' },
                { status: 500 }
            )
        }

        // Create payment record in database
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: order.id,
                restaurant_id: order.restaurant_id,
                amount: paymentResponse.data.amount,
                currency: paymentResponse.data.currency,
                geniuspay_reference: paymentResponse.data.reference,
                geniuspay_payment_id: paymentResponse.data.id,
                checkout_url: paymentResponse.data.checkout_url || paymentResponse.data.payment_url,
                fees: paymentResponse.data.fees || 0,
                net_amount: paymentResponse.data.net_amount,
                gateway: paymentResponse.data.gateway,
                environment: paymentResponse.data.environment,
                status: 'pending',
                provider: 'GENIUSPAY',
                expires_at: paymentResponse.data.expires_at,
            })

        if (paymentError) {
            console.error('Failed to create payment record:', paymentError)
            // Don't fail the request, payment was initiated successfully
        }

        // Return checkout URL to client
        return NextResponse.json({
            success: true,
            checkout_url: paymentResponse.data.checkout_url || paymentResponse.data.payment_url,
            reference: paymentResponse.data.reference,
        })

    } catch (error) {
        console.error('Payment initiation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
