import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETE',
      },
    })

    return NextResponse.json({
      message: 'تم تغيير كلمة المرور بنجاح',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تغيير كلمة المرور' },
      { status: 500 }
    )
  }
}
