'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, BookOpen, Award, Users, Zap, Shield, Headphones, ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/button'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role === 'STUDENT') {
        router.push('/dashboard')
      } else {
        router.push('/admin')
      }
    }
  }, [session, status, router])

  const features = [
    {
      icon: BookOpen,
      title: 'محتوى تعليمي متميز',
      description: 'دروس فيديو عالية الجودة مع ملاحظات PDF لكل محاضرة',
    },
    {
      icon: Zap,
      title: 'تعلم ذكي',
      description: 'نظام متتبع للتقدم يساعدك على فهم مستواك وتطورك',
    },
    {
      icon: Award,
      title: 'اختبارات شاملة',
      description: 'اختبارات MCQ لكل محاضرة وفصل مع تصحيح تلقائي',
    },
    {
      icon: Headphones,
      title: 'دعم متواصل',
      description: 'فريق دعم جاهز لمساعدتك في أي وقت',
    },
    {
      icon: Shield,
      title: 'أمان عالي',
      description: 'حماية قوية لحسابك وبياناتك الشخصية',
    },
    {
      icon: Users,
      title: 'مجتمع تعليمي',
      description: 'تواصل مع زملائك ومعلمك بسهولة',
    },
  ]

  const grades = [
    {
      grade: 1,
      title: 'الصف الأول الثانوي',
      description: 'أساسيات الفيزياء الحديثة',
      chapters: 8,
      lectures: 45,
    },
    {
      grade: 2,
      title: 'الصف الثاني الثانوي',
      description: 'الفيزياء المتقدمة والتطبيقية',
      chapters: 10,
      lectures: 60,
    },
    {
      grade: 3,
      title: 'الصف الثالث الثانوي',
      description: 'التحضير لامتحانات الثانوية',
      chapters: 12,
      lectures: 75,
    },
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">GELVANO</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">تسجيل الدخول</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">سجل الآن</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              منصة تعليمية رائدة في مصر
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              أتقن الفيزياء مع
              <br />
              <span className="text-gradient">أستاذ خالد أسامة</span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              منصة تعليمية متكاملة للمرحلة الثانوية - محتوى متميز، اختبارات شاملة،
              ودعم متواصل لتحقيق أفضل النتائج
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  ابدأ الآن مجاناً
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  تصفح الدورات
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">+1000</p>
                <p className="text-slate-400 text-sm">طالب</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">+150</p>
                <p className="text-slate-400 text-sm">محاضرة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">98%</p>
                <p className="text-slate-400 text-sm">نسبة النجاح</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grades Section */}
      <section className="py-20 px-6 bg-surface-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">الدورات المتاحة</h2>
            <p className="text-slate-400">اختر الصف الدراسي المناسب لك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {grades.map((grade) => (
              <div
                key={grade.grade}
                className="card p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-primary text-sm px-3 py-1">
                    الصف {grade.grade}
                  </span>
                  <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                </div>

                <h3 className="text-xl font-bold mb-2">{grade.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{grade.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span>{grade.chapters} فصول</span>
                  <span>•</span>
                  <span>{grade.lectures} محاضرة</span>
                </div>

                <Button variant="outline" className="w-full group-hover:btn-primary transition-all">
                  عرض الدورة
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">لماذا GELVANO؟</h2>
            <p className="text-slate-400">مميزات تجعل تعلم الفيزياء تجربة ممتعة</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 text-center bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">جاهز لبدء رحلتك؟</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              انضم إلى آلاف الطلاب الذين يثقون بـ GELVANO لتحقيق أهدافهم التعليمية
            </p>
            <Link href="/register">
              <Button size="lg" className="glow-primary">
                سجل الآن وابدأ التعلم
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">GELVANO</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-slate-400 text-sm">
                Developed by Mohamed El-Manzalawy
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Instructor: Mr. Khaled Osama
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span>moha147wa@gmail.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
