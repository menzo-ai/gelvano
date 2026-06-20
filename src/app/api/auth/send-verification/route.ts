import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Send magic link for email verification
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (error) {
      console.error('Send verification error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link sent successfully'
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send verification' },
      { status: 500 }
    )
  }
}
