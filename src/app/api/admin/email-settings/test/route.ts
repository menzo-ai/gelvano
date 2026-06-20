import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'email-settings.json')

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let settings

    // Get settings from request or file
    const body = await req.json().catch(() => null)
    if (body) {
      settings = body
    } else if (fs.existsSync(CONFIG_FILE)) {
      settings = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    } else {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على إعدادات البريد'
      }, { status: 400 })
    }

    if (!settings.emailEnabled) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني غير مفعّل'
      }, { status: 400 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: parseInt(settings.port) || 587,
      secure: settings.secure,
      auth: settings.user ? {
        user: settings.user,
        pass: settings.password
      } : undefined
    })

    // Verify connection
    await transporter.verify()

    // Send test email
    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: settings.user,
      subject: `اختبار - ${settings.fromName}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .success { color: #10b981; font-size: 48px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${settings.fromName}</h1>
            </div>
            <div class="content">
              <div class="success">✓</div>
              <h2>تم إرسال رسالة الاختبار بنجاح!</h2>
              <p>إعدادات البريد الإلكتروني تعمل بشكل صحيح.</p>
              <p>هذه الرسالة هي رسالة اختبار.</p>
            </div>
            <div class="footer">
              <p>${settings.fromName} - منصتك التعليمية</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالة الاختبار بنجاح'
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'فشل إرسال رسالة الاختبار'
    }, { status: 500 })
  }
}
