import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url))
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        resetToken: null,
        resetExpiry: null
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'VERIFY_EMAIL'
      }
    })

    return NextResponse.redirect(new URL('/verify-email?success=true', request.url))
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url))
  }
}
