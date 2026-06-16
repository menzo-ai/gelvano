import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { generateOTP, generateStudentId } from '@/lib/utils'

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

    const { name, email, password } = validation.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? 'SUPER_ADMIN' : 'STUDENT'

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Generate student ID if student
    const studentId = role === 'STUDENT' 
      ? generateStudentId(new Date().getFullYear())
      : null

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        studentId,
        otpCode: otp,
        otpExpiry,
        isVerified: role === 'SUPER_ADMIN', // Admins are auto-verified
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: JSON.stringify({ role }),
      },
    })

    // In production, send email with OTP
    console.log(`OTP for ${email}: ${otp}`)

    return NextResponse.json({
      message: role === 'SUPER_ADMIN' 
        ? 'تم إنشاء حسابك بنجاح' 
        : 'تم إنشاء حسابك، يرجى التحقق من بريدك الإلكتروني',
      userId: user.id,
      requiresVerification: role !== 'SUPER_ADMIN',
      email,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Check if first admin is registered
  const userCount = await prisma.user.count()
  return NextResponse.json({
    canRegister: userCount === 0,
    message: userCount === 0 
      ? 'هذا أول حساب، سيتم إنشاء حساب مدير' 
      : 'التسجيل مغلق حالياً'
  })
}
