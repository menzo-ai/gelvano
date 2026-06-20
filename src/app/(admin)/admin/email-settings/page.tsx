'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Toggle from '@/components/ui/toggle'
import { 
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  TestTube
} from 'lucide-react'

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null)
  const [settings, setSettings] = useState({
    emailEnabled: false,
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    fromName: 'GELVANO',
    fromEmail: 'noreply@gelvano.com'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/email-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
      } else {
        throw new Error('فشل الحفظ')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/email-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'تم إرسال رسالة اختبار بنجاح!' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'فشل إرسال رسالة الاختبار' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال رسالة الاختبار' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Mail className="w-7 h-7 text-primary" />
          إعدادات البريد الإلكتروني
        </h1>
        <p className="text-slate-400">إدارة إرسال رسائل البريد الإلكتروني للتحقق وغيرها</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Enable Toggle */}
      <Card>
        <CardHeader>
          <h2 className="font-bold">تفعيل البريد الإلكتروني</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تفعيل إرسال الرسائل</p>
              <p className="text-sm text-slate-400">تفعيل لإرسال رسائل التحقق والتذكير</p>
            </div>
            <Toggle 
              checked={settings.emailEnabled}
              onChange={(checked) => setSettings({...settings, emailEnabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <Card>
        <CardHeader>
          <h2 className="font-bold">إعدادات خادم SMTP</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="خادم SMTP"
              placeholder="smtp.gmail.com"
              value={settings.host}
              onChange={(e) => setSettings({...settings, host: e.target.value})}
              disabled={!settings.emailEnabled}
            />
            <Input
              label="المنفذ"
              placeholder="587"
              value={settings.port}
              onChange={(e) => setSettings({...settings, port: e.target.value})}
              disabled={!settings.emailEnabled}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="اسم المستخدم (البريد)"
              placeholder="your-email@gmail.com"
              value={settings.user}
              onChange={(e) => setSettings({...settings, user: e.target.value})}
              disabled={!settings.emailEnabled}
            />
            <Input
              label="كلمة المرور / App Password"
              type="password"
              placeholder="كلمة المرور أو App Password"
              value={settings.password}
              onChange={(e) => setSettings({...settings, password: e.target.value})}
              disabled={!settings.emailEnabled}
            />
          </div>

          <div className="flex items-center gap-4">
            <Toggle 
              checked={settings.secure}
              onChange={(checked) => setSettings({...settings, secure: checked})}
              disabled={!settings.emailEnabled}
            />
            <div>
              <p className="font-medium">استخدام SSL/TLS</p>
              <p className="text-sm text-slate-400">تفعيل الاتصال الآمن (port 465)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="اسم المرسل"
              placeholder="GELVANO"
              value={settings.fromName}
              onChange={(e) => setSettings({...settings, fromName: e.target.value})}
              disabled={!settings.emailEnabled}
            />
            <Input
              label="بريد المرسل"
              placeholder="noreply@gelvano.com"
              value={settings.fromEmail}
              onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
              disabled={!settings.emailEnabled}
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">معلومات مهمة لـ Gmail:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• إذا كنت تستخدم Gmail، تحتاج لـ "App Password" بدلاً من كلمة مرور حسابك</li>
              <li>• لإنشاء App Password: حسابي Google → الأمان → كلمة المرور للتطبيقات</li>
              <li>• تأكد من تفعيل "الوصول لتطبيقات أقل أماناً" أو استخدم App Password</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleTest}
          disabled={!settings.emailEnabled || testing}
          variant="outline"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 ml-2" />
          )}
          إرسال رسالة اختبار
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  )
}
