import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface AISettings {
  isEnabled: boolean
  apiEndpoint: string
  apiKey: string
  modelId: string
  showAITests: boolean
  testPrompt: string
  selectedModels: string[]
  apiValidated?: boolean
  temperature?: number
  maxTokens?: number
  testTemperature?: number
  testMaxTokens?: number
}

interface AIHealthResult {
  success: boolean
  message: string
  latency?: number
  response?: string
  error?: string
}

// Test AI API health
async function testAIHealth(apiEndpoint: string, apiKey: string, modelId: string): Promise<AIHealthResult> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${apiEndpoint}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId || 'qwen-plus',
        messages: [
          { role: 'user', content: 'مرحباً، هذه رسالة اختبار. رد بـ "نجاح"' }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    const latency = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      return {
        success: true,
        message: 'API يعمل بشكل صحيح',
        latency,
        response: content
      }
    } else {
      const errorText = await response.text()
      
      let errorMessage = 'فشل الاتصال بـ API'
      if (errorText.includes('invalid') || errorText.includes('401')) {
        errorMessage = 'API Key غير صحيح أو منتهي الصلاحية'
      } else if (errorText.includes('403')) {
        errorMessage = 'ليس لديك صلاحية للوصول لهذا API'
      } else if (errorText.includes('429')) {
        errorMessage = 'تم تجاوز حد الطلبات، حاول لاحقاً'
      }

      return {
        success: false,
        message: errorMessage,
        latency,
        error: errorText.substring(0, 200)
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'حدث خطأ في الاتصال: ' + (error.message || 'خطأ غير معروف'),
      error: error.stack?.substring(0, 200)
    }
  }
}

// Get AI Settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get AI settings from database (you might have a settings table)
    // For now, return defaults - you can modify this to read from DB
    return NextResponse.json({
      isEnabled: false,
      apiEndpoint: '',
      apiKey: '',
      modelId: 'qwen-plus',
      showAITests: false,
      testPrompt: '',
      selectedModels: [],
      apiValidated: false
    })
  } catch (error) {
    console.error('Get AI settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// Save AI Settings with validation
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const settings: AISettings = await request.json()

    // If enabling AI, must validate API first
    if (settings.isEnabled && !settings.apiValidated) {
      const healthResult = await testAIHealth(
        settings.apiEndpoint,
        settings.apiKey,
        settings.modelId
      )

      if (!healthResult.success) {
        // Send notification to admin about API failure
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'AI_API_ERROR',
            title: 'تحذير: مشكلة في API الذكاء الاصطناعي',
            message: `فشل التحقق من API: ${healthResult.message}. الرجاء مراجعة الإعدادات.`,
            isRead: false
          }
        })

        return NextResponse.json({
          success: false,
          message: 'يجب التحقق من API أولاً: ' + healthResult.message,
          healthResult,
          requiresValidation: true
        }, { status: 400 })
      }
    }

    // If enabling AI Tests, must have validated API
    if (settings.showAITests && !settings.apiValidated) {
      return NextResponse.json({
        success: false,
        message: 'يجب التحقق من API قبل تفعيل الاختبارات',
        requiresValidation: true
      }, { status: 400 })
    }

    // Save settings to database
    // You can implement this based on your settings storage approach
    // For now, return success

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    })
  } catch (error) {
    console.error('Save AI settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// Validate AI API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { apiEndpoint, apiKey, modelId } = await request.json()

    if (!apiEndpoint || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API Endpoint و API Key مطلوبين'
      }, { status: 400 })
    }

    const healthResult = await testAIHealth(apiEndpoint, apiKey, modelId)

    // If validation fails, send notification to admin
    if (!healthResult.success) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'AI_API_ERROR',
          title: 'تحذير: مشكلة في API الذكاء الاصطناعي',
          message: `فشل التحقق من API: ${healthResult.message}. الرجاء مراجعة الإعدادات.`,
          isRead: false
        }
      })
    }

    return NextResponse.json(healthResult)
  } catch (error) {
    console.error('Validate AI API error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
