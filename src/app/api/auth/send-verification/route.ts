import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة تفعيل'
      })
    }

    if (user.isVerified) {
      return NextResponse.json({
        success: true,
        message: 'الحساب مفعل مسبقاً'
      })
    }

    // Generate verification token
    const crypto = await import('crypto')
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: verificationToken,
        resetExpiry: expiry
      }
    })

    // In production, send email with verification link
    console.log(`Verification token for ${email}: ${verificationToken}`)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط التفعيل',
      // Remove this in production
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إرسال رابط التفعيل' },
      { status: 500 }
    )
  }
}
