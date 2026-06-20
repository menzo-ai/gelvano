'use client'

import { useState } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Check, CreditCard, Calendar, Clock, AlertCircle, BookOpen, Users, GraduationCap, Building2, Atom } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Student type for subscription filtering
type StudentType = 'all' | 'azhar' | 'am'

const plans = [
  {
    id: 'monthly',
    name: 'اشتراك شهري',
    price: 150,
    duration: 'شهر',
    studentType: 'all' as StudentType,
    features: [
      'الوصول لجميع محاضرات الصف',
      'اختبارات غير محدودة',
      'دعم فني',
      'ملاحظات PDF',
      'تتبع التقدم',
    ],
    recommended: true,
  },
  {
    id: 'quarterly',
    name: 'اشتراك ربع سنوي',
    price: 400,
    duration: '3 أشهر',
    studentType: 'all' as StudentType,
    features: [
      'كل مميزات الاشتراك الشهري',
      'خصم 11%',
      'محاضرات إضافية مجانية',
      'جلسات مراجعة',
    ],
    recommended: false,
  },
  {
    id: 'yearly',
    name: 'اشتراك سنوي',
    price: 1200,
    duration: '12 شهر',
    studentType: 'all' as StudentType,
    features: [
      'كل مميزات الاشتراك الشهري',
      'خصم 33%',
      'محاضرات إضافية مجانية',
      'جلسات مراجعة',
      'دعم متقدم',
    ],
    recommended: false,
  },
]

// Azhar specific plans
const azharPlans = [
  {
    id: 'azhar-monthly',
    name: 'اشتراك الشهري الأزهري',
    price: 180,
    duration: 'شهر',
    studentType: 'azhar' as StudentType,
    features: [
      'محاضرات الأزهر الشريف',
      'منهج علوم الأزهر',
      'اختبارات الأزهر',
      'دعم فني متخصص',
      'ملاحظات PDF',
    ],
    recommended: true,
  },
  {
    id: 'azhar-quarterly',
    name: 'اشتراك ربع سنوي',
    price: 480,
    duration: '3 أشهر',
    studentType: 'azhar' as StudentType,
    features: [
      'كل مميزات الاشتراك الشهري',
      'خصم 11%',
      'محاضرات إضافية مجانية',
      'جلسات مراجعة',
    ],
    recommended: false,
  },
]

// Am specific plans
const amPlans = [
  {
    id: 'am-monthly',
    name: 'اشتراك الشهري العام',
    price: 150,
    duration: 'شهر',
    studentType: 'am' as StudentType,
    features: [
      'محاضرات الثانوية العامة',
      'منهج الثانوية العام',
      'اختبارات متخصصة',
      'دعم فني',
      'ملاحظات PDF',
    ],
    recommended: true,
  },
  {
    id: 'am-quarterly',
    name: 'اشتراك ربع سنوي',
    price: 400,
    duration: '3 أشهر',
    studentType: 'am' as StudentType,
    features: [
      'كل مميزات الاشتراك الشهري',
      'خصم 11%',
      'محاضرات إضافية مجانية',
      'جلسات مراجعة',
    ],
    recommended: false,
  },
]

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [studentType, setStudentType] = useState<StudentType>('all')
  const [currentSubscription] = useState({
    status: 'active',
    plan: 'monthly',
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    studentType: 'all' as StudentType,
  })

  // Get plans based on student type
  const getPlans = () => {
    switch (studentType) {
      case 'azhar':
        return azharPlans
      case 'am':
        return amPlans
      default:
        return plans
    }
  }

  const currentPlans = getPlans()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">الاشتراكات</h1>
        <p className="text-slate-400">اختر الخطة المناسبة لك</p>
      </div>

      {/* Student Type Selection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            نوع التعليم
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setStudentType('all')}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                studentType === 'all'
                  ? 'border-primary bg-primary/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <Users className={`w-10 h-10 mx-auto mb-3 ${
                studentType === 'all' ? 'text-primary' : 'text-slate-400'
              }`} />
              <h4 className="font-bold mb-1">الكل</h4>
              <p className="text-sm text-slate-400">العام والأزهري</p>
            </button>
            
            <button
              onClick={() => setStudentType('azhar')}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                studentType === 'azhar'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <Building2 className={`w-10 h-10 mx-auto mb-3 ${
                studentType === 'azhar' ? 'text-emerald-400' : 'text-slate-400'
              }`} />
              <h4 className="font-bold mb-1">الأزهر الشريف</h4>
              <p className="text-sm text-slate-400">علوم الأزهر</p>
            </button>
            
            <button
              onClick={() => setStudentType('am')}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                studentType === 'am'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <Atom className={`w-10 h-10 mx-auto mb-3 ${
                studentType === 'am' ? 'text-blue-400' : 'text-slate-400'
              }`} />
              <h4 className="font-bold mb-1">الثانوية العامة</h4>
              <p className="text-sm text-slate-400">المنهج العام</p>
            </button>
          </div>

          {/* Type indicator */}
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 flex items-center justify-center gap-2">
            <span className="text-sm text-slate-400">عرض خطط:</span>
            <Badge variant={
              studentType === 'all' ? 'primary' : 
              studentType === 'azhar' ? 'success' : 'secondary'
            }>
              {studentType === 'all' ? 'الكل' : 
               studentType === 'azhar' ? 'الأزهر الشريف' : 'الثانوية العامة'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription */}
      {currentSubscription.status === 'active' && (
        <Card className={`bg-gradient-to-r ${
          studentType === 'azhar' ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' :
          studentType === 'am' ? 'from-blue-500/20 to-blue-500/5 border-blue-500/20' :
          'from-secondary/20 to-secondary/5 border-secondary/20'
        }`}>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                studentType === 'azhar' ? 'bg-emerald-500/20' :
                studentType === 'am' ? 'bg-blue-500/20' :
                'bg-secondary/20'
              }`}>
                <CreditCard className={`w-6 h-6 ${
                  studentType === 'azhar' ? 'text-emerald-400' :
                  studentType === 'am' ? 'text-blue-400' :
                  'text-secondary'
                }`} />
              </div>
              <div>
                <p className="font-medium">اشتراك نشط</p>
                <p className="text-sm text-slate-400">
                  متبقي: <span className={`font-medium ${
                    studentType === 'azhar' ? 'text-emerald-400' :
                    studentType === 'am' ? 'text-blue-400' :
                    'text-secondary'
                  }`}>15 يوم</span>
                </p>
              </div>
            </div>
            <div className="text-left">
              <Badge variant="success">نشط</Badge>
              <p className="text-sm text-slate-400 mt-1">
                ينتهي: {formatDate(currentSubscription.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {currentPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all ${
              plan.recommended ? 'ring-2 ring-primary/20' : ''
            } ${
              plan.studentType === 'azhar' ? 'border-emerald-500/30' :
              plan.studentType === 'am' ? 'border-blue-500/30' :
              ''
            }`}
          >
            {plan.recommended && (
              <div className={`absolute top-0 left-0 right-0 text-white text-center py-1 text-sm font-medium ${
                plan.studentType === 'azhar' ? 'bg-emerald-500' :
                plan.studentType === 'am' ? 'bg-blue-500' :
                'bg-primary'
              }`}>
                الأكثر طلباً
              </div>
            )}

            {/* Type badge */}
            {plan.studentType !== 'all' && (
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg ${
                plan.studentType === 'azhar' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {plan.studentType === 'azhar' ? 'الأزهر' : 'عام'}
              </div>
            )}

            <CardContent className={`pt-8 ${plan.recommended ? 'pt-12' : ''}`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400 mr-1">ج.م / {plan.duration}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${
                      plan.studentType === 'azhar' ? 'text-emerald-400' :
                      plan.studentType === 'am' ? 'text-blue-400' :
                      'text-secondary'
                    }`} />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.recommended ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {currentSubscription.status === 'active' ? 'ترقية' : 'اشترك الآن'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            معلومات مهمة
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>الاشتراك يبدأ من تاريخ الدفع ويتم تجديده تلقائياً</span>
            </li>
            <li className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>يمكنك إلغاء الاشتراك في أي وقت من الإعدادات</span>
            </li>
            <li className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>طرق الدفع المتاحة: بطاقة ائتمان، فودافون كاش، بطاقة خصم</span>
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>اختر نوع التعليم المناسب لك لعرض الخطط المخصصة</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
