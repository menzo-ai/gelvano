import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, confirmPassword } = body

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'كلمات المرور غير متطابقة' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    const role = isFirstUser ? 'SUPER_ADMIN' : 'STUDENT'

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isVerified: isFirstUser, // Auto-verify first admin
        schoolYear: 1
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: JSON.stringify({ method: 'email', role })
      }
    })

    return NextResponse.json({
      message: isFirstUser
        ? 'تم إنشاء الحساب بنجاح!'
        : 'تم إنشاء الحساب! يرجى تفعيل حسابك.',
      userId: user.id,
      requiresVerification: !isFirstUser,
      email,
      isAdmin: isFirstUser
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'فشل في التسجيل' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const canRegister = userCount === 0
    
    return NextResponse.json({
      canRegister,
      message: canRegister
        ? 'First account - will be admin'
        : 'Students can register'
    })
  } catch {
    return NextResponse.json({
      canRegister: true,
      message: 'System ready for registration'
    })
  }
}
