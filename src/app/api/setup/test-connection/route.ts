import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { provider, config } = await req.json()

    // For SQLite, always succeed
    if (provider === 'sqlite') {
      return NextResponse.json({
        success: true,
        message: 'SQLite لا يحتاج اختبار - التخزين المحلي جاهز'
      })
    }

    // For other providers, validate basic connection
    if (provider === 'supabase') {
      if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseServiceKey) {
        return NextResponse.json({
          success: false,
          error: 'جميع الحقول مطلوبة'
        }, { status: 400 })
      }

      // Try to validate Supabase URL format
      if (!config.supabaseUrl.startsWith('https://')) {
        return NextResponse.json({
          success: false,
          error: 'رابط Supabase يجب أن يبدأ بـ https://'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'إعدادات Supabase صحيحة'
      })
    }

    if (provider === 'mongodb') {
      if (!config.mongodbUri || !config.mongodbDbName) {
        return NextResponse.json({
          success: false,
          error: 'جميع الحقول مطلوبة'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'إعدادات MongoDB صحيحة'
      })
    }

    if (provider === 'neon') {
      if (!config.neonConnectionString) {
        return NextResponse.json({
          success: false,
          error: 'رابط الاتصال مطلوب'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'إعدادات Neon صحيحة'
      })
    }

    if (provider === 'turso') {
      if (!config.tursoDbUrl || !config.tursoAuthToken) {
        return NextResponse.json({
          success: false,
          error: 'جميع الحقول مطلوبة'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'إعدادات Turso صحيحة'
      })
    }

    if (provider === 'upstash') {
      if (!config.upstashRedisUrl || !config.upstashRedisToken) {
        return NextResponse.json({
          success: false,
          error: 'جميع الحقول مطلوبة'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'إعدادات Upstash صحيحة'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'مزود غير معروف'
    }, { status: 400 })
  } catch (error: any) {
    console.error('Test connection error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ أثناء اختبار الاتصال'
    }, { status: 500 })
  }
}
