import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Helper function to get email settings
function getEmailSettings() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'email-settings.json')
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch (e) {
    console.error('Error reading email settings:', e)
  }
  return null
}

// Helper function to send email
async function sendEmail(to: string, subject: string, html: string) {
  const settings = getEmailSettings()
  if (!settings?.emailEnabled) {
    console.log('Email disabled, skipping send to:', to)
    return { success: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: parseInt(settings.port) || 587,
      secure: settings.secure,
      auth: settings.user ? { user: settings.user, pass: settings.password } : undefined
    })

    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to,
      subject,
      html
    })
    return { success: true }
  } catch (error: any) {
    console.error('Email error:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, parentName, parentPhone, schoolYear, isAzhar } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 400 }
      )
    }

    // Check if this is the first registration (becomes admin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    const role = isFirstUser ? 'SUPER_ADMIN' : 'STUDENT'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        parentName,
        parentPhone,
        schoolYear: schoolYear || 1,
        isAzhar: isAzhar || false,
        role,
        isVerified: isFirstUser, // Auto-verify first admin
        isActive: true,
        otpCode: isFirstUser ? null : verificationCode,
        otpExpiry: isFirstUser ? null : verificationExpiry
      }
    })

    // Create wallet for user
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0
      }
    })

    // Send verification email (if not first admin)
    const emailSettings = getEmailSettings()
    if (!isFirstUser && emailSettings?.emailEnabled) {
      await sendEmail(
        email,
        `رمز التحقق من ${emailSettings.fromName || 'GELVANO'}`,
        `
          <div style="text-align: center; padding: 20px;">
            <h2>مرحباً ${name}!</h2>
            <p>شكراً لتسجيلك في منصتنا التعليمية.</p>
            <p>رمز التحقق الخاص بك:</p>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="color: #666; font-size: 12px;">هذا الرمز صالح لمدة 15 دقيقة</p>
          </div>
        `
      )
    }

    return NextResponse.json({
      message: isFirstUser
        ? 'تم إنشاء حساب المدير بنجاح!'
        : 'تم إنشاء الحساب بنجاح! يرجى تفعيل حسابك.',
      userId: user.id,
      email,
      isAdmin: isFirstUser,
      needsVerification: !isFirstUser
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
