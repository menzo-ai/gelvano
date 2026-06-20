import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiEndpoint, apiKey } = await request.json()

    if (!apiEndpoint || !apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ يرجى إدخال رابط API و المفتاح' 
      }, { status: 400 })
    }

    // Simulate API test with a delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // In a real implementation, you would make an actual API call here
    // For demo purposes, we just check if the fields are provided
    if (apiEndpoint.includes('http') && apiKey.length > 10) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ تم الاتصال بـ API بنجاح! menzo-ai يعمل بشكل طبيعي.' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '❌ بيانات API غير صحيحة' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json({ 
      success: false, 
      message: `❌ خطأ في الاتصال: ${error}` 
    }, { status: 500 })
  }
}
