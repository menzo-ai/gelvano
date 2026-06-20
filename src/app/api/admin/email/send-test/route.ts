import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getVerificationEmailTemplate } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName } = await request.json()

    if (!to || !smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ يرجى ملء جميع الحقول المطلوبة' 
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

    // Generate a test verification code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString()
    const template = getVerificationEmailTemplate(testCode, 'مستخدم تجريبي')

    await transporter.sendMail({
      from: `"${fromName || 'GELVANO'}" <${fromEmail || smtpUser}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    return NextResponse.json({ 
      success: true, 
      message: `✅ تم إرسال البريد التجريبي بنجاح إلى ${to}!` 
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ 
      success: false, 
      message: `❌ فشل إرسال البريد: ${error}` 
    }, { status: 500 })
  }
}
