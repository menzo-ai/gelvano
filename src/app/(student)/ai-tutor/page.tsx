'use client'

import { useState, useRef, useEffect } from 'react'
import Card, { CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { 
  Bot, 
  Send, 
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
  Calculator,
  Atom,
  Lightbulb,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

const quickQuestions = [
  { icon: Atom, text: 'ما هي قوانين نيوتن للحركة؟' },
  { icon: Calculator, text: 'احسب تسارع جسم كتلته 10kg تؤثر عليه قوة 50N' },
  { icon: Lightbulb, text: 'اشرح ظاهرة انكسار الضوء' },
  { icon: BookOpen, text: 'ما الفرق بين الشغل والطاقة؟' }
]

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعدك الذكي في الفيزياء. اسألني أي سؤال وسأساعدك على فهمه بسهولة. يمكنني:\n\n📚 شرح المفاهيم الفيزيائية\n🔢 حل المسائل خطوة بخطوة\n💡 شرح النظريات والقوانين\n📝 التحضير للاختبارات',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (question: string): string => {
    const q = question.toLowerCase()
    
    if (q.includes('نيوتن') || q.includes('قانون')) {
      return `**قوانين نيوتن للحركة:**

**القانون الأول (قانون القصور الذاتي):**
كل جسم يبقى على حالته من السكون أو الحركة المنتظمة في خط مستقيم ما لم تؤثر عليه قوة خارجية لتغير حالته.

**القانون الثاني (F = ma):**
إذا أثرت قوة خارجية على جسم فإنها تكسبه تسارعاً يتناسب طردياً مع القوة وعكسياً مع الكتلة.
\`\`\`
F = m × a
القوة = الكتلة × التسارع
\`\`\`

**القانون الثالث (الفعل ورد الفعل):**
لكل فعل رد فعل مساوٍ له في المقدار ومضاد له في الاتجاه.

هل تريد مثالاً على تطبيق هذه القوانين؟ 🔬`
    }
    
    if (q.includes('تسارع') || q.includes('احسب')) {
      return `**حل المسألة:**

معطيات:
- الكتلة (m) = 10 kg
- القوة (F) = 50 N

المطلوب: التسارع (a) = ؟

باستخدام القانون الثاني لنيوتن:

\`\`\`
F = m × a
a = F / m
a = 50 / 10
a = 5 m/s²
\`\`\`

**الإجابة:** التسارع = **5 متر/ثانية²**

💡 التفسير: كل 1 ثانية، تزيد سرعة الجسم بمقدار 5 متر/ثانية

هل تريد حل مسألة أخرى؟ 📐`
    }
    
    if (q.includes('انكسار') || q.includes('ضوء')) {
      return `**انكسار الضوء:**

انكسار الضوء هو تغير مسار الضوء عند انتقاله من وسط شفاف إلى آخر مختلف الكثافة.

**قوانين الانكسار (قانون سنيل):**
\`\`\`
n₁ × sin(θ₁) = n₂ × sin(θ₂)
\`\`\`

حيث:
- n₁ : معامل الانكسار للوسط الأول
- n₂ : معامل الانكسار للوسط الثاني
- θ₁ : زاوية السقوط
- θ₂ : زاوية الانكسار

**تطبيقات على انكسار الضوء:**
🔹 العدسات (نظارات، مجاهر)
🔹 قوس قزح
🔹 الماسحات الضوئية

هل تريد توضيحاً أكثر؟ ✨`
    }
    
    if (q.includes('شغل') || q.includes('طاقة')) {
      return `**الشغل والطاقة:**

**الشغل (Work):**
الشغل هو الطاقة المنقولة من جسم إلى آخر عند تحريكه بمسافة معينة في اتجاه القوة.

\`\`\`
W = F × d × cos(θ)
الشغل = القوة × المسافة × جيب زاوية الاتجاه
\`\`\`

**الطاقة الحركية:**
\`\`\`
KE = ½ × m × v²
الطاقة الحركية = ½ × الكتلة × (السرعة)²
\`\`\`

**الطاقة الكامنة:**
\`\`\`
PE = m × g × h
الطاقة الكامنة = الكتلة × تسارع الجاذبية × الارتفاع
\`\`\`

**ملاحظة مهمة:** حسب نظرية الشغل والطاقة: الشغل الكلي = التغير في الطاقة الحركية

هل لديك سؤال آخر؟ 🚀`
    }

    return `سؤال ممتاز! 🤔

للأسف، أحتاج لمزيد من التحديد لأتمكن من مساعدتك بشكل أفضل.

**يمكنني مساعدتك في:**
📖 شرح المفاهيم الفيزيائية
🔢 حل المسائل الحسابية
📝 شرح القوانين والنظريات
💡 تطبيقات الحياة الواقعية

**جرّب أن تسأل مثلاً:**
- "ما هي قوانين نيوتن؟"
- "احسب تسارع جسم..."
- "اشرح ظاهرة..."

أو اختر من الأسئلة السريعة أدناه! 🎯`
  }

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Bot className="w-7 h-7 text-primary" />
            المساعد الذكي للفيزياء
          </h1>
          <p className="text-slate-400">اسأل أي سؤال فيزياء وسأساعدك!</p>
        </div>

        {/* Quick Questions */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            أسئلة سريعة:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.text)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
              >
                <q.icon className="w-4 h-4 text-primary" />
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <Card className="flex flex-col h-[500px]">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary' 
                      : 'bg-gradient-to-br from-primary to-accent'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-slate-800 rounded-tl-none'
                        : 'bg-primary/20 rounded-tr-none'
                    }`}>
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-2 py-1 rounded text-xs">$1</code>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    </div>
                    <p className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-end">
                <div className="flex gap-3">
                  <div className="bg-primary/20 p-4 rounded-2xl rounded-tr-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب سؤالك هنا..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="input flex-1"
              />
              <Button onClick={handleSend} disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              <GraduationCap className="w-3 h-3 inline ml-1" />
              مساعد ذكي للفيزياء - اسأل أي سؤال!
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: BookOpen, label: 'شرح المفاهيم', color: 'text-blue-400' },
            { icon: Calculator, label: 'حل المسائل', color: 'text-emerald-400' },
            { icon: Atom, label: 'نظريات فيزياء', color: 'text-purple-400' },
            { icon: Lightbulb, label: 'نصائح للاختبار', color: 'text-amber-400' }
          ].map((item, i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-slate-800/50">
              <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <p className="text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}