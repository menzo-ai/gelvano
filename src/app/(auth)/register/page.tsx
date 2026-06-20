'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone, BookOpen, Shield } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canRegister, setCanRegister] = useState(true)
  const [registrationType, setRegistrationType] = useState<'admin' | 'student'>('student')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    schoolYear: 1,
    isAzhar: false
  })

  useEffect(() => {
    fetch('/api/auth/check-registration')
      .then(res => res.json())
      .then(data => {
        setCanRegister(data.canRegister)
        if (data.canRegister) {
          setRegistrationType('admin')
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

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    const passwordError = validatePassword()
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'حدث خطأ أثناء التسجيل')
        return
      }

      router.push('/login')
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">GELVANO</span>
          </div>
        </div>

        <div className="card p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {registrationType === 'admin' ? 'إنشاء حساب مدير' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-slate-400">
              {registrationType === 'admin' 
                ? 'أنشئ أول حساب مدير للنظام' 
                : 'سجل الآن وابدأ رحلتك التعليمية'}
            </p>
          </div>

          {registrationType === 'admin' && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                هذا أول حساب يتم إنشاؤه، سيتم تعيينك كمدير عام للنظام.
                بعد ذلك، سيكون التسجيل للطلاب فقط.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="الاسم الكامل"
                className="pr-12"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                className="pr-12"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="tel"
                placeholder="رقم الهاتف"
                className="pr-12"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                className="pr-12"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="تأكيد كلمة المرور"
                className="pr-12"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-slate-600" />
                8 أحرف على الأقل
              </p>
              <p className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-slate-600" />
                حرف كبير واحد على الأقل
              </p>
              <p className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-slate-600" />
                رقم واحد على الأقل
              </p>
            </div>

            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="اسم ولى الأمر"
                className="pr-12"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="tel"
                placeholder="رقم هاتف ولى الأمر"
                className="pr-12"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">الصف الدراسي</label>
              <select
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value={1}>الصف الأول الثانوي</option>
                <option value={2}>الصف الثاني الثانوي</option>
                <option value={3}>الصف الثالث الثانوي</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isAzhar: false })}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  !formData.isAzhar
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">عام</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isAzhar: true })}
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  formData.isAzhar
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">أزهر</span>
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {registrationType === 'admin' ? 'إنشاء حساب المدير' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <span>لديك حساب بالفعل؟</span>
            <Link
              href="/login"
              className="text-primary hover:text-primary-light mr-1 transition-colors font-medium"
            >
              سجل دخولك
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Developed by Mohamed El-Manzalawy
        </p>
      </div>
    </div>
  )
}
