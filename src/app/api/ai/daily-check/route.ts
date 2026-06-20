import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// This endpoint should be called daily by a cron job
// Configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/ai/daily-check",
//     "schedule": "0 12 * * *"
//   }]
// }

export async function GET() {
  try {
    // Get AI settings from environment or database
    const apiEndpoint = process.env.AI_API_ENDPOINT
    const apiKey = process.env.AI_API_KEY
    const modelId = process.env.AI_MODEL_ID || 'qwen-plus'

    if (!apiEndpoint || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'AI API not configured',
        timestamp: new Date().toISOString()
      })
    }

    const startTime = Date.now()

    const response = await fetch(`${apiEndpoint}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: 'مرحباً، هذه رسالة اختبار. رد بـ "نجاح"' }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    const latency = Date.now() - startTime

    if (response.ok) {
      // AI is healthy
      return NextResponse.json({
        success: true,
        message: 'AI API is healthy',
        latency,
        timestamp: new Date().toISOString()
      })
    } else {
      const errorText = await response.text()
      
      let errorMessage = 'فشل الاتصال بـ API'
      if (errorText.includes('invalid') || errorText.includes('401')) {
        errorMessage = 'API Key غير صحيح أو منتهي الصلاحية'
      } else if (errorText.includes('403')) {
        errorMessage = 'ليس لديك صلاحية للوصول لهذا API'
      } else if (errorText.includes('429')) {
        errorMessage = 'تم تجاوز حد الطلبات'
      }

      // Get admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true }
      })

      // Send notification to all admins
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'AI_API_ERROR',
            title: '⚠️ تحذير: مشكلة في API الذكاء الاصطناعي',
            message: `فشل التحقق اليومي من API الساعة 12 ظهراً: ${errorMessage}. الرجاء مراجعة إعدادات API في لوحة التحكم.`,
            isRead: false
          }
        })
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: errorText.substring(0, 200),
        latency,
        timestamp: new Date().toISOString(),
        adminsNotified: admins.length
      })
    }
  } catch (error: any) {
    // Send notification to admins about the error
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      })

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'AI_API_ERROR',
            title: '⚠️ تحذير: خطأ في API الذكاء الاصطناعي',
            message: `حدث خطأ في التحقق اليومي من API: ${error.message}. الرجاء مراجعة الإعدادات.`,
            isRead: false
          }
        })
      }
    } catch (notifyError) {
      console.error('Failed to send notifications:', notifyError)
    }

    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في التحقق: ' + (error.message || 'خطأ غير معروف'),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
