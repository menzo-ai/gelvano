import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const otp = searchParams.get('otp')

    if (!email || !otp) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/verify-email?error=user_not_found', request.url))
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid_otp', request.url))
    }

    // Check if OTP is expired
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.redirect(new URL('/verify-email?error=expired', request.url))
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
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
