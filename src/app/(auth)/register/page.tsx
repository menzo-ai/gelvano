'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Toggle from '@/components/ui/toggle'
import Card, { CardContent } from '@/components/ui/card'
import { 
  GraduationCap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, 
  Phone, BookOpen, Shield, Loader2, Crown, Sparkles, Info
} from 'lucide-react'

const schoolYears = [
  { value: 1, label: 'الصف الأول الثانوي' },
  { value: 2, label: 'الصف الثاني الثانوي' },
  { value: 3, label: 'الصف الثالث الثانوي' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canRegister, setCanRegister] = useState(true)
  const [isFirstAdmin, setIsFirstAdmin] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    schoolYear: 3,
    isAzhar: false
  })

  useEffect(() => {
    fetch('/api/auth/register')
      .then(res => res.json())
      .then(data => {
        if (data.canRegister) {
          setCanRegister(true)
          setIsFirstAdmin(true)
        }
      })
      .catch(() => {})
  }, [])

  const validatePassword = () => {
    const password = formData.password
    if (password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    if (!/[A-Z]/.test(password)) return 'كلمة المرور يجب أن تحتوي على حرف كبير'
    if (!/[0-9]/.test(password)) return 'كلمة المرور يجب أن تحتوي على رقم'
    return ''
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) { setError('يرجى إدخال الاسم'); return }
    if (!formData.email.trim()) { setError('يرجى إدخال البريد الإلكتروني'); return }
    if (!formData.email.includes('@')) { setError('يرجى إدخال بريد إلكتروني صحيح'); return }
    if (!formData.phone.trim()) { setError('يرجى إدخال رقم الهاتف'); return }
    if (formData.phone.length < 11) { setError('رقم الهاتف يجب أن يكون 11 رقم على الأقل'); return }

    const passwordError = validatePassword()
    if (passwordError) { setError(passwordError); return }
    if (formData.password !== formData.confirmPassword) { setError('كلمة المرور غير متطابقة'); return }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'فشل التسجيل')
        return
      }

      if (data.isAdmin) {
        setSuccess('تم إنشاء حساب المدير بنجاح! جارِ التحويل...')
        setTimeout(() => router.push('/login'), 2000)
      } else if (data.needsVerification) {
        setSuccess('تم إنشاء الحساب! يرجى تفعيل حسابك من خلال البريد الإلكتروني.')
        setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`), 2000)
      } else {
        setSuccess('تم إنشاء الحساب بنجاح!')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { test: formData.password.length >= 8, text: '8 أحرف على الأقل' },
    { test: /[A-Z]/.test(formData.password), text: 'حرف كبير واحد على الأقل' },
    { test: /[0-9]/.test(formData.password), text: 'رقم واحد على الأقل' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-slate-400 mt-2">سجل الآن وابدأ رحلتك التعليمية</p>
        </div>

        {/* Admin Notice */}
        {isFirstAdmin && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-400">تسجيل حساب المدير</p>
                <p className="text-sm text-slate-400 mt-1">
                  هذا هو أول حساب في المنصة، سيتم تسجيلك كمدير نظام.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400">{success}</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="محمد وليد"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="example@email.com"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="01012345678"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Parent Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم ولى الأمر</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تليفون ولى الأمر</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="01012345678"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* School Year & Azhar */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الصف الدراسي</label>
                  <select
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({...formData, schoolYear: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  >
                    {schoolYears.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div>
                    <p className="font-medium">تعليم ازهرى؟</p>
                    <p className="text-xs text-slate-400">هل أنت في الأزهر</p>
                  </div>
                  <Toggle
                    checked={formData.isAzhar}
                    onChange={(checked) => setFormData({...formData, isAzhar: checked})}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="••••••••"
                    dir="ltr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${req.test ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {req.test ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                      {req.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                    placeholder="••••••••"
                    dir="ltr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={isLoading} className="w-full gradient-primary text-lg py-6 mt-4">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جارِ التسجيل...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    إنشاء الحساب
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-4">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                سجل دخولك
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-4">
          Developed by Mohamed El-Manzalawy
        </p>
      </div>
    </div>
  )
}
