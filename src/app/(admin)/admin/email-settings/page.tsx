'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Input from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import { 
  Mail,
  Settings,
  Send,
  RefreshCw,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

export default function EmailSettingsPage() {
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('GELVANO')
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showTestModal, setShowTestModal] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/email')
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setSmtpHost(data.config.smtpHost || '')
          setSmtpPort(data.config.smtpPort || '587')
          setSmtpUser(data.config.smtpUser || '')
          setSmtpPass(data.config.smtpPass || '')
          setFromEmail(data.config.fromEmail || '')
          setFromName(data.config.fromName || 'GELVANO')
          setEmailEnabled(data.enabled || false)
        }
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
    }
    setIsLoading(false)
  }

  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!smtpHost.trim()) {
      newErrors.smtpHost = 'خادم SMTP مطلوب'
    }

    if (!smtpUser.trim()) {
      newErrors.smtpUser = 'اسم المستخدم مطلوب'
    }

    if (!smtpPass.trim()) {
      newErrors.smtpPass = 'كلمة المرور مطلوبة'
    }

    if (!fromEmail.trim()) {
      newErrors.fromEmail = 'بريد المرسل مطلوب'
    } else if (!isValidEmail(fromEmail)) {
      newErrors.fromEmail = 'يرجى إدخال بريد إلكتروني صحيح'
    }

    if (!fromName.trim()) {
      newErrors.fromName = 'اسم المرسل مطلوب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSave = async () => {
    if (!validateSettings()) return

    setIsSaving(true)
    setSaveResult(null)

    try {
      const response = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: emailEnabled,
          config: {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPass,
            fromEmail,
            fromName
          }
        })
      })

      if (response.ok) {
        setSaveResult({ success: true, message: '✅ تم حفظ إعدادات البريد بنجاح!' })
      } else {
        const data = await response.json()
        setSaveResult({ success: false, message: data.message || '❌ فشل في الحفظ' })
      }
    } catch (error) {
      setSaveResult({ success: false, message: `❌ خطأ: ${error}` })
    }

    setIsSaving(false)
  }

  const handleTestConnection = async () => {
    if (!validateSettings()) return

    setIsTesting(true)
    setSaveResult(null)

    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          fromEmail,
          fromName
        })
      })

      const result = await response.json()
      setSaveResult(result)
    } catch (error) {
      setSaveResult({ success: false, message: `❌ خطأ: ${error}` })
    }

    setIsTesting(false)
  }

  const handleSendTestEmail = async () => {
    if (!testEmail || !isValidEmail(testEmail)) {
      setTestResult({ success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          fromEmail,
          fromName
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, message: `❌ خطأ: ${error}` })
    }

    setIsTesting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Mail className="w-7 h-7 text-primary" />
            إعدادات البريد الإلكتروني
          </h1>
          <p className="text-slate-400">إدارة إرسال رسائل البريد الإلكتروني</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={emailEnabled ? 'success' : 'danger'} className="text-sm px-4 py-2">
            {emailEnabled ? 'مفعل' : 'معطل'}
          </Badge>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={emailEnabled} 
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Status Card */}
      <Card className={emailEnabled ? 'border-emerald-500/30' : 'border-slate-700'}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${emailEnabled ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
              <Mail className={`w-7 h-7 ${emailEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {emailEnabled ? 'إرسال البريد مفعل' : 'إرسال البريد معطل'}
              </h3>
              <p className="text-sm text-slate-400">
                {emailEnabled 
                  ? 'النظام يستطيع إرسال رسائل البريد الإلكتروني' 
                  : 'قم بتفعيل البريد وأدخل الإعدادات لإرسال الرسائل'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="font-bold">إعدادات SMTP</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="خادم SMTP"
              value={smtpHost}
              onChange={(e) => { setSmtpHost(e.target.value); setErrors(prev => ({ ...prev, smtpHost: '' })) }}
              placeholder="smtp.gmail.com"
              error={errors.smtpHost}
            />
            <Input
              label="المنفذ (Port)"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587"
              type="number"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="اسم المستخدم"
              value={smtpUser}
              onChange={(e) => { setSmtpUser(e.target.value); setErrors(prev => ({ ...prev, smtpUser: '' })) }}
              placeholder="your-email@gmail.com"
              error={errors.smtpUser}
            />
            <div className="relative">
              <Input
                label="كلمة المرور / App Password"
                type={showPassword ? 'text' : 'password'}
                value={smtpPass}
                onChange={(e) => { setSmtpPass(e.target.value); setErrors(prev => ({ ...prev, smtpPass: '' })) }}
                placeholder="أدخل كلمة المرور"
                error={errors.smtpPass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-9 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="بريد المرسل"
              value={fromEmail}
              onChange={(e) => { setFromEmail(e.target.value); setErrors(prev => ({ ...prev, fromEmail: '' })) }}
              placeholder="noreply@gelvano.com"
              error={errors.fromEmail}
            />
            <Input
              label="اسم المرسل"
              value={fromName}
              onChange={(e) => { setFromName(e.target.value); setErrors(prev => ({ ...prev, fromName: '' })) }}
              placeholder="GELVANO"
              error={errors.fromName}
            />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-200 font-medium mb-1">مهم!</p>
                <p className="text-sm text-amber-200/80">
                  إذا كنت تستخدم Gmail، يجب استخدام "App Password" بدلاً من كلمة المرور العادية.
                  يمكنك إنشاء واحدة من إعدادات Google Account → Security → App Passwords
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  اختبار الاتصال
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowTestModal(true)}
              variant="outline"
              className="flex-1"
            >
              <Send className="w-4 h-4" />
              إرسال بريد تجريبي
            </Button>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </div>

          {saveResult && (
            <div className={`p-4 rounded-xl ${saveResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className="flex items-center gap-2">
                {saveResult.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={saveResult.success ? 'text-emerald-400' : 'text-red-400'}>
                  {saveResult.message}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <h3 className="font-bold">قوالب البريد</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>رسالة التحقق (OTP)</span>
              </div>
              <Badge variant="success">مفعل</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>رسالة الترحيب</span>
              </div>
              <Badge variant="success">مفعل</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>استعادة كلمة المرور</span>
              </div>
              <Badge variant="success">مفعل</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Modal */}
      <Modal 
        isOpen={showTestModal} 
        onClose={() => { setShowTestModal(false); setTestEmail(''); setTestResult(null); }}
        title="إرسال بريد تجريبي"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            أدخل البريد الإلكتروني الذي تريد إرسال رسالة تجريبية إليه
          </p>
          <Input
            label="بريد إلكتروني"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
          
          {testResult && (
            <div className={`p-4 rounded-xl ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={testResult.success ? 'text-emerald-400' : 'text-red-400'}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => { setShowTestModal(false); setTestEmail(''); setTestResult(null); }}
            >
              إلغاء
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSendTestEmail}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
