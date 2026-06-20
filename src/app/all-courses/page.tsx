'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card, { CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { 
  GraduationCap,
  BookOpen,
  Users,
  Star,
  Play,
  Search,
  Award,
  Video,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string | null
  grade: number
  isPublished: boolean
  chapters?: { id: string; title: string; lectures: { id: string; title: string; duration: number | null }[] }[]
  createdAt: string
}

interface Lecture {
  id: string
  title: string
  description: string | null
  duration: number | null
  price: number
  thumbnail: string | null
  isFree: boolean
  chapter?: { title: string; course: { title: string; grade: number } }
}

export default function AllCoursesPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'lectures'>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch courses
      const coursesRes = await fetch('/api/courses')
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.filter((c: Course) => c.isPublished))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(c => {
    if (selectedGrade && c.grade !== selectedGrade) return false
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/20 via-slate-900 to-accent/20 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            جميع الكورسات والمحاضرات
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            استكشف مجموعتنا الكاملة من الكورسات والمحاضرات المميزة
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            <input
              type="text"
              placeholder="ابحث عن كورس أو محاضرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 h-14 text-lg bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'courses'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-5 h-5 inline-block ml-2" />
              الكورسات
            </button>
            <button
              onClick={() => setActiveTab('lectures')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'lectures'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Video className="w-5 h-5 inline-block ml-2" />
              محاضرات منفصلة
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Grade Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button
            variant={selectedGrade === null ? 'primary' : 'outline'}
            onClick={() => setSelectedGrade(null)}
            size="sm"
          >
            الكل
          </Button>
          {[1, 2, 3].map(grade => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'primary' : 'outline'}
              onClick={() => setSelectedGrade(grade)}
              size="sm"
            >
              <GraduationCap className="w-4 h-4 ml-2" />
              الصف {grade}
            </Button>
          ))}
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <Card className="p-4 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{filteredCourses.length}</p>
                <p className="text-xs text-slate-400">كورس</p>
              </Card>
              <Card className="p-4 text-center">
                <Video className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-2xl font-bold">
                  {filteredCourses.reduce((acc, c) => acc + (c.chapters?.reduce((a, ch) => a + ch.lectures.length, 0) || 0), 0)}
                </p>
                <p className="text-xs text-slate-400">محاضرة</p>
              </Card>
              <Card className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold">+2000</p>
                <p className="text-xs text-slate-400">طالب</p>
              </Card>
              <Card className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-xs text-slate-400">متوسط التقييم</p>
              </Card>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <Card key={course.id} className="overflow-hidden group hover:border-primary/30 transition-all">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <GraduationCap className="w-20 h-20 text-white/50 group-hover:scale-110 transition-transform" />
                    
                    {/* Grade Badge */}
                    <Badge variant="primary" className="absolute top-4 right-4">
                      <GraduationCap className="w-3 h-3 ml-1" />
                      الصف {course.grade}
                    </Badge>

                    {/* Chapters Badge */}
                    <Badge variant="info" className="absolute top-4 left-4">
                      <BookOpen className="w-3 h-3 ml-1" />
                      {course.chapters?.length || 0} فصل
                    </Badge>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/courses/${course.id}`}>
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                        م
                      </div>
                      <span className="text-sm text-slate-400">Mr. Khaled Osama</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.chapters?.length || 0} فصل
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {course.chapters?.reduce((acc, ch) => acc + ch.lectures.length, 0) || 0} محاضرة
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div>
                        <span className="text-2xl font-bold text-primary">{course.price}</span>
                        <span className="text-slate-400 mr-1">جنيه</span>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button>
                          <Play className="w-4 h-4 ml-2" />
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && !loading && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-bold mb-2">لا توجد كورسات</h3>
                <p className="text-slate-400">لم يتم إضافة كورسات بعد</p>
              </div>
            )}
          </>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="text-center py-16">
            <Video className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold mb-2">محاضرات منفصلة</h3>
            <p className="text-slate-400 mb-6">يمكنك الاشتراك في محاضرات مختارة بشكل منفصل</p>
            <Button variant="outline">
              قريباً...
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}