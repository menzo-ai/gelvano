import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { provider, config } = await request.json()

    if (!provider) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ يرجى اختيار نوع قاعدة البيانات' 
      }, { status: 400 })
    }

    // Validate required fields based on provider
    const requiredFields: Record<string, string[]> = {
      supabase: ['supabaseUrl', 'supabaseKey', 'supabaseServiceKey'],
      mongodb: ['mongodbUri'],
      neon: ['neonConnectionString'],
      turso: ['tursoDbUrl', 'tursoAuthToken'],
      upstash: ['upstashRedisUrl', 'upstashRedisToken'],
    }

    const required = requiredFields[provider] || []
    const missing = required.filter(field => !config[field])

    if (missing.length > 0 && provider !== 'sqlite') {
      return NextResponse.json({ 
        success: false, 
        message: `❌ يرجى ملء الحقول المطلوبة: ${missing.join(', ')}` 
      }, { status: 400 })
    }

    // Save to database config
    await prisma.siteConfig.upsert({
      where: { id: 'site_config' },
      create: {
        id: 'site_config',
        dbProvider: provider,
        dbConfig: JSON.stringify(config),
        emailEnabled: false,
        emailConfig: JSON.stringify({
          smtpHost: '',
          smtpPort: '587',
          smtpUser: '',
          smtpPass: '',
          fromEmail: 'noreply@gelvano.com',
          fromName: 'GELVANO'
        }),
        aiEnabled: true,
        aiConfig: JSON.stringify({
          apiEndpoint: 'https://ws-2yatkvgy5gz29uxu.ap-southeast-1.maas.aliyuncs.com',
          apiKey: '',
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: ''
        }),
        siteName: 'GELVANO',
        siteDescription: 'منصة جلفانو للفيزياء',
        maintenanceMode: false
      },
      update: {
        dbProvider: provider,
        dbConfig: JSON.stringify(config)
      }
    })

    // Write to .env file for Next.js (only for SQLite)
    if (provider === 'sqlite') {
      // SQLite uses the default DATABASE_URL
    } else if (provider === 'supabase') {
      // Write to .env.local
      const fs = await import('fs')
      const envPath = process.cwd() + '/.env'
      let envContent = ''
      try {
        envContent = fs.readFileSync(envPath, 'utf-8')
      } catch {}
      
      // Update or add Supabase variables
      envContent = envContent.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/g, `NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl}`)
      envContent = envContent.replace(/SUPABASE_SERVICE_KEY=.*/g, `SUPABASE_SERVICE_KEY=${config.supabaseServiceKey}`)
      
      if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
        envContent += `\nNEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl}`
      }
      if (!envContent.includes('SUPABASE_SERVICE_KEY=')) {
        envContent += `\nSUPABASE_SERVICE_KEY=${config.supabaseServiceKey}`
      }
      
      fs.writeFileSync(envPath, envContent)
    } else if (provider === 'neon') {
      const fs = await import('fs')
      const envPath = process.cwd() + '/.env'
      let envContent = ''
      try {
        envContent = fs.readFileSync(envPath, 'utf-8')
      } catch {}
      
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${config.neonConnectionString}`)
      if (!envContent.includes('DATABASE_URL=')) {
        envContent += `\nDATABASE_URL=${config.neonConnectionString}`
      }
      
      fs.writeFileSync(envPath, envContent)
    }

    return NextResponse.json({ 
      success: true, 
      message: '✅ تم حفظ إعدادات قاعدة البيانات بنجاح!' 
    })
  } catch (error) {
    console.error('Database save error:', error)
    return NextResponse.json({ 
      success: false, 
      message: `❌ خطأ في الحفظ: ${error}` 
    }, { status: 500 })
  }
}
