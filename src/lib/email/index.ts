import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.EMAIL_PORT || '587')
  const secure = process.env.EMAIL_SECURE === 'true'
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? {
      user,
      pass
    } : undefined
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = createTransporter()
  const fromName = process.env.EMAIL_FROM_NAME || 'GELVANO'
  const fromEmail = process.env.EMAIL_FROM || 'noreply@gelvano.com'

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html
    })
    return { success: true }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

// Email Templates
export const emailTemplates = {
  verification: (code: string, platformName: string = 'GELVANO') => ({
    subject: `رمز التحقق من ${platformName}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${platformName}</h1>
          </div>
          <div class="content">
            <h2>رمز التحقق</h2>
            <p>استخدم الرمز التالي للتحقق من بريدك الإلكتروني:</p>
            <div class="code">${code}</div>
            <p>هذا الرمز صالح لمدة 15 دقيقة</p>
            <p style="color: #999; font-size: 12px;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة</p>
          </div>
          <div class="footer">
            <p>${platformName} - منصتك التعليمية</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (name: string, platformName: string = 'GELVANO') => ({
    subject: `مرحباً بك في ${platformName}`,
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
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>مرحباً ${name}!</h1>
          </div>
          <div class="content">
            <h2>أهلاً وسهلاً بك في ${platformName}</h2>
            <p>شكراً لتسجيلك في منصتنا التعليمية. نتمنى لك رحلة تعليمية مثمرة!</p>
            <p>ابدأ الآن واستكشف كورساتنا المتنوعة.</p>
          </div>
          <div class="footer">
            <p>${platformName} - منصتك التعليمية</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (name: string, resetUrl: string, platformName: string = 'GELVANO') => ({
    subject: `استعادة كلمة المرور - ${platformName}`,
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
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>استعادة كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${name}</h2>
            <p>لقد طلبت استعادة كلمة المرور الخاصة بحسابك.</p>
            <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetUrl}" class="button">استعادة كلمة المرور</a>
            <p style="color: #999; font-size: 12px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
            <p style="color: #999; font-size: 12px;">إذا لم تطلب استعادة كلمة المرور، تجاهل هذه الرسالة.</p>
          </div>
          <div class="footer">
            <p>${platformName} - منصتك التعليمية</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

export default sendEmail
