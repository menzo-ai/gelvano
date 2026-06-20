'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { 
  Settings, 
  Save, 
  Image as ImageIcon, 
  Users, 
  Link as LinkIcon,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  Upload
} from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'

interface Instructor {
  id: string
  name: string
  title: string
  image: string
  rating: number
}

interface PlatformSettings {
  id: string
  platformName: string
  tagline: string
  description: string
  platformLogo: string
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroVideoUrl: string
  instructors: Instructor[]
  youtubeUrl: string
  facebookUrl: string
  whatsappUrl: string
  instagramUrl: string
  contactEmail: string
  contactPhone: string
  footerText: string
}

export default function PlatformSettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<PlatformSettings>({
    id: '',
    platformName: 'GELVANO',
    tagline: 'منصة تعليم الفيزياء',
    description: '',
    platformLogo: '',
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: 'ابدأ المذاكرة',
    heroVideoUrl: '',
    instructors: [],
    youtubeUrl: '',
    facebookUrl: '',
    whatsappUrl: '',
    instagramUrl: '',
    contactEmail: '',
    contactPhone: '',
    footerText: '',
  })

  // Check auth
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role) {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(prev => ({
            ...prev,
            ...data,
          }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'فشل في حفظ الإعدادات')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  // Add instructor
  const addInstructor = () => {
    const newInstructor: Instructor = {
      id: Date.now().toString(),
      name: '',
      title: 'مدرس',
      image: '',
      rating: 5,
    }
    setSettings(prev => ({
      ...prev,
      instructors: [...prev.instructors, newInstructor],
    }))
  }

  // Update instructor
  const updateInstructor = (id: string, field: keyof Instructor, value: any) => {
    setSettings(prev => ({
      ...prev,
      instructors: prev.instructors.map(inst => 
        inst.id === id ? { ...inst, [field]: value } : inst
      ),
    }))
  }

  // Remove instructor
  const removeInstructor = (id: string) => {
    setSettings(prev => ({
      ...prev,
      instructors: prev.instructors.filter(inst => inst.id !== id),
    }))
  }

  // Handle image upload (simulated - in production use S3/cloud storage)
  const handleImageUpload = (field: 'platformLogo' | 'heroImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, upload to cloud storage and get URL
      // For now, create local object URL
      const url = URL.createObjectURL(file)
      setSettings(prev => ({ ...prev, [field]: url }))
    }
  }

  // Handle instructor image upload
  const handleInstructorImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateInstructor(id, 'image', url)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إعدادات المنصة</h1>
            <p className="text-slate-400">إدارة محتوى الصفحة الرئيسية والمعلومات الأساسية</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          المعلومات الأساسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="اسم المنصة"
            value={settings.platformName}
            onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
            placeholder="مثال: GELVANO"
          />
          <Input
            label="الشعار (سطر)"
            value={settings.tagline}
            onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
            placeholder="مثال: منصة تعليم الفيزياء"
          />
          <div className="md:col-span-2">
            <label className="label">وصف المنصة</label>
            <textarea
              className="input min-h-[100px]"
              value={settings.description || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف مختصر عن المنصة..."
            />
          </div>
        </div>
      </Card>

      {/* Logo & Images */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          الصور والشعار
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Logo */}
          <div className="space-y-3">
            <label className="label">شعار المنصة</label>
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-primary transition-colors">
              {settings.platformLogo ? (
                <div className="relative">
                  <img 
                    src={settings.platformLogo} 
                    alt="Logo" 
                    className="w-24 h-24 mx-auto object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, platformLogo: '' }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">رفع شعار المنصة</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload('platformLogo', e)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="space-y-3">
            <label className="label">صورة Hero الرئيسية</label>
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-primary transition-colors">
              {settings.heroImage ? (
                <div className="relative">
                  <img 
                    src={settings.heroImage} 
                    alt="Hero" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, heroImage: '' }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">رفع صورة Hero</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload('heroImage', e)}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Hero Section Content */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          محتوى قسم Hero
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="عنوان Hero"
            value={settings.heroTitle || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
            placeholder="مثال: كل مشاكلك في الفيزياء محلولة!"
          />
          <div>
            <label className="label">وصف Hero</label>
            <textarea
              className="input min-h-[100px]"
              value={settings.heroSubtitle || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
              placeholder="وصف قسم Hero..."
            />
          </div>
          <Input
            label="نص زر CTA"
            value={settings.heroCtaText || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, heroCtaText: e.target.value }))}
            placeholder="مثال: ابدأ المذاكرة"
          />
          <Input
            label="رابط فيديو (اختياري)"
            value={settings.heroVideoUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, heroVideoUrl: e.target.value }))}
            placeholder="رابط فيديو تعريفي..."
          />
        </div>
      </Card>

      {/* Instructors */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            المدرسين / المعلمين
          </h2>
          <Button variant="outline" onClick={addInstructor}>
            <Plus className="w-4 h-4" />
            إضافة مدرس
          </Button>
        </div>
        
        {settings.instructors.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لم تتم إضافة مدرسين بعد</p>
            <p className="text-sm">اضغط على "إضافة مدرس" لإضافة مدرس جديد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.instructors.map((instructor, index) => (
              <div key={instructor.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start gap-4">
                  {/* Instructor Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                      {instructor.image ? (
                        <img 
                          src={instructor.image} 
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <label className="block mt-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleInstructorImageUpload(instructor.id, e)}
                      />
                      <span className="text-xs text-primary cursor-pointer hover:underline">
                        {instructor.image ? 'تغيير' : 'رفع صورة'}
                      </span>
                    </label>
                  </div>

                  {/* Instructor Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="الاسم"
                      value={instructor.name}
                      onChange={(e) => updateInstructor(instructor.id, 'name', e.target.value)}
                      placeholder="اسم المدرس"
                    />
                    <Input
                      label="المسمى الوظيفي"
                      value={instructor.title}
                      onChange={(e) => updateInstructor(instructor.id, 'title', e.target.value)}
                      placeholder="مثال: مدرس فيزياء"
                    />
                    <div className="space-y-2">
                      <label className="label">التقييم</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateInstructor(instructor.id, 'rating', star)}
                            className={`text-2xl ${star <= instructor.rating ? 'text-amber-400' : 'text-slate-600'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeInstructor(instructor.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          روابط السوشيال ميديا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="رابط YouTube"
            value={settings.youtubeUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            placeholder="https://youtube.com/@..."
            icon={<LinkIcon className="w-4 h-4" />}
          />
          <Input
            label="رابط Facebook"
            value={settings.facebookUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
            placeholder="https://facebook.com/..."
            icon={<LinkIcon className="w-4 h-4" />}
          />
          <Input
            label="رابط WhatsApp"
            value={settings.whatsappUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, whatsappUrl: e.target.value }))}
            placeholder="https://wa.me/..."
            icon={<LinkIcon className="w-4 h-4" />}
          />
          <Input
            label="رابط Instagram"
            value={settings.instagramUrl || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
            placeholder="https://instagram.com/..."
            icon={<LinkIcon className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          معلومات التواصل
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={settings.contactEmail || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            placeholder="email@example.com"
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="رقم الهاتف"
            type="tel"
            value={settings.contactPhone || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
            placeholder="01012345678"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Footer */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          نص الفوتر
        </h2>
        <Input
          label="نص الفوتر"
          value={settings.footerText || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
          placeholder="Developed by ..."
        />
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving} size="lg">
          <Save className="w-5 h-5" />
          حفظ جميع الإعدادات
        </Button>
      </div>
    </div>
  )
}
