'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardContent, CardHeader } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { 
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Target,
  Trophy,
  RotateCcw,
  Loader2,
  Sparkles,
  FileText,
  Send
} from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'سهل' | 'متوسط' | 'صعب'
}

interface TestConfig {
  subject: string
  description: string
  questionCount: number
  difficulty: string
  time: number
}

const SUBJECTS = [
  { id: 'physics', name: 'الفيزياء', icon: '⚛️' },
  { id: 'chemistry', name: 'الكيمياء', icon: '🧪' },
  { id: 'math', name: 'الرياضيات', icon: '📐' },
  { id: 'arabic', name: 'اللغة العربية', icon: '📖' },
  { id: 'english', name: 'اللغة الإنجليزية', icon: '📝' },
  { id: 'french', name: 'الفرنسية', icon: '🇫🇷' },
  { id: 'history', name: 'التاريخ', icon: '📜' },
  { id: 'geography', name: 'الجغرافيا', icon: '🌍' },
  { id: 'philosophy', name: 'الفلسفة', icon: '🤔' },
  { id: 'psychology', name: 'علم النفس', icon: '🧠' },
  { id: 'economics', name: 'الاقتصاد', icon: '💰' },
  { id: 'islamic', name: 'الدراسات الإسلامية', icon: '🕌' }
]

const DIFFICULTIES = [
  { id: 'all', name: 'الكل', color: 'bg-blue-500' },
  { id: 'easy', name: 'سهل', color: 'bg-emerald-500' },
  { id: 'medium', name: 'متوسط', color: 'bg-amber-500' },
  { id: 'hard', name: 'صعب', color: 'bg-red-500' }
]

const TIME_OPTIONS = [5, 10, 15, 30, 60]

const QUESTION_COUNTS = [5, 10, 20, 50]

export default function AITestPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<'config' | 'test' | 'results'>('config')
  const [config, setConfig] = useState<TestConfig>({
    subject: '',
    description: '',
    questionCount: 10,
    difficulty: 'all',
    time: 15
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    correct: number
    total: number
    percentage: number
    timeTaken: number
  } | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (step === 'test' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step])

  const generateTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.subject,
          description: config.description,
          questionCount: config.questionCount,
          difficulty: config.difficulty,
          userAzhar: user?.isAzhar || false
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || generateMockQuestions())
      } else {
        setQuestions(generateMockQuestions())
      }
    } catch (error) {
      setQuestions(generateMockQuestions())
    } finally {
      setLoading(false)
      setStep('test')
      setTimeLeft(config.time * 60)
    }
  }

  const generateMockQuestions = (): Question[] => {
    const mockQuestions: Question[] = []
    const difficulties: ('سهل' | 'متوسط' | 'صعب')[] = ['سهل', 'متوسط', 'صعب']
    
    for (let i = 0; i < config.questionCount; i++) {
      let difficulty: 'سهل' | 'متوسط' | 'صعب' = 'متوسط'
      if (config.difficulty === 'easy') difficulty = 'سهل'
      else if (config.difficulty === 'medium') difficulty = 'متوسط'
      else if (config.difficulty === 'hard') difficulty = 'صعب'
      else if (config.difficulty === 'all') difficulty = difficulties[Math.floor(Math.random() * 3)]
      
      mockQuestions.push({
        id: i + 1,
        question: `سؤال رقم ${i + 1} - ${config.subject} (${difficulty})`,
        options: [
          'الإجابة الأولى',
          'الإجابة الثانية',
          'الإجابة الثالثة',
          'الإجابة الرابعة'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        difficulty
      })
    }
    return mockQuestions
  }

  const handleAnswer = (answerIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleFinishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++
    })
    
    const totalTime = config.time * 60 - timeLeft
    setResults({
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      timeTaken: totalTime
    })
    setStep('results')
  }

  const handleRestart = () => {
    setStep('config')
    setQuestions([])
    setAnswers({})
    setCurrentQuestion(0)
    setResults(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (step === 'config') {
    return (
      <div className="min-h-screen bg-slate-900 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">الاختبار بالذكاء الاصطناعي</h1>
            <p className="text-slate-400">أنشئ اختبار مخصص بناءً على المادة والمستوى</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                إعدادات الاختبار
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-3">المادة</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setConfig({ ...config, subject: subject.name })}
                      className={`p-4 rounded-xl border transition-all ${
                        config.subject === subject.name
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{subject.icon}</span>
                      <span className="text-sm">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">وصف الاختبار (اختياري)</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="مثال: أسئلة على الباب الأول - الحركة والقوة..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  rows={3}
                />
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium mb-3">عدد الأسئلة</label>
                <div className="flex flex-wrap gap-3">
                  {QUESTION_COUNTS.map(count => (
                    <button
                      key={count}
                      onClick={() => setConfig({ ...config, questionCount: count })}
                      className={`px-6 py-3 rounded-xl border transition-all ${
                        config.questionCount === count
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">مخصص:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.questionCount}
                      onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) || 10 })}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-3">مستوى الصعوبة</label>
                <div className="flex flex-wrap gap-3">
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setConfig({ ...config, difficulty: diff.id })}
                      className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                        config.difficulty === diff.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${diff.color}`} />
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-3">الوقت (دقائق)</label>
                <div className="flex flex-wrap gap-3">
                  {TIME_OPTIONS.map(time => (
                    <button
                      key={time}
                      onClick={() => setConfig({ ...config, time })}
                      className={`px-6 py-3 rounded-xl border transition-all ${
                        config.time === time
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateTest}
                disabled={!config.subject || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري إنشاء الاختبار...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    ابدأ الاختبار
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'test') {
    const q = questions[currentQuestion]
    return (
      <div className="min-h-screen bg-slate-900 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="primary" className="text-lg px-4 py-2">
                السؤال {currentQuestion + 1} / {questions.length}
              </Badge>
              <Badge 
                variant={
                  q.difficulty === 'سهل' ? 'success' : 
                  q.difficulty === 'متوسط' ? 'warning' : 'danger'
                }
              >
                {q.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  i === currentQuestion
                    ? 'bg-primary text-white'
                    : answers[i] !== undefined
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-6">{q.question}</h2>
              <div className="space-y-3">
                {q.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full p-4 rounded-xl border text-right transition-all ${
                      answers[currentQuestion] === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 ml-3">
                      {i + 1}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              السابق
            </Button>
            <div className="flex gap-3">
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={handleNext}>
                  التالي
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              ) : (
                <Button onClick={handleFinishTest} className="bg-emerald-500 hover:bg-emerald-600">
                  <CheckCircle className="w-5 h-5 ml-2" />
                  إنهاء الاختبار
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'results' && results) {
    const isPassed = results.percentage >= 60
    return (
      <div className="min-h-screen bg-slate-900 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center mb-8">
            <CardContent className="p-8">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isPassed ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
                {isPassed ? (
                  <Trophy className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-400" />
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isPassed ? 'أحسنت! 🎉' : 'حاول مرة أخرى 💪'}
              </h1>
              <p className="text-slate-400 mb-6">
                {isPassed ? 'لقد اجتزت الاختبار بنجاح' : 'لم تصل للنسبة المطلوبة (60%)'}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className={`text-4xl font-bold mb-2 ${
                    results.percentage >= 60 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {results.percentage}%
                  </div>
                  <div className="text-sm text-slate-400">النتيجة</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-4xl font-bold mb-2 text-emerald-400">
                    {results.correct}
                  </div>
                  <div className="text-sm text-slate-400">إجابات صحيحة</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-4xl font-bold mb-2 text-blue-400">
                    {formatTime(results.timeTaken)}
                  </div>
                  <div className="text-sm text-slate-400">الوقت المستغرق</div>
                </div>
              </div>

              {/* Question Review */}
              <div className="text-right mb-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  مراجعة الإجابات
                </h3>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        answers[i] === q.correctAnswer
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <span>السؤال {i + 1}</span>
                      {answers[i] === q.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={handleRestart} className="flex-1">
                  <RotateCcw className="w-5 h-5 ml-2" />
                  اختبار جديد
                </Button>
                <Button onClick={() => router.push('/dashboard')} className="flex-1">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  لوحة التحكم
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
