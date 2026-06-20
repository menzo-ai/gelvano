import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, description, questionCount, difficulty, userAzhar } = body

    // Get AI settings
    const aiSettings = await prisma.aISettings.findFirst()
    
    if (!aiSettings || !aiSettings.testPrompt) {
      // Return mock questions if no AI settings
      return NextResponse.json({
        questions: generateMockQuestions(subject, questionCount, difficulty)
      })
    }

    // Prepare the prompt for AI
    const difficultyText = difficulty === 'all' ? 'مختلط' : 
      difficulty === 'easy' ? 'سهل' : 
      difficulty === 'medium' ? 'متوسط' : 'صعب'
    
    const azharText = userAzhar ? 'منهج الأزهر' : 'المنهج العام'

    const prompt = `أنت مساعد تعليمي متخصص في إنشاء اختبارات.
${aiSettings.testPrompt}

المادة: ${subject}
${description ? `الوصف: ${description}` : ''}
عدد الأسئلة: ${questionCount}
مستوى الصعوبة: ${difficultyText}
نوع المنهج: ${azharText}

أجب بصيغة JSON فقط بهذا الشكل:
{
  "questions": [
    {
      "id": 1,
      "question": "نص السؤال",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctAnswer": 0,
      "difficulty": "سهل/متوسط/صعب"
    }
  ]
}

يجب أن تكون الأسئلة من نوع اختيار من متعدد ب 4 خيارات.
أجب JSON فقط بدون أي نص إضافي.`

    // Call AI API
    const response = await fetch(`${process.env.AI_API_URL || 'https://ws-2yatkvgy5gz29uxu.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey || process.env.AI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: aiSettings.model || 'qwen-plus',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return NextResponse.json(parsed)
        }
      } catch (e) {
        console.error('Error parsing AI response:', e)
      }
    }

    // Fallback to mock questions
    return NextResponse.json({
      questions: generateMockQuestions(subject, questionCount, difficulty)
    })

  } catch (error) {
    console.error('Error generating test:', error)
    return NextResponse.json({
      questions: generateMockQuestions('الفيزياء', 10, 'all')
    })
  }
}

function generateMockQuestions(subject: string, count: number, difficulty: string): any[] {
  const questions = []
  
  const physicsQuestions = [
    { q: 'ما هو قانون نيوتن الأول للحركة؟', o: ['الجسم الساكن يبقى ساكناً والجسم المتحرك يبقى متحركاً بسرعة ثابتة', 'F = ma', 'الشغل = القوة × المسافة', 'الطاقة لا تفنى ولا تستحدث'] },
    { q: 'ما وحدة قياس القوة في النظام الدولي؟', o: ['نيوتن', 'جول', 'واط', 'باسكال'] },
    { q: 'ما هو تعريف السرعة المتجهة؟', o: ['التغير في الموضع في وحدة الزمن', 'المسافة المقطوعة في وحدة الزمن', 'معدل التغير في السرعة', 'القدرة مقسومة على الزمن'] },
    { q: 'قانون حفظ الطاقة ينص على أن:', o: ['الطاقة لا تفنى ولا تستحدث', 'الطاقة تتناسب طردياً مع الكتلة', 'الطاقة تنخفض باستمرار', 'الطاقة تساوي صفر دائماً'] },
    { q: 'ما هو التسارع؟', o: ['معدل التغير في السرعة المتجهة', 'السرعة مقسومة على الزمن', 'المسافة مقسومة على الزمن', 'القدرة × الزمن'] },
    { q: 'وحدة قياس الشغل هي:', o: ['جول', 'نيوتن', 'واط', 'أوم'] },
    { q: 'ما هو تعريف الطاقة الحركية؟', o: ['½mv²', 'mgh', 'Fd', 'Pt'] },
    { q: 'قانون نيوتن الثاني يُعبر عنه بـ:', o: ['F = ma', 'E = mc²', 'P = VI', 'V = IR'] },
    { q: 'ما هو مقدار تسارع الجاذبية الأرضية؟', o: ['9.8 m/s²', '10.8 m/s²', '8.8 m/s²', '11.2 m/s²'] },
    { q: 'الطاقة الكامنة gravitational تنسب إلى:', o: ['mgh', '½mv²', 'kx²/2', 'Q = mcΔT'] }
  ]

  const chemistryQuestions = [
    { q: 'ما هو العدد الذري للعنصر؟', o: ['عدد البروتونات', 'عدد النيوترونات', 'عدد الكتلة', 'عدد الإلكترونات فقط'] },
    { q: 'ما هو الرابطة الأيونية؟', o: ['انتقال إلكترونات من ذرة لأخرى', 'تشارك إلكترونات', 'قوة تجاذب بين جزيئات', 'لا شيء مما سبق'] },
    { q: 'قانون أفوجادرو ينص على أن:', o: ['الحجوم المتساوية من الغازات تحتوي على عدد متساوٍ من الجزيئات', 'الضغط × الحجم = عدد المولات × ثابت الغاز', 'الطاقة لا تفنى', 'الكتلة محفوظة'] },
    { q: 'ما هو الرقم الهيدروجيني للمحاليل الحمضية؟', o: ['أقل من 7', 'أكبر من 7', 'يساوي 7', 'لا يمكن تحديده'] },
    { q: 'التأكسد هو:', o: ['فقدان الإلكترونات', 'اكتساب الإلكترونات', 'فقدان البروتونات', 'اكتساب النيوترونات'] }
  ]

  const baseQuestions = subject.includes('كيمياء') ? chemistryQuestions : physicsQuestions

  for (let i = 0; i < count; i++) {
    const baseQ = baseQuestions[i % baseQuestions.length]
    let diff: string = 'متوسط'
    
    if (difficulty === 'easy') diff = 'سهل'
    else if (difficulty === 'medium') diff = 'متوسط'
    else if (difficulty === 'hard') diff = 'صعب'
    else {
      const difficulties: string[] = ['سهل', 'متوسط', 'صعب']
      diff = difficulties[Math.floor(Math.random() * 3)]
    }

    // Shuffle options
    const shuffledOptions = [...baseQ.o]
    const correctIndex = Math.floor(Math.random() * 4)
    const correctAnswer = shuffledOptions.splice(correctIndex, 1)[0]
    shuffledOptions.splice(Math.floor(Math.random() * 3), 0, correctAnswer)

    questions.push({
      id: i + 1,
      question: `${baseQ.q} (${diff})`,
      options: shuffledOptions,
      correctAnswer: shuffledOptions.indexOf(correctAnswer),
      difficulty: diff
    })
  }

  return questions
}
