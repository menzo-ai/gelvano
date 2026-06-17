import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registerSchema } from '@/lib/validations'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = body

    // Check if user already exists in Supabase Auth
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuth?.users.some(u => u.email === email)

    if (userExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const isFirstUser = (count || 0) === 0
    const role = isFirstUser ? 'SUPER_ADMIN' : 'STUDENT'

    // Create user with Supabase Auth (sends confirmation email)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: isFirstUser, // Auto-confirm first admin
      user_metadata: {
        name,
        role,
        is_verified: isFirstUser
      }
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // If not first user (student), send confirmation email
    if (!isFirstUser && data.user) {
      // Also create user record in our users table
      await supabaseAdmin
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          role,
          is_verified: false,
          school_year: 1
        })
    }

    return NextResponse.json({
      message: isFirstUser
        ? 'Account created successfully!'
        : 'Account created! Please verify your email via the link sent to your inbox.',
      userId: data.user?.id,
      requiresVerification: !isFirstUser,
      email,
      isAdmin: isFirstUser
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const canRegister = (count || 0) === 0
    
    return NextResponse.json({
      canRegister,
      message: canRegister
        ? 'First account - will be admin'
        : 'Students can register'
    })
  } catch {
    return NextResponse.json({
      canRegister: true,
      message: 'System ready for registration'
    })
  }
}
