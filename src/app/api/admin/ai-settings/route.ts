import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.aISettings.findFirst()
    
    if (!settings) {
      settings = await prisma.aISettings.create({
        data: {
          service: 'openai',
          model: 'gpt-3.5-turbo',
          freeModels: 'gpt-3.5-turbo,claude-3-haiku'
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching AI settings:', error)
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      service,
      model,
      apiKey,
      freeModels,
      isEnabled,
      testPageEnabled,
      testPrompt,
      customPrompt,
      searchEnabled,
      searchApiKey,
      searchEngine
    } = body

    let settings = await prisma.aISettings.findFirst()
    
    if (settings) {
      settings = await prisma.aISettings.update({
        where: { id: settings.id },
        data: {
          service,
          model,
          apiKey,
          freeModels,
          isEnabled,
          testPageEnabled,
          testPrompt,
          customPrompt,
          searchEnabled,
          searchApiKey,
          searchEngine
        }
      })
    } else {
      settings = await prisma.aISettings.create({
        data: {
          service: service || 'openai',
          model: model || 'gpt-3.5-turbo',
          apiKey,
          freeModels,
          isEnabled: isEnabled ?? true,
          testPageEnabled,
          testPrompt,
          customPrompt,
          searchEnabled,
          searchApiKey,
          searchEngine
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating AI settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}
