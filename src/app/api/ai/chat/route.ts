import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// AI Providers configuration
const AI_PROVIDERS: Record<string, { endpoint: string; model: string }> = {
  openai: { endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-3.5-turbo' },
  deepseek: { endpoint: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  anthropic: { endpoint: 'https://api.anthropic.com/v1/messages', model: 'claude-3-sonnet-20240229' },
  gemini: { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models', model: 'gemini-pro' },
  minimax: { endpoint: 'https://api.minimax.chat/v1/text/chatcompletion_v2', model: 'abab6-chat' },
  moonshot: { endpoint: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k' },
  cohere: { endpoint: 'https://api.cohere.ai/v1/chat', model: 'command' },
  openrouter: { endpoint: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-3.5-turbo' },
  groq: { endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'mixtral-8x7b-32768' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history, context, searchQuery } = body

    if (!message) {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      )
    }

    // Get AI settings from database
    const dbSettings = await prisma.aISettings.findFirst()
    
    if (!dbSettings || !dbSettings.isEnabled) {
      return NextResponse.json(
        { error: 'الذكاء الاصطناعي غير مفعل حالياً' },
        { status: 400 }
      )
    }

    if (!dbSettings.apiKey) {
      return NextResponse.json(
        { error: 'مفتاح API غير موجود. يرجى إضافته في إعدادات الذكاء الاصطناعي' },
        { status: 400 }
      )
    }

    const provider = dbSettings.provider || 'openai'
    const customPrompt = dbSettings.customPrompt || 'أنت معلم فيزياء متخصص. أجب على الأسئلة بشكل واضح ومبسط.'

    // If search query is provided, perform web search using public APIs
    let searchResults = ''
    if (searchQuery && dbSettings.searchApiKey) {
      try {
        // Use a simple search approach via browser/frontend or skip for now
        searchResults = ''
      } catch (searchError) {
        console.error('Search error:', searchError)
      }
    }

    // Build system prompt
    let systemPrompt = customPrompt
    if (searchResults) {
      systemPrompt += `\n\nنتائج البحث من الويب:\n${searchResults}`
    }
    if (context) {
      systemPrompt += `\n\nسياق المحاضرة:\n${context}`
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ]

    // Call AI API based on provider
    let responseText = ''
    
    try {
      const providerConfig = AI_PROVIDERS[provider] || AI_PROVIDERS.openai

      if (provider === 'gemini') {
        // Gemini API
        const response = await fetch(`${providerConfig.endpoint}/${providerConfig.model}:generateContent?key=${dbSettings.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        })
        const data = await response.json()
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ'
      } else if (provider === 'anthropic') {
        // Anthropic API
        const response = await fetch(providerConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': dbSettings.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: providerConfig.model,
            max_tokens: 1024,
            messages: messages.filter(m => m.role !== 'system')
          })
        })
        const data = await response.json()
        responseText = data.content?.[0]?.text || 'عذراً، حدث خطأ'
      } else {
        // OpenAI-compatible API
        const response = await fetch(providerConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${dbSettings.apiKey}`
          },
          body: JSON.stringify({
            model: providerConfig.model,
            messages,
            max_tokens: 2000,
            temperature: 0.7
          })
        })

        const data = await response.json()
        
        if (data.error) {
          return NextResponse.json(
            { error: data.error.message || 'حدث خطأ في API' },
            { status: 400 }
          )
        }

        responseText = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة'
      }
    } catch (apiError: any) {
      console.error('AI API error:', apiError)
      responseText = 'عذراً، حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.'
    }

    return NextResponse.json({
      response: responseText,
      searchResults: searchResults || null
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    )
  }
}
