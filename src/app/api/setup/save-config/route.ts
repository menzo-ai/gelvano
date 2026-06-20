import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { provider, config } = await req.json()

    // Build .env content based on provider
    let envContent = ''

    if (provider === 'sqlite') {
      envContent = `DATABASE_URL="file:./dev.db"
`
    } else if (provider === 'supabase') {
      envContent = `DATABASE_URL="postgresql://postgres:${config.supabaseServiceKey}@db.${config.supabaseUrl.replace('https://', '').replace('/', '')}:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="${config.supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${config.supabaseAnonKey}"
SUPABASE_SERVICE_KEY="${config.supabaseServiceKey}"
`
    } else if (provider === 'mongodb') {
      envContent = `MONGODB_URI="${config.mongodbUri}"
MONGODB_DB_NAME="${config.mongodbDbName}"
`
    } else if (provider === 'neon') {
      envContent = `DATABASE_URL="${config.neonConnectionString}"
`
    } else if (provider === 'turso') {
      envContent = `DATABASE_URL="${config.tursoDbUrl}"
TURSO_AUTH_TOKEN="${config.tursoAuthToken}"
`
    } else if (provider === 'upstash') {
      envContent = `UPSTASH_REDIS_URL="${config.upstashRedisUrl}"
UPSTASH_REDIS_TOKEN="${config.upstashRedisToken}"
`
    }

    // Save to .env file
    const envPath = path.join(process.cwd(), '.env')
    fs.writeFileSync(envPath, envContent)

    // Also save provider info to a config file for the app to read
    const configData = {
      provider,
      config: provider === 'sqlite' ? {} : config,
      createdAt: new Date().toISOString()
    }
    const configPath = path.join(process.cwd(), 'data', 'config.json')
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      provider
    })
  } catch (error: any) {
    console.error('Save config error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ أثناء الحفظ'
    }, { status: 500 })
  }
}
