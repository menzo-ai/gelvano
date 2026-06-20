'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Card, { CardContent, CardHeader } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Progress from '@/components/ui/progress'
import Modal from '@/components/ui/modal'
import { 
  Brain,
  FileQuestion,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Trophy,
  Target,
  Zap
} from 'lucide-react'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface TestConfig {
  subject: string
  description: string
  questionCount: number
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
  timeLimit: number
}

interface TestResult {
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
  score: number
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[]
}

const subjects = [
  { id: 'physics-1', name: 'الفيزياء - الصف الأول الثانوي', grade: 1 },
  { id: 'physics-2', name: 'الفيزياء - الصف الثاني الثانوي', grade: 2 },
  { id: 'physics-3', name: 'الفيزياء - الصف الثالث الثانوي', grade: 3 },
  { id: 'math-1', name: 'الرياضيات - الصف الأول الثانوي', grade: 1 },
  { id: 'math-2', name: 'الرياضيات - الصف الثاني الثانوي', grade: 2 },
  { id: 'math-3', name: 'الرياضيات - الصف الثالث الثانوي', grade: 3 },
  { id: 'arabic', name: 'اللغة العربية', grade: 0 },
  { id: 'english', name: 'اللغة الإنجليزية', grade: 0 },
  { id: 'chemistry', name: 'الكيمياء', grade: 0 },
  { id: 'biology', name: 'الأحياء', grade: 0 },
]

const difficultyLabels = {
  all: 'الكل',
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب'
}

const questionCounts = [5, 10, 20, 50]
const timeLimits = [5, 10, 15, 30, 60]

export default function AITestsPage() {
  const [testConfig, setTestConfig] = useState<TestConfig>({
    subject: '',
    description: '',
    questionCount: 10,
    difficulty: 'all',
    timeLimit: 15
  })
  const [customQuestionCount, setCustomQuestionCount] = useState<string>('')
  const [showCustomCount, setShowCustomCount] = useState(false)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isTestFinished, setIsTestFinished] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateMockQuestions = () => {
    const mockQuestions: Question[] = []
    for (let i = 0; i < testConfig.questionCount; i++) {
      mockQuestions.push({
        id: `q${i + 1}`,
        text: `سؤال رقم ${i + 1} - ما هي الإجابة الصحيحة؟`,
        options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
        correctAnswer: Math.floor(Math.random() * 4),
        difficulty: testConfig.difficulty === 'all' 
          ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard'
          : testConfig.difficulty
      })
    }
    setQuestions(mockQuestions)
    setIsTestStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setTimeRemaining(testConfig.timeLimit * 60)
    startTimeRef.current = Date.now()
    setIsTestFinished(false)
    setTestResult(null)
  }

  const generateQuestions = async () => {
    if (!testConfig.subject) {
      alert('يرجى اختيار المادة أولاً')
      return
    }

    setIsGenerating(true)
    generateMockQuestions()
    setIsGenerating(false)
  }

  useEffect(() => {
    if (isTestStarted && !isTestFinished && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTestStarted, isTestFinished, isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const handleFinishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setIsSubmitting(true)
    
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    let correctCount = 0
    
    const answers = questions.map(q => {
      const selectedAnswer = selectedAnswers[q.id]
      const isCorrect = selectedAnswer === q.correctAnswer
      if (isCorrect) correctCount++
      return {
        questionId: q.id,
        selectedAnswer: selectedAnswer ?? -1,
        isCorrect
      }
    })
    
    const score = Math.round((correctCount / questions.length) * 100)
    
    setTimeout(() => {
      setTestResult({
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
        score,
        answers
      })
      setIsTestFinished(true)
      setIsSubmitting(false)
    }, 1000)
  }, [questions, selectedAnswers])

  const handleRestartTest = () => {
    setIsTestStarted(false)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setIsTestFinished(false)
    setTestResult(null)
    setTimeRemaining(0)
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = questions.length > 0 
    ? Math.round((answeredCount / questions.length) * 100) 
    : 0

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary" />
            الاختبارات بالذكاء الاصطناعي
          </h1>
          <p className="text-slate-400">أنشئ اختبارات مخصصة بمساعدة الذكاء الاصطناعي</p>
        </div>
        <Badge variant="primary" className="text-sm">
          <Sparkles className="w-4 h-4 mr-1" />
          powered by menzo-ai
        </Badge>
      </div>

      {!isTestStarted && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              إعدادات الاختبار
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">المادة الدراسية</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setTestConfig({ ...testConfig, subject: subject.name })}
                    className={`p-4 rounded-xl border-2 transition-all text-right ${
                      testConfig.subject === subject.name
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <BookOpen className={`w-6 h-6 mb-2 ${testConfig.subject === subject.name ? 'text-primary' : 'text-slate-400'}`} />
                    <p className="font-medium text-sm">{subject.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وصف الاختبار (اختياري)</label>
              <Textarea
                value={testConfig.description}
                onChange={(e) => setTestConfig({ ...testConfig, description: e.target.value })}
                placeholder="مثال: أسئلة على قوانين نيوتن والحركة..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">عدد الأسئلة</label>
              <div className="flex flex-wrap gap-3">
                {questionCounts.map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      setTestConfig({ ...testConfig, questionCount: count })
                      setShowCustomCount(false)
                    }}
                    className={`px-6 py-3 rounded-xl border-2 transition-all ${
                      testConfig.questionCount === count && !showCustomCount
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-bold">{count}</span>
                    <span className="text-slate-400 text-sm mr-1">سؤال</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomCount(true)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all ${
                    showCustomCount
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold">مخصص</span>
                  <span className="text-slate-400 text-sm mr-1">(حتى 100)</span>
                </button>
              </div>
              {showCustomCount && (
                <div className="mt-3 max-w-xs">
                  <Input
                    type="number"
                    placeholder="أدخل عدد الأسئلة (1-100)"
                    value={customQuestionCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value > 0 && value <= 100) {
                        setCustomQuestionCount(e.target.value)
                        setTestConfig({ ...testConfig, questionCount: value })
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">مستوى الصعوبة</label>
              <div className="flex flex-wrap gap-3">
                {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setTestConfig({ ...testConfig, difficulty: diff })}
                    className={`px-6 py-3 rounded-xl border-2 transition-all ${
                      testConfig.difficulty === diff
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium">{difficultyLabels[diff]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">الوقت (دقائق)</label>
              <div className="flex flex-wrap gap-3">
                {timeLimits.map(time => (
                  <button
                    key={time}
                    onClick={() => setTestConfig({ ...testConfig, timeLimit: time })}
                    className={`px-6 py-3 rounded-xl border-2 transition-all ${
                      testConfig.timeLimit === time
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <Clock className={`w-4 h-4 inline ml-1 ${testConfig.timeLimit === time ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="font-medium">{time}</span>
                    <span className="text-slate-400 text-sm mr-1">دقيقة</span>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full py-4 text-lg"
              onClick={generateQuestions}
              disabled={!testConfig.subject || isGenerating}
              isLoading={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري إنشاء الاختبار...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  ابدأ الاختبار
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isTestStarted && !isTestFinished && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={timeRemaining <= 60 ? 'danger' : 'primary'} className="text-lg px-4 py-2">
                      <Clock className="w-5 h-5 ml-1" />
                      {formatTime(timeRemaining)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Zap className="w-4 h-4" /> : <Zap className="w-4 h-4 text-amber-400" />}
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-bold">{testConfig.subject}</h3>
                    <p className="text-sm text-slate-400">
                      السؤال {currentQuestionIndex + 1} / {questions.length}
                      {currentQuestion?.difficulty && (
                        <Badge 
                          variant={currentQuestion.difficulty === 'easy' ? 'success' : currentQuestion.difficulty === 'medium' ? 'warning' : 'danger'}
                          className="mr-2"
                        >
                          {difficultyLabels[currentQuestion.difficulty]}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Progress value={progressPercent} className="h-2" />
                    <p className="text-xs text-slate-400 mt-1 text-center">
                      {answeredCount} / {questions.length} إجابة
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleFinishTest}>
                    إنهاء الاختبار
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-white'
                    : selectedAnswers[q.id] !== undefined
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{currentQuestion.text}</h3>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                        selectedAnswers[currentQuestion.id] === index
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selectedAnswers[currentQuestion.id] === index
                            ? 'bg-primary text-white'
                            : 'bg-slate-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="flex-1">{option}</span>
                        {selectedAnswers[currentQuestion.id] === index && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronRight className="w-4 h-4 ml-1" />
                    السابق
                  </Button>
                  
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
                      التالي
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  ) : (
                    <Button variant="success" onClick={handleFinishTest}>
                      <CheckCircle className="w-4 h-4 ml-1" />
                      إنهاء الاختبار
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isTestFinished && testResult && (
        <div className="space-y-6">
          <Card className={testResult.score >= 60 ? 'border-emerald-500/30' : 'border-red-500/30'}>
            <CardContent className="p-8 text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                testResult.score >= 60 ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
                {testResult.score >= 60 ? (
                  <Trophy className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-400" />
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {testResult.score >= 60 ? 'تهانينا! 🎉' : 'حاول مرة أخرى 💪'}
              </h2>
              <p className="text-xl mb-6">
                حصلت على <span className={`font-bold ${
                  testResult.score >= 60 ? 'text-emerald-400' : 'text-red-400'
                }`}>{testResult.score}%</span>
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{testResult.totalQuestions}</p>
                  <p className="text-xs text-slate-400">إجمالي الأسئلة</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">{testResult.correctAnswers}</p>
                  <p className="text-xs text-slate-400">إجابات صحيحة</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-400">{formatTime(testResult.timeTaken)}</p>
                  <p className="text-xs text-slate-400">الوقت المستغرق</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-primary" />
                مراجعة الإجابات
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => {
                const answer = testResult.answers.find(a => a.questionId === question.id)
                const isCorrect = answer?.isCorrect
                const selectedAnswer = answer?.selectedAnswer

                return (
                  <div 
                    key={question.id}
                    className={`p-4 rounded-xl border ${
                      isCorrect 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.text}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className={`${selectedAnswer === question.correctAnswer ? 'text-emerald-400' : selectedAnswer !== undefined ? 'text-red-400 line-through' : 'text-slate-400'}`}>
                            إجابتك: {selectedAnswer !== undefined ? question.options[selectedAnswer] : 'لم تتم الإجابة'}
                          </p>
                          {!isCorrect && (
                            <p className="text-emerald-400">
                              الإجابة الصحيحة: {question.options[question.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={handleRestartTest}>
              <RotateCcw className="w-4 h-4 ml-2" />
              اختبار جديد
            </Button>
            <Button className="flex-1" onClick={() => window.location.href = '/ai-tutor'}>
              <Brain className="w-4 h-4 ml-2" />
              تحدث مع menzo-ai
            </Button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">جاري حساب النتيجة...</p>
          </Card>
        </div>
      )}
    </div>
  )
}
