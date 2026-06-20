import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName } = await request.json()

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ يرجى ملء جميع حقول SMTP' 
      }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort) || 587,
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.verify()

    return NextResponse.json({ 
      success: true, 
      message: '✅ تم الاتصال بخادم البريد بنجاح!' 
    })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ 
      success: false, 
      message: `❌ فشل الاتصال: ${error}` 
    }, { status: 500 })
  }
}
