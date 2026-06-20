import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.aISettings.findFirst()
    
    return NextResponse.json(settings || {
      isEnabled: false,
      provider: 'openai',
      customPrompt: 'أنت معلم فيزياء متخصص. أجب على الأسئلة بشكل واضح ومبسط.'
    })
  } catch (error: any) {
    console.error('Get AI settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إعدادات الذكاء الاصطناعي' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isEnabled, provider, apiKey, searchEngine, searchApiKey, customPrompt } = body

    // Get existing settings or create new
    const existing = await prisma.aISettings.findFirst()

    if (existing) {
      const updated = await prisma.aISettings.update({
        where: { id: existing.id },
        data: {
          isEnabled: isEnabled ?? existing.isEnabled,
          provider: provider ?? existing.provider,
          apiKey: apiKey !== undefined ? apiKey : existing.apiKey,
          searchEngine: searchEngine ?? existing.searchEngine,
          searchApiKey: searchApiKey !== undefined ? searchApiKey : existing.searchApiKey,
          customPrompt: customPrompt ?? existing.customPrompt,
        }
      })
      return NextResponse.json(updated)
    } else {
      const created = await prisma.aISettings.create({
        data: {
          isEnabled: isEnabled ?? false,
          provider: provider ?? 'openai',
          apiKey,
          searchEngine: searchEngine ?? 'google',
          searchApiKey,
          customPrompt: customPrompt ?? 'أنت معلم فيزياء متخصص. أجب على الأسئلة بشكل واضح ومبسط.'
        }
      })
      return NextResponse.json(created)
    }
  } catch (error: any) {
    console.error('Update AI settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث إعدادات الذكاء الاصطناعي' },
      { status: 500 }
    )
  }
}
