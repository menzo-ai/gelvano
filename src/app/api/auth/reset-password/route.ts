import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

// POST - Request password reset
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

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة لاستعادة كلمة المرور'
      })
    }

    // Generate reset token
    const crypto = await import('crypto')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUEST'
      }
    })

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة لاستعادة كلمة المرور',
      // Remove this in production - only for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ أثناء العملية' },
      { status: 500 }
    )
  }
}

// PUT - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'البيانات مطلوبة' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'كلمات المرور غير متطابقة' },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETE'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في تغيير كلمة المرور' },
      { status: 500 }
    )
  }
}
