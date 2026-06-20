import nodemailer from 'nodemailer'
import type { EmailConfig } from './site-config'

// Email templates
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Site info for emails
const SITE_NAME = 'GELVANO'
const SITE_DESCRIPTION = 'منصة جلفانو للفيزياء'
const INSTRUCTOR_NAME = 'م. خالد أسامة'

export function createTransporter(emailConfig: EmailConfig) {
  return nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: parseInt(emailConfig.smtpPort) || 587,
    secure: parseInt(emailConfig.smtpPort) === 465,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  })
}

export async function sendEmail(
  emailConfig: EmailConfig,
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter(emailConfig)
    
    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    return { success: true, message: 'تم إرسال البريد الإلكتروني بنجاح!' }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, message: `فشل إرسال البريد: ${error}` }
  }
}

// Verification code email template
export function getVerificationEmailTemplate(code: string, name: string): EmailTemplate {
  return {
    subject: `🔐 كود التحقق من ${SITE_NAME}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>كود التحقق</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 50px;
            border-radius: 15px;
            display: inline-block;
            margin: 20px 0;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            font-size: 13px;
            margin-top: 25px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔬 ${SITE_NAME}</div>
            <div class="subtitle">${SITE_DESCRIPTION}</div>
          </div>
          <div class="content">
            <div class="greeting">مرحباً ${name} 👋</div>
            <p style="color: #666; margin-bottom: 20px;">
              تم طلب كود التحقق لحسابك في منصة ${SITE_NAME}
            </p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p style="color: #666; margin-top: 20px; font-size: 14px;">
              هذا الكود صالح لمدة <strong>10 دقائق</strong>
            </p>
            <div class="warning">
              ⚠️ لا تشارك هذا الكود مع أي شخص. فريق ${SITE_NAME} لن يطلب منك هذا الكود أبداً.
            </div>
          </div>
          <div class="footer">
            <p>تطور بواسطة: Mohamed El-Manzalawy</p>
            <p>مدير المحتوى: ${INSTRUCTOR_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      مرحباً ${name} 👋
      
      تم طلب كود التحقق لحسابك في منصة ${SITE_NAME}
      
      كود التحقق: ${code}
      
      هذا الكود صالح لمدة 10 دقائق
      
      ⚠️ لا تشارك هذا الكود مع أي شخص.
      
      ---
      ${SITE_NAME} - ${SITE_DESCRIPTION}
      تطور بواسطة: Mohamed El-Manzalawy
    `
  }
}

// Welcome email template
export function getWelcomeEmailTemplate(name: string): EmailTemplate {
  return {
    subject: `🎉 مرحباً بك في ${SITE_NAME}!`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>مرحباً بك</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 40px 30px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔬 ${SITE_NAME}</h1>
            <p>${SITE_DESCRIPTION}</p>
          </div>
          <div class="content">
            <h2>مرحباً بك يا ${name}! 🎉</h2>
            <p>شكراً لتسجيلك في منصة ${SITE_NAME}. نحن سعيدون بانضمامك!</p>
            <p>ابدأ الآن واستكشف محتوى الفيزياء الرائع.</p>
            <a href="#" class="btn">ابدأ الآن</a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      مرحباً بك يا ${name}! 🎉
      
      شكراً لتسجيلك في منصة ${SITE_NAME}.
      
      نحن سعيدون بانضمامك!
      
      ابدأ الآن واستكشف محتوى الفيزياء الرائع.
    `
  }
}

// Password reset email template
export function getPasswordResetEmailTemplate(resetLink: string, name: string): EmailTemplate {
  return {
    subject: `🔑 طلب إعادة تعيين كلمة المرور - ${SITE_NAME}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إعادة تعيين كلمة المرور</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1>🔬 ${SITE_NAME}</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2>مرحباً ${name} 👋</h2>
            <p>طلب إعادة تعيين كلمة المرور لحسابك.</p>
            <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
              إعادة تعيين كلمة المرور
            </a>
            <p style="color: #666; font-size: 14px;">هذا الرابط صالح لمدة ساعة واحدة.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">إذا لم تطلب هذا، تجاهل هذه الرسالة.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      مرحباً ${name} 👋
      
      طلب إعادة تعيين كلمة المرور لحسابك.
      
      اضغط على الرابط التالي لإعادة تعيين كلمة المرور:
      ${resetLink}
      
      هذا الرابط صالح لمدة ساعة واحدة.
      
      إذا لم تطلب هذا، تجاهل هذه الرسالة.
    `
  }
}

export async function testEmailConnection(emailConfig: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass) {
      return { success: false, message: '❌ يرجى ملء جميع حقول الإعدادات أولاً' }
    }

    const transporter = createTransporter(emailConfig)
    await transporter.verify()
    
    return { success: true, message: '✅ تم الاتصال بخادم البريد بنجاح!' }
  } catch (error) {
    return { success: false, message: `❌ فشل الاتصال: ${error}` }
  }
}
