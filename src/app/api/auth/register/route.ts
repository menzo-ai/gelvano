import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, studentId, parentPhone, schoolYear, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الرجاء ملء جميع الحقول المطلوبة' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    const userRole = isFirstUser ? 'SUPER_ADMIN' : (role || 'STUDENT')

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        studentId: studentId || null,
        parentPhone: parentPhone || null,
        schoolYear: schoolYear || 1,
        isVerified: isFirstUser, // Auto-verify first admin
        isActive: true
      }
    })

    return NextResponse.json({
      message: isFirstUser
        ? 'تم إنشاء حساب المدير بنجاح!'
        : 'تم إنشاء الحساب بنجاح!',
      userId: user.id,
      email: user.email,
      requiresVerification: !isFirstUser,
      isAdmin: isFirstUser
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}
