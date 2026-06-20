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
        enabled: false,
        config: {
          smtpHost: '',
          smtpPort: '587',
          smtpUser: '',
          smtpPass: '',
          fromEmail: 'noreply@gelvano.com',
          fromName: 'GELVANO'
        }
      })
    }

    return NextResponse.json({
      enabled: config.emailEnabled,
      config: JSON.parse(config.emailConfig)
    })
  } catch (error) {
    console.error('Error getting email settings:', error)
    return NextResponse.json({ 
      enabled: false,
      config: {
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        fromEmail: 'noreply@gelvano.com',
        fromName: 'GELVANO'
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
        emailEnabled: enabled ?? false,
        emailConfig: JSON.stringify(config),
        aiEnabled: true,
        aiConfig: '{}',
        siteName: 'GELVANO',
        siteDescription: 'منصة جلفانو للفيزياء',
        maintenanceMode: false
      },
      update: {
        emailEnabled: enabled ?? false,
        emailConfig: JSON.stringify(config)
      }
    })

    return NextResponse.json({ success: true, message: 'تم حفظ إعدادات البريد بنجاح!' })
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
