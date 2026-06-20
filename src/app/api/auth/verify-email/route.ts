import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const email = searchParams.get('email') || ''

    if (!code || !email) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Find user and verify OTP
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Check if OTP is valid
    if (user.otpCode !== code || !user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url))
    }

    // Update user as verified and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    })

    return NextResponse.redirect(new URL('/verify-email?success=true', request.url))
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url))
  }
}
