import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const email = searchParams.get('email') || ''

    if (!tokenHash) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Verify using Supabase client-side auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await supabase.auth.verifyOtp({
      type: 'email',
      email,
      token: tokenHash
    })

    if (error) {
      console.error('Verify error:', error)
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    return NextResponse.redirect(new URL('/verify-email?success=true', request.url))
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url))
  }
}
