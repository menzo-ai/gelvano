import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSiteConfig } from '@/lib/site-config'
import { getVerificationEmailTemplate, sendEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Check if email settings are configured
    const siteConfig = await getSiteConfig()
    
    if (!siteConfig.emailEnabled) {
      return NextResponse.json(
        { success: false, error: 'خدمة البريد الإلكتروني غير مفعلة' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على مستخدم بهذا البريد' },
        { status: 404 }
      )
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiry
      }
    })

    // Send email with OTP
    const emailTemplate = getVerificationEmailTemplate(otpCode, user.name)
    const emailResult = await sendEmail(siteConfig.emailConfig, email, emailTemplate)

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال كود التحقق بنجاح'
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل إرسال كود التحقق' },
      { status: 500 }
    )
  }
}
