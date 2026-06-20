import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry
      }
    })

    // TODO: Send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط استعادة كلمة المرور بنجاح'
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إرسال رابط الاستعادة' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { newPassword, resetToken } = await request.json()

    if (!newPassword || !resetToken) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'رابط الاستعادة غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    })
  } catch (error: any) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في تغيير كلمة المرور' },
      { status: 500 }
    )
  }
}
