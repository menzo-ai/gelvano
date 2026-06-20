'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, Building2, Phone, Mail, Globe, Image } from 'lucide-react'
import Button from '@/components/ui/button'

interface PlatformSettings {
  name: string
  logo: string
  instructorName: string
  instructorImage: string
  email: string
  phone: string
  whatsapp: string
  facebook: string
  youtube: string
  description: string
  footerText: string
  isSubscriptionsEnabled: boolean
  isWalletEnabled: boolean
  isCodesEnabled: boolean
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    name: 'GELVANO',
    logo: '',
    instructorName: 'Khaled Osama',
    instructorImage: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    youtube: '',
    description: '',
    footerText: '',
    isSubscriptionsEnabled: true,
    isWalletEnabled: true,
    isCodesEnabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/platform-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setMessage('تم حفظ الإعدادات بنجاح!')
      } else {
        setMessage('حدث خطأ أثناء الحفظ')
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'instructorImage') => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...settings, [field]: data.url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إعدادات المنصة</h1>
        <p className="text-slate-400">إدارة إعدادات المنصة والمعلومات العامة</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400">
          {message}
        </div>
      )}

      <div className="grid gap-6">
        {/* Basic Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            المعلومات الأساسية
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">اسم المنصة</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">اسم المدرس</label>
              <input
                type="text"
                value={settings.instructorName}
                onChange={(e) => setSettings({ ...settings, instructorName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Logo & Images */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            الشعارات والصور
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">شعار المنصة</label>
              <div className="flex items-center gap-4">
                {settings.logo && (
                  <img src={settings.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>رفع شعار</span>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">صورة المدرس</label>
              <div className="flex items-center gap-4">
                {settings.instructorImage && (
                  <img src={settings.instructorImage} alt="Instructor" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'instructorImage')} />
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>رفع صورة</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            معلومات التواصل
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-10 pl-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-10 pl-4 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">واتساب</label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-10 pl-4 py-2 text-white"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">فيسبوك</label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.facebook}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-10 pl-4 py-2 text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">يوتيوب</label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.youtube}
                  onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-10 pl-4 py-2 text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-4">وصف المنصة</h2>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            placeholder="وصف المنصة الذي يظهر في الصفحة الرئيسية..."
          />
        </div>

        {/* System Settings */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-4">إعدادات النظام</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span>تفعيل نظام الاشتراكات</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.isSubscriptionsEnabled}
                  onChange={(e) => setSettings({ ...settings, isSubscriptionsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>تفعيل نظام المحفظة</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.isWalletEnabled}
                  onChange={(e) => setSettings({ ...settings, isWalletEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>تفعيل نظام الأكواد</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.isCodesEnabled}
                  onChange={(e) => setSettings({ ...settings, isCodesEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="self-end gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  )
}
