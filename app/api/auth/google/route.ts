import { getGoogleAuthClient, SCOPES } from '@/lib/google-auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const client = getGoogleAuthClient()

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    })

    return NextResponse.redirect(url)
}
