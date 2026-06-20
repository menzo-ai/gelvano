import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 'site_config' }
    })

    if (!config) {
      return NextResponse.json({ 
        enabled: true,
        config: {
          apiEndpoint: '',
          apiKey: '',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: ''
        }
      })
    }

    return NextResponse.json({
      enabled: config.aiEnabled,
      config: JSON.parse(config.aiConfig)
    })
  } catch (error) {
    console.error('Error getting AI settings:', error)
    return NextResponse.json({ 
      enabled: true,
      config: {
        apiEndpoint: '',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: ''
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enabled, config } = await request.json()

    await prisma.siteConfig.upsert({
      where: { id: 'site_config' },
      create: {
        id: 'site_config',
        dbProvider: 'sqlite',
        dbConfig: '{}',
        emailEnabled: false,
        emailConfig: '{}',
        aiEnabled: enabled ?? true,
        aiConfig: JSON.stringify(config),
        siteName: 'GELVANO',
        siteDescription: 'منصة جلفانو للفيزياء',
        maintenanceMode: false
      },
      update: {
        aiEnabled: enabled ?? true,
        aiConfig: JSON.stringify(config)
      }
    })

    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح!' })
  } catch (error) {
    console.error('Error saving AI settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
