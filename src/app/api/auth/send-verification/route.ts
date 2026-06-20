import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save OTP to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiry
      }
    })

    // TODO: Send email with OTP code
    // For now, return success (in production, integrate with email service)
    console.log(`OTP for ${email}: ${otpCode}`)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح'
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إرسال رمز التحقق' },
      { status: 500 }
    )
  }
}
