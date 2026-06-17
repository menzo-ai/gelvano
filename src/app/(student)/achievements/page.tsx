'use client'

import { useState } from 'react'
import Card, { CardContent } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Progress from '@/components/ui/progress'
import { 
  Trophy, 
  Medal, 
  Star, 
  Zap, 
  Target, 
  Award,
  Flame,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  TrendingUp
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  target: number
  current: number
  xp: number
  unlocked: boolean
  unlockedAt?: string
  category: 'progress' | 'streak' | 'exam' | 'social'
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'البداية',
    description: 'ابدأ رحلتك التعليمية',
    icon: Star,
    progress: 100,
    target: 1,
    current: 1,
    xp: 50,
    unlocked: true,
    unlockedAt: '2024-01-01',
    category: 'progress'
  },
  {
    id: '2',
    title: 'متعلم نشيط',
    description: 'سجل في أول كورس',
    icon: BookOpen,
    progress: 100,
    target: 1,
    current: 1,
    xp: 100,
    unlocked: true,
    unlockedAt: '2024-01-05',
    category: 'progress'
  },
  {
    id: '3',
    title: 'أول اختبار',
    description: 'أجب على أول اختبار',
    icon: Target,
    progress: 100,
    target: 1,
    current: 1,
    xp: 150,
    unlocked: true,
    unlockedAt: '2024-01-10',
    category: 'exam'
  },
  {
    id: '4',
    title: 'الحضور المنتظم',
    description: 'تعلم لمدة 7 أيام متتالية',
    icon: Flame,
    progress: 71,
    target: 7,
    current: 5,
    xp: 200,
    unlocked: false,
    category: 'streak'
  },
  {
    id: '5',
    title: 'عبقري الفيزياء',
    description: 'احصل على 100% في اختبار',
    icon: Award,
    progress: 0,
    target: 100,
    current: 0,
    xp: 500,
    unlocked: false,
    category: 'exam'
  },
  {
    id: '6',
    title: 'خبير',
    description: 'أنهِ 10 محاضرات',
    icon: Zap,
    progress: 60,
    target: 10,
    current: 6,
    xp: 300,
    unlocked: false,
    category: 'progress'
  },
  {
    id: '7',
    title: 'التفوق',
    description: 'احصل على معدل 90% في الاختبارات',
    icon: Trophy,
    progress: 85,
    target: 90,
    current: 77,
    xp: 400,
    unlocked: false,
    category: 'exam'
  },
  {
    id: '8',
    title: 'محترف',
    description: 'أنهِ 5 كورسات',
    icon: Medal,
    progress: 40,
    target: 5,
    current: 2,
    xp: 500,
    unlocked: false,
    category: 'progress'
  }
]

const stats = {
  totalXP: 2450,
  level: 12,
  nextLevelXP: 3000,
  currentLevelXP: 2400,
  streak: 5,
  longestStreak: 14,
  completedCourses: 2,
  completedLectures: 6,
  completedExams: 3,
  averageScore: 77
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showLocked, setShowLocked] = useState(true)

  const filteredAchievements = achievements.filter(a => {
    if (!showLocked && !a.unlocked) return false
    if (selectedCategory === 'all') return true
    return a.category === selectedCategory
  })

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalXP = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xp, 0)

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            الإنجازات والمستوى
          </h1>
          <p className="text-slate-400">تتبع تقدمك واستمتع بالإنجازات</p>
        </div>

        {/* Level Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-3xl font-bold text-white">{stats.level}</span>
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-xl font-bold">المستوى {stats.level}</span>
                </div>
                <p className="text-slate-400 mb-3">{stats.totalXP.toLocaleString()} XP مجمعة</p>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">المستوى التالي</span>
                    <span>{stats.currentLevelXP} / {stats.nextLevelXP} XP</span>
                  </div>
                  <Progress value={(stats.currentLevelXP / stats.nextLevelXP) * 100} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-slate-400">أيام متتالية</p>
          </Card>
          <Card className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{stats.completedLectures}</p>
            <p className="text-xs text-slate-400">محاضرة مكتملة</p>
          </Card>
          <Card className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold">{stats.completedExams}</p>
            <p className="text-xs text-slate-400">اختبار مكتمل</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
            <p className="text-xs text-slate-400">متوسط الدرجات</p>
          </Card>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">الإنجازات</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={showLocked}
                  onChange={(e) => setShowLocked(e.target.checked)}
                  className="rounded"
                />
                عرض المقفلة
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input py-2 text-sm w-auto"
              >
                <option value="all">الكل</option>
                <option value="progress">التقدم</option>
                <option value="exam">الاختبارات</option>
                <option value="streak">الاستمرارية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => {
              const Icon = achievement.icon
              return (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden transition-all ${
                    achievement.unlocked 
                      ? 'border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10' 
                      : 'opacity-70'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                          : 'bg-slate-700'
                      }`}>
                        {achievement.unlocked ? (
                          <Icon className="w-7 h-7 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{achievement.title}</h3>
                          {achievement.unlocked && (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="warning">+{achievement.xp} XP</Badge>
                          {!achievement.unlocked && (
                            <span className="text-xs text-slate-500">
                              {achievement.current}/{achievement.target}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!achievement.unlocked && (
                      <div className="mt-3">
                        <Progress value={achievement.progress} />
                      </div>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="success" className="text-xs">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تم
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* XP History */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              آخر XP المكتسبة
            </h3>
            <div className="space-y-3">
              {[
                { action: 'أنهي محاضرة', xp: 20, date: 'اليوم' },
                { action: 'اجتاز اختبار', xp: 50, date: 'أمس' },
                { action: 'سلسلة 5 أيام', xp: 100, date: 'منذ 3 أيام' },
                { action: 'سجل في كورس', xp: 30, date: 'منذ أسبوع' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                  <Badge variant="warning">+{item.xp} XP</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}