// This file provides Supabase authentication helpers
// If Supabase is not configured, these functions will return appropriate errors

import prisma from './prisma'
import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// If Supabase is configured, use it; otherwise use Prisma-based auth
export async function signUpWithEmail(email: string, password: string, name: string, phone?: string) {
  if (!isSupabaseConfigured()) {
    // Use Prisma-based registration
    const hashedPassword = await hash(password, 12)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return { data: null, error: { message: 'Email already registered' } }
    }
    
    // Check if first user (becomes admin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    const role = isFirstUser ? 'SUPER_ADMIN' : 'STUDENT'
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        isVerified: isFirstUser,
        schoolYear: 1
      }
    })
    
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        session: null
      },
      error: null
    }
  }
  
  // Use Supabase (import dynamically to avoid issues at build time)
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAuth = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { autoRefreshToken: true, persistSession: true }
  })
  
  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role: 'STUDENT', school_year: 1, is_verified: false }
    }
  })
  
  return { data, error }
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    // Use Prisma-based login
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return { data: null, error: { message: 'Invalid credentials' } }
    }
    
    const isValid = await compare(password, user.password)
    
    if (!isValid) {
      return { data: null, error: { message: 'Invalid credentials' } }
    }
    
    if (!user.isActive) {
      return { data: null, error: { message: 'Account is inactive' } }
    }
    
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        session: null
      },
      error: null
    }
  }
  
  // Use Supabase
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAuth = createClient(supabaseUrl!, supabaseAnonKey!)
  
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAuth = createClient(supabaseUrl!, supabaseAnonKey!)
  
  const { error } = await supabaseAuth.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  // Generate reset token and save to database
  const token = randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetExpiry: expiry
    }
  })
  
  // In production, send email with reset link
  console.log(`Password reset token for ${email}: ${token}`)
  
  return { data: { token }, error: null }
}

export async function updatePassword(newPassword: string) {
  // This would be called with a reset token
  // Implementation depends on your reset flow
  return { data: null, error: null }
}

export async function getCurrentUser() {
  // This should be used with session context
  return null
}

export async function getSession() {
  // This should be used with session context
  return null
}

export async function sendVerificationEmail(email: string) {
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  await prisma.user.update({
    where: { email },
    data: {
      otpCode: otp,
      otpExpiry: expiry
    }
  })
  
  // In production, send email with OTP
  console.log(`Verification OTP for ${email}: ${otp}`)
  
  return { data: null, error: null }
}

export const supabaseAuth = null // Legacy export, kept for compatibility
