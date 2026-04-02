// GeniusPay API Client
// Handles authentication and communication with GeniusPay payment gateway

const GENIUSPAY_BASE_URL = 'https://pay.genius.ci/api/v1/merchant'

export interface GeniusPayPaymentParams {
    amount: number
    currency?: string
    payment_method?: 'wave' | 'orange_money' | 'mtn_money' | 'card'
    description: string
    customer: {
        name: string
        email?: string
        phone: string
    }
    success_url: string
    error_url: string
    metadata?: Record<string, any>
}

export interface GeniusPayPaymentResponse {
    success: boolean
    data: {
        id: number
        reference: string
        amount: number
        fees?: number
        net_amount?: number
        currency: string
        status: 'pending' | 'success' | 'failed' | 'cancelled'
        checkout_url?: string
        payment_url: string
        gateway?: string
        environment: 'sandbox' | 'live'
        expires_at?: string
    }
}

export interface GeniusPayPayment {
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
    expires_at?: string
}

export interface GeniusPayPaymentList {
    success: boolean
    data: GeniusPayPayment[]
    meta: {
        current_page: number
        per_page: number
        total: number
        last_page: number
    }
}

export class GeniusPayClient {
    private apiKey: string
    private apiSecret: string
    private baseUrl: string

    constructor(apiKey?: string, apiSecret?: string) {
        this.apiKey = apiKey || process.env.GENIUSPAY_API_KEY || ''
        this.apiSecret = apiSecret || process.env.GENIUSPAY_API_SECRET || ''
        this.baseUrl = GENIUSPAY_BASE_URL
    }

    /**
     * Make authenticated request to GeniusPay API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('GeniusPay API credentials are required. Set GENIUSPAY_API_KEY and GENIUSPAY_API_SECRET environment variables.')
        }

        const url = `${this.baseUrl}${endpoint}`

        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            'X-API-Secret': this.apiSecret,
            ...options.headers,
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || `GeniusPay API error: ${response.status} ${response.statusText}`
                )
            }

            return data as T
        } catch (error) {
            console.error('GeniusPay API request failed:', error)
            throw error
        }
    }

    /**
     * Initiate a new payment
     * @param params Payment parameters
     * @returns Payment response with checkout URL
     */
    async initiatePayment(params: GeniusPayPaymentParams): Promise<GeniusPayPaymentResponse> {
        return this.request<GeniusPayPaymentResponse>('/payments', {
            method: 'POST',
            body: JSON.stringify({
                amount: params.amount,
                currency: params.currency || 'XOF',
                payment_method: params.payment_method,
                description: params.description,
                customer: params.customer,
                success_url: params.success_url,
                error_url: params.error_url,
                metadata: params.metadata,
            }),
        })
    }

    /**
     * Get payment details by reference
     * @param reference GeniusPay payment reference (e.g., MTX-A1B2C3D4E5)
     * @returns Payment details
     */
    async getPayment(reference: string): Promise<{ success: boolean; data: GeniusPayPayment }> {
        return this.request<{ success: boolean; data: GeniusPayPayment }>(
            `/payments/${reference}`
        )
    }

    /**
     * List all payments with optional filters
     * @param params Query parameters for filtering
     * @returns Paginated list of payments
     */
    async listPayments(params?: {
        page?: number
        per_page?: number
        status?: string
    }): Promise<GeniusPayPaymentList> {
        const queryParams = new URLSearchParams()

        if (params?.page) queryParams.append('page', params.page.toString())
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
        if (params?.status) queryParams.append('status', params.status)

        const query = queryParams.toString()
        const endpoint = query ? `/payments?${query}` : '/payments'

        return this.request<GeniusPayPaymentList>(endpoint)
    }

    /**
     * Get account information
     */
    async getAccount(): Promise<any> {
        return this.request('/account')
    }

    /**
     * Get account balance
     */
    async getBalance(): Promise<any> {
        return this.request('/account/balance')
    }
}

// Export singleton instance for convenience
export const geniuspay = new GeniusPayClient()
