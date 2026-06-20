import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface AIHealthResult {
  success: boolean
  message: string
  latency?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { apiEndpoint, apiKey, modelId } = await request.json()

    if (!apiEndpoint || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'API Endpoint و API Key مطلوبين' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

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

      return NextResponse.json({
        success: true,
        message: 'API يعمل بشكل صحيح',
        latency,
        response: content
      } as AIHealthResult)
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

      return NextResponse.json({
        success: false,
        message: errorMessage,
        latency,
        error: errorText.substring(0, 200)
      } as AIHealthResult)
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في الاتصال: ' + (error.message || 'خطأ غير معروف'),
      error: error.stack?.substring(0, 200)
    } as AIHealthResult)
  }
}
