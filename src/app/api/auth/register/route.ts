import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { registerSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { getSiteConfig } from '@/lib/site-config'

const prisma = new PrismaClient()

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

    const { name, email, password } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل بالفعل' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    const role = isFirstUser ? 'SUPER_ADMIN' : 'STUDENT'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: isFirstUser, // Auto-verify first admin
        schoolYear: 1
      }
    })

    // Check if email is enabled and send verification if needed
    const siteConfig = await getSiteConfig()
    let requiresVerification = false

    if (!isFirstUser && siteConfig.emailEnabled) {
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode,
          otpExpiry
        }
      })

      requiresVerification = true
    }

    return NextResponse.json({
      message: isFirstUser
        ? 'تم إنشاء حسابك بنجاح!'
        : requiresVerification
          ? 'تم إنشاء حسابك! يرجى التحقق من بريدك الإلكتروني.'
          : 'تم إنشاء حسابك بنجاح!',
      userId: user.id,
      requiresVerification,
      email,
      isAdmin: isFirstUser
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'فشل التسجيل' },
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
        ? 'أول حساب - سيتم تعيينه كمدير'
        : 'يمكن للطلاب التسجيل'
    })
  } catch (error) {
    console.error('Check registration error:', error)
    return NextResponse.json({
      canRegister: true,
      message: 'النظام جاهز للتسجيل'
    })
  }
}
