'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Validate inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const validated = schema.safeParse(data)
    if (!validated.success) {
        return { error: 'Invalid inputs' }
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    const plan = formData.get('plan') as string
    const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

    revalidatePath('/', 'layout')
    redirect(plan ? `${redirectTo}?plan=${plan}` : redirectTo)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Validate inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const validated = schema.safeParse(data)
    if (!validated.success) {
        return { error: 'Invalid inputs' }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    const plan = formData.get('plan') as string
    const redirectTo = (formData.get('redirectTo') as string) || '/login'
    
    // Construct current redirect URL based on context
    let redirectUrl = `${redirectTo}?message=Check email to continue sign in process`
    if (plan) redirectUrl += `&plan=${plan}`

    revalidatePath('/', 'layout')
    redirect(redirectUrl)
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}
