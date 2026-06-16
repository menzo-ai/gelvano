'use client'

import { useState } from 'react'
import Card, { CardContent } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Avatar from '@/components/ui/avatar'
import { Trophy, Medal, TrendingUp, Flame, Calendar } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  avatar?: string
  schoolYear: number
  points: number
  completedLectures: number
  streak: number
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'أحمد محمد', schoolYear: 3, points: 2450, completedLectures: 45, streak: 15 },
  { rank: 2, name: 'فاطمة علي', schoolYear: 2, points: 2380, completedLectures: 42, streak: 12 },
  { rank: 3, name: 'محمد خالد', schoolYear: 1, points: 2200, completedLectures: 38, streak: 10 },
  { rank: 4, name: 'سارة أحمد', schoolYear: 3, points: 2150, completedLectures: 36, streak: 8 },
  { rank: 5, name: 'عمر سعيد', schoolYear: 2, points: 2100, completedLectures: 35, streak: 7 },
  { rank: 6, name: 'نورا يوسف', schoolYear: 1, points: 2050, completedLectures: 33, streak: 9 },
  { rank: 7, name: 'يوسف إبراهيم', schoolYear: 3, points: 2000, completedLectures: 32, streak: 6 },
  { rank: 8, name: 'ليلى حسن', schoolYear: 2, points: 1950, completedLectures: 30, streak: 5 },
  { rank: 9, name: 'خالد عبدالله', schoolYear: 1, points: 1900, completedLectures: 28, streak: 4 },
  { rank: 10, name: 'مريم سمير', schoolYear: 3, points: 1850, completedLectures: 26, streak: 3 },
]

const myRank: LeaderboardEntry = {
  rank: 24,
  name: 'أنت',
  schoolYear: 1,
  points: 1200,
  completedLectures: 18,
  streak: 2,
}

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-amber-400" />
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />
      default:
        return <span className="w-6 text-center font-bold text-slate-400">{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">التصنيف</h1>
          <p className="text-slate-400">تنافس مع زملائك وحقق المرتبة الأولى</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[
          { id: 'weekly', label: 'الأسبوع', icon: Calendar },
          { id: 'monthly', label: 'الشهر', icon: Calendar },
          { id: 'all', label: 'الكل', icon: Trophy },
        ].map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.id
                ? 'bg-primary text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <period.icon className="w-4 h-4" />
            {period.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {mockLeaderboard.slice(0, 3).map((entry, index) => (
          <Card
            key={entry.rank}
            className={`text-center ${
              index === 0 ? 'order-2 md:order-1' : 
              index === 1 ? 'order-1 md:order-2 -mt-4' : 
              'order-3 md:order-3 -mt-4'
            }`}
          >
            <CardContent className="pt-6">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                entry.rank === 1 ? 'bg-amber-400/20' :
                entry.rank === 2 ? 'bg-slate-300/20' :
                'bg-amber-700/20'
              }`}>
                <Avatar name={entry.name} size="lg" />
              </div>
              
              {entry.rank === 1 && (
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              )}
              
              <h3 className="font-bold mb-1">{entry.name}</h3>
              <p className="text-2xl font-bold text-primary mb-1">{entry.points} نقطة</p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                <span>{entry.completedLectures} محاضرة</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {entry.streak}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-bold">التصنيف الكامل</h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-10 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <Avatar name={entry.name} size="sm" />
                <div className="flex-1">
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-slate-400">الصف {entry.schoolYear}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">{entry.points}</p>
                  <p className="text-xs text-slate-400">نقطة</p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{entry.points}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Rank */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
            {myRank.rank}
          </div>
          <Avatar name={myRank.name} size="md" />
          <div className="flex-1">
            <p className="font-medium">ترتيبك</p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{myRank.points} نقطة</span>
              <span>•</span>
              <span>{myRank.completedLectures} محاضرة</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {myRank.streak} أيام متتالية
              </span>
            </div>
          </div>
          <Badge variant="primary">الصف {myRank.schoolYear}</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
