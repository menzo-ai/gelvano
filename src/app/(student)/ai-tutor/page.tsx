'use client'

import { useState, useRef, useEffect } from 'react'
import Card, { CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import Link from 'next/link'
import { 
  Bot, 
  Send, 
  Sparkles,
  User,
  Upload,
  FileText,
  X,
  Loader2,
  Copy,
  CheckCircle,
  Brain,
  Lightbulb,
  BookOpen,
  Calculator,
  Atom,
  Trash2,
  RefreshCw,
  Image,
  ZoomIn,
  Search,
  SearchX,
  RotateCcw,
  Settings,
  Eye
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  searchResults?: string
}

interface Attachment {
  id: string
  type: 'image' | 'pdf'
  name: string
  url: string
  ocrText?: string
}

interface AISettings {
  isEnabled: boolean
  provider: string
  apiKey: string
  customPrompt: string
  searchEngine: string
}

const quickQuestions = [
  { icon: Atom, text: 'ما هي قوانين نيوتن للحركة؟' },
  { icon: Calculator, text: 'احسب تسارع جسم كتلته 10kg تؤثر عليه قوة 50N' },
  { icon: Lightbulb, text: 'اشرح ظاهرة انكسار الضوء' },
  { icon: BookOpen, text: 'ما الفرق بين الشغل والطاقة؟' }
]

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null)
  const [useSearch, setUseSearch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchAISettings()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchAISettings = async () => {
    try {
      const response = await fetch('/api/ai/settings')
      if (response.ok) {
        const data = await response.json()
        setAiSettings(data)
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'

      if (!isImage && !isPdf) {
        continue
      }

      const url = URL.createObjectURL(file)
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: isImage ? 'image' : 'pdf',
        name: file.name,
        url
      }

      if (isImage) {
        attachment.ocrText = '[صورة مرفقة - جاهزة للتحليل]'
      }

      setAttachments(prev => [...prev, attachment])
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const removed = prev.find(a => a.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return prev.filter(a => a.id !== id)
    })
  }

  const handleSend = async () => {
    if (!inputValue.trim() && attachments.length === 0) return

    let fullContent = inputValue
    if (attachments.length > 0) {
      const attachmentTexts = attachments.map(a => {
        if (a.ocrText) {
          return `[صورة مرفقة: ${a.name}]\n📸 **النص المستخرج من الصورة:**\n${a.ocrText}`
        }
        return `[ملف مرفق: ${a.name}]`
      }).join('\n\n')
      fullContent = `${attachmentTexts}\n\n❓ **سؤالي:** ${inputValue || 'ما رأيك في هذه المسألة؟'}`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || 'ما رأيك في هذه الصورة؟',
      timestamp: new Date(),
      attachments: [...attachments]
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullContent,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          searchQuery: useSearch ? inputValue : null,
          context: aiSettings?.customPrompt || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          searchResults: data.searchResults
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('API Error')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  // Check if AI is enabled
  if (aiSettings && !aiSettings.isEnabled) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
            <Brain className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">الذكاء الاصطناعي غير متاح</h2>
          <p className="text-slate-400 mb-6">
            عذراً، مساعد الذكاء الاصطناعي غير متاح حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.
          </p>
          <Link href="/dashboard">
            <Button>العودة للرئيسية</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مساعد الذكاء الاصطناعي</h1>
              <p className="text-sm text-slate-400">معلم فيزياء افتراضي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`p-2 rounded-lg transition-colors ${
                useSearch 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300'
              }`}
              title="البحث في الويب"
            >
              {useSearch ? <Search className="w-5 h-5" /> : <SearchX className="w-5 h-5" />}
            </button>
            {/* Clear Chat */}
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-300 transition-colors"
              title="مسح المحادثة"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            {/* Settings Link */}
            <Link
              href="/admin/ai-settings"
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-300 transition-colors"
              title="إعدادات الذكاء الاصطناعي"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="mb-6">
          <CardContent className="p-4">
            {/* Messages */}
            <div className="space-y-4 min-h-[400px] max-h-[60vh] overflow-y-auto mb-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">مرحباً بك!</h2>
                  <p className="text-slate-400 mb-6">
                    أنا مساعدك الذكي في الفيزياء. اسألني أي سؤال!
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInputValue(q.text)}
                        className="p-3 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700 text-right transition-colors flex items-center gap-2"
                      >
                        <q.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{q.text}</span>
                      </button>
                    ))}
                  </div>
                  {useSearch && (
                    <p className="text-sm text-blue-400 mt-4">
                      🔍 البحث في الويب مفعل - سيتم البحث عن معلومات إضافية
                    </p>
                  )}
                </div>
              )}

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-primary' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Brain className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {msg.attachments.map(att => (
                          <div key={att.id} className="relative">
                            {att.type === 'image' && (
                              <img 
                                src={att.url} 
                                alt={att.name}
                                className="max-h-32 rounded-lg cursor-pointer"
                                onClick={() => setSelectedImage(att.url)}
                              />
                            )}
                            {att.type === 'pdf' && (
                              <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none'
                    }`}>
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                    </div>

                    {/* Search Results */}
                    {msg.searchResults && (
                      <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                        <p className="text-blue-400 mb-2 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          نتائج البحث:
                        </p>
                        <p className="text-slate-300 whitespace-pre-wrap">{msg.searchResults}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                          title="نسخ"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-1">
                      {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Uploaded Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map(att => (
                  <div key={att.id} className="relative group">
                    {att.type === 'image' && (
                      <img src={att.url} alt={att.name} className="max-h-20 rounded-lg" />
                    )}
                    {att.type === 'pdf' && (
                      <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{att.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                title="رفع صورة أو ملف"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                placeholder="اكتب سؤالك هنا..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="input flex-1"
              />

              <Button
                onClick={handleSend}
                disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                isLoading={isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-2 text-center">
              <Image className="w-3 h-3 inline ml-1" />
              ارفع صور لاستخراج النصوص منها - حتى لو بخط اليد! ✨
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} title="معاينة الصورة" size="lg">
        {selectedImage && (
          <div>
            <img src={selectedImage} alt="Preview" className="w-full rounded-lg" />
            <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedImage(null)}>
              إغلاق
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
