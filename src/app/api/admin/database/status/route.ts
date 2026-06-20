import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 'site_config' }
    })

    if (!config) {
      return NextResponse.json({ 
        configured: false,
        provider: null,
        needsSetup: true
      })
    }

    const dbConfig = JSON.parse(config.dbConfig)

    return NextResponse.json({ 
      configured: true,
      provider: config.dbProvider,
      needsSetup: false,
      config: dbConfig,
      emailEnabled: config.emailEnabled,
      aiEnabled: config.aiEnabled,
      siteName: config.siteName
    })
  } catch (error) {
    console.error('Database status error:', error)
    return NextResponse.json({ 
      configured: false,
      provider: null,
      needsSetup: true,
      error: String(error)
    }, { status: 500 })
  }
}
