'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, BookOpen, FileText, Video, Users, Brain, Play, CheckCircle, Youtube, Facebook, MessageCircle, Star, Trophy, Zap, Shield, Headphones, Award, Code, Calendar, Clock } from 'lucide-react'
import Button from '@/components/ui/button'

interface Course {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string | null
  grade: number
  isPublished: boolean
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      setIsLoggedIn(true)
    }

    // Fetch published courses
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        const publishedCourses = data.filter((c: Course) => c.isPublished)
        setCourses(publishedCourses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleStartLearning = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gradient">GELVANO</span>
              <p className="text-xs text-slate-400 -mt-1">Physics Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Social Links */}
            <div className="hidden md:flex items-center gap-2 mr-4">
              <a href="https://www.youtube.com/@Gelvano_ph12" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/people/Mr-khaled-osama/100064048811580/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/message/NI47K5DKEZUIE1" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            {/* Developer Link */}
            <Link 
              href="/developer"
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-primary"
              title="المطور"
            >
              <Code className="w-5 h-5" />
            </Link>
            
            {isLoggedIn ? (
              <Button onClick={() => router.push('/dashboard')} size="sm">
                لوحة التحكم
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">تسجيل الدخول</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">سجل الآن</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                منصة Physics Academy للفيزياء والعلوم المتكاملة
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                منصتك الأولى لتعلم
                <br />
                <span className="text-gradient">وفهم الفيزياء بأسلوب بسيط وممتع</span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                اهلاً بيك في بيتك التاني! سواء كنت في أولى، تانية، أو تالتة ثانوي، 
                هنا هتلاقي كل اللي تحتاجه علشان تتفوق في الفيزياء، وتفهمها صح، وتطبقها بسهولة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" onClick={handleStartLearning} className="gap-2 shadow-lg shadow-primary/20">
                  <Play className="w-5 h-5" />
                  ابدأ المذاكرة
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">+2.0M</p>
                  <p className="text-xs text-slate-400">متابعين على اليوتيوب</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">+1.0M</p>
                  <p className="text-xs text-slate-400">متابعين على الفيسبوك</p>
                </div>
              </div>

              {/* Instructor Badge */}
              <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                  خ
                </div>
                <div>
                  <p className="font-bold">Mr. Khaled Osama</p>
                  <p className="text-sm text-slate-400">Physics Teacher</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mr-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>

            {/* Right Image/Illustration - Teacher Image */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl" />
                <div className="absolute inset-8 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700 overflow-hidden">
                  <div className="text-center p-4">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">خ</span>
                    </div>
                    <p className="text-2xl font-bold">Physics Academy</p>
                    <p className="text-slate-400">Learn, Practice, Succeed</p>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div className="absolute top-10 right-10 bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-700 animate-bounce">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute bottom-20 left-0 bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-700 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute top-1/2 right-0 bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-700 animate-bounce" style={{ animationDelay: '1s' }}>
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Subscribe Section */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ليه تشترك معانا؟</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: '1شرح بسيط ومفهوم', desc: '' },
              { icon: Video, title: '2فيديوهات برسومات توضيحية', desc: '' },
              { icon: Award, title: '3تمارين تفاعلية على الدروس', desc: '' },
              { icon: Headphones, title: '4مرونة كاملة في المذاكرة', desc: '' },
              { icon: FileText, title: '5اختبارات مستمرة', desc: '' },
              { icon: Shield, title: '6محتوى متكامل ومنظم', desc: '' },
              { icon: Zap, title: '7تحديث مستمر حسب المنهج', desc: '' },
              { icon: Users, title: '8مجتمع طلابي ضخم', desc: '' },
            ].map((item, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section - Only show if courses exist */}
      {courses.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">كورساتنا المتاحة للعام 2025/2026</h2>
              <p className="text-slate-400">اختر الكورس المناسب لمستواك وابدأ رحلتك التعليمية</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <div key={course.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-primary/30 transition-all overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white/50" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-800/80 text-sm font-medium">
                      الصف {course.grade}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{course.price} جنيه</span>
                      <Button size="sm">
                        الإشتراك في الكورس
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {courses.length > 6 && (
              <div className="text-center mt-8">
                <Link href="/all-courses">
                  <Button variant="outline" size="lg">
                    عرض جميع الكورسات
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: BookOpen, 
                title: 'تنظيم الدروس والوحدات', 
                desc: 'كورسات مُقسّمة لوحدات صغيرة علشان تذاكر بترتيب وتِفضّل مُتابع بسهولة.'
              },
              { 
                icon: Video, 
                title: 'دروس بالفيديو والصور التوضيحية', 
                desc: 'شروحات مصوّرة مُفصّلة مع رسومات توضيحية وأسئلة شائعة مُجاب عنها.'
              },
              { 
                icon: Award, 
                title: 'تطبيقات وتمارين تفاعلية', 
                desc: 'تمارين تفاعلية بعد كل درس علشان تثبت المعلومة وتختبر نفسك.'
              },
            ].map((item, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-primary/30 transition-all">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Teacher Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">عن Mr. Khaled Osama</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Video, title: 'شروحات فيديو تفصيلية', desc: '' },
              { icon: Brain, title: 'تجارب ومحاكاة', desc: '' },
              { icon: FileText, title: 'اختبارات وواجبات', desc: '' },
            ].map((item, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 mt-8 text-lg">
            صحصح شوية وشد حيلك معانا… هنمشيها سوا خطوة بخطوة لحد ما تلم المنهج 
            الفيزياء وتبقى لعبه في ايدك .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gradient">GELVANO</span>
                  <p className="text-xs text-slate-400">Physics Platform</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                منصة تعليمية متكاملة للفيزياء والعلوم للمرحلة الثانوية
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>moha147wa@gmail.com</p>
                <p>01003092656</p>
                <div className="flex items-center gap-2 mt-3">
                  <a href="https://www.youtube.com/@Gelvano_ph12" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="https://www.facebook.com/people/Mr-khaled-osama/100064048811580/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/message/NI47K5DKEZUIE1" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              جميع الحقوق محفوظة © 2026 GELVANO
            </p>
            <p className="text-slate-500 text-xs">
              Instructor: Mr. Khaled Osama
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
