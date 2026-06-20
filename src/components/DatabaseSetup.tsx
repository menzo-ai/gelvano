'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Database, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  X
} from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import { DB_PROVIDERS, getDbProviderById, type DbProvider, type DbField } from '@/lib/db-providers'

interface DatabaseSetupProps {
  onComplete?: () => void
}

export default function DatabaseSetup({ onComplete }: DatabaseSetupProps) {
  const router = useRouter()
  const [step, setStep] = useState<'select' | 'configure' | 'testing' | 'success'>('select')
  const [selectedProvider, setSelectedProvider] = useState<DbProvider | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [currentInfoProvider, setCurrentInfoProvider] = useState<string | null>(null)

  const handleSelectProvider = (providerId: string) => {
    setSelectedProvider(providerId as DbProvider)
    setConfig({})
    setStep('configure')
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!selectedProvider) return
    
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, config })
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, message: `خطأ في الاتصال: ${error}` })
    }

    setTesting(false)
  }

  const handleSaveConfiguration = async () => {
    if (!selectedProvider) return
    
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, config })
      })
      
      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          onComplete?.()
          router.push('/register')
        }, 2000)
      } else {
        const result = await response.json()
        setTestResult({ success: false, message: result.message || 'فشل في الحفظ' })
      }
    } catch (error) {
      setTestResult({ success: false, message: `خطأ في الحفظ: ${error}` })
    }

    setIsSaving(false)
  }

  const providerInfo = selectedProvider ? getDbProviderById(selectedProvider) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg shadow-primary/30">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">إعداد قاعدة البيانات</h1>
          <p className="text-slate-400">اختر قاعدة البيانات المناسبة لموقعك</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {['الاختيار', 'الإعداد', 'التجربة', 'تم'].map((label, index) => {
              const currentStep = step === 'select' ? 0 : step === 'configure' ? 1 : step === 'testing' ? 2 : 3
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white' : 
                    isActive ? 'bg-primary text-white' : 
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      index < currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 md:p-8">
          {/* Step 1: Select Provider */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">اختر قاعدة البيانات</h2>
                <p className="text-slate-400 text-sm">حدد الخدمة التي تريد استخدامها</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DB_PROVIDERS.map(provider => {
                  const colorClasses: Record<string, string> = {
                    emerald: 'border-emerald-500/30 hover:border-emerald-500/60',
                    green: 'border-green-500/30 hover:border-green-500/60',
                    teal: 'border-teal-500/30 hover:border-teal-500/60',
                    purple: 'border-purple-500/30 hover:border-purple-500/60',
                    red: 'border-red-500/30 hover:border-red-500/60'
                  }
                  
                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleSelectProvider(provider.id)}
                      className={`p-4 rounded-xl bg-slate-800/50 border-2 ${colorClasses[provider.color] || colorClasses.emerald} transition-all text-center group hover:bg-slate-700/50`}
                    >
                      <div className="text-4xl mb-2">{provider.icon}</div>
                      <h3 className="font-bold mb-1">{provider.nameAr}</h3>
                      <p className="text-xs text-slate-400">{provider.descriptionAr}</p>
                      {provider.requiresExternalService && (
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          يحتاج خدمة خارجية
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && providerInfo && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep('select')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← رجوع
                </button>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-3xl">{providerInfo.icon}</span>
                    <h2 className="text-xl font-bold">{providerInfo.nameAr}</h2>
                  </div>
                  <p className="text-slate-400 text-sm">{providerInfo.descriptionAr}</p>
                </div>
                <div className="w-16" />
              </div>

              {providerInfo.requiresExternalService && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-200 mb-2">
                      هذه الخدمة تتطلب إنشاء حساب على {providerInfo.name}
                    </p>
                    <a
                      href={providerInfo.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      زيارة الموقع
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {providerInfo.fields.map((field: DbField) => (
                  <Input
                    key={field.key}
                    label={field.labelAr}
                    type={field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'}
                    placeholder={field.placeholderAr}
                    value={config[field.key] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    helperText={field.helperTextAr}
                    required={field.required}
                  />
                ))}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  ملاحظة
                </h4>
                <p className="text-sm text-slate-400">
                  {selectedProvider === 'sqlite' 
                    ? 'SQLite هو خيار محلي لا يحتاج أي إعداد. البيانات ستُخزن في ملف محلي.'
                    : `بيانات ${providerInfo.nameAr} ستُخزن بشكل آمن في إعدادات الموقع ولا يتم مشاركتها.`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedProvider !== 'sqlite') {
                      setCurrentInfoProvider(selectedProvider)
                      setShowInfoModal(true)
                    }
                  }}
                >
                  {selectedProvider !== 'sqlite' ? 'كيف تحصل على هذه البيانات؟' : ''}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleTestConnection}
                  disabled={testing || (selectedProvider !== 'sqlite' && providerInfo?.fields.some(f => f.required && !config[f.key]))}
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الاختبار...
                    </>
                  ) : (
                    <>
                      اختبار الاتصال
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                    <span className={testResult.success ? 'text-emerald-400' : 'text-red-400'}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              {testResult?.success && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      حفظ الإعدادات والانتقال للتسجيل
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Testing (automatic) */}
          {step === 'testing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="text-xl font-bold mb-2">جاري اختبار الاتصال...</h2>
              <p className="text-slate-400">يرجى الانتظار</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-emerald-400">تم بنجاح!</h2>
              <p className="text-slate-400 mb-4">تم حفظ إعدادات قاعدة البيانات</p>
              <p className="text-sm text-slate-500">جاري التحويل لصفحة التسجيل...</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      <Modal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        title={currentInfoProvider ? `كيف تحصل على بيانات ${getDbProviderById(currentInfoProvider)?.nameAr}` : ''}
      >
        <div className="space-y-4">
          {currentInfoProvider === 'supabase' && (
            <>
              <div className="space-y-3">
                <h4 className="font-bold">1. إنشاء حساب Supabase</h4>
                <p className="text-sm text-slate-400">اذهب إلى <a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a> وأنشئ حساب جديد</p>
                
                <h4 className="font-bold">2. إنشاء مشروع جديد</h4>
                <p className="text-sm text-slate-400">من لوحة التحكم، أنشئ مشروع جديد وانسخ الـ Project URL</p>
                
                <h4 className="font-bold">3. الحصول على المفاتيح</h4>
                <p className="text-sm text-slate-400">اذهب إلى Settings → API لنسخ:</p>
                <ul className="text-sm text-slate-400 list-disc list-inside">
                  <li>Project URL → Supabase URL</li>
                  <li>anon/public key → Supabase Key</li>
                  <li>service_role key → Service Role Key</li>
                </ul>
              </div>
            </>
          )}
          
          {currentInfoProvider === 'mongodb' && (
            <>
              <div className="space-y-3">
                <h4 className="font-bold">1. إنشاء حساب MongoDB Atlas</h4>
                <p className="text-sm text-slate-400">اذهب إلى <a href="https://www.mongodb.com/atlas" target="_blank" className="text-primary hover:underline">mongodb.com/atlas</a></p>
                
                <h4 className="font-bold">2. إنشاء Cluster</h4>
                <p className="text-sm text-slate-400">أنشئ cluster مجاني واتبع خطوات الإعداد</p>
                
                <h4 className="font-bold">3. الحصول على Connection String</h4>
                <p className="text-sm text-slate-400">اذهب إلى Connect → Connect your application لنسخ URI</p>
              </div>
            </>
          )}
          
          {currentInfoProvider === 'neon' && (
            <>
              <div className="space-y-3">
                <h4 className="font-bold">1. إنشاء حساب Neon</h4>
                <p className="text-sm text-slate-400">اذهب إلى <a href="https://neon.tech" target="_blank" className="text-primary hover:underline">neon.tech</a></p>
                
                <h4 className="font-bold">2. إنشاء مشروع</h4>
                <p className="text-sm text-slate-400">أنشئ مشروع جديد من لوحة التحكم</p>
                
                <h4 className="font-bold">3. Connection Details</h4>
                <p className="text-sm text-slate-400">احصل على Connection String من إعدادات المشروع</p>
              </div>
            </>
          )}
          
          {currentInfoProvider === 'turso' && (
            <>
              <div className="space-y-3">
                <h4 className="font-bold">1. إنشاء حساب Turso</h4>
                <p className="text-sm text-slate-400">اذهب إلى <a href="https://turso.tech" target="_blank" className="text-primary hover:underline">turso.tech</a></p>
                
                <h4 className="font-bold">2. إنشاء قاعدة بيانات</h4>
                <p className="text-sm text-slate-400">من CLI أو لوحة التحكم أنشئ قاعدة بيانات</p>
                
                <h4 className="font-bold">3. Database URL</h4>
                <p className="text-sm text-slate-400">احصل على رابط قاعدة البيانات و Auth Token</p>
              </div>
            </>
          )}
          
          {currentInfoProvider === 'upstash' && (
            <>
              <div className="space-y-3">
                <h4 className="font-bold">1. إنشاء حساب Upstash</h4>
                <p className="text-sm text-slate-400">اذهب إلى <a href="https://upstash.com" target="_blank" className="text-primary hover:underline">upstash.com</a></p>
                
                <h4 className="font-bold">2. إنشاء Redis Database</h4>
                <p className="text-sm text-slate-400">أنشئ قاعدة بيانات Redis جديدة</p>
                
                <h4 className="font-bold">3. Connection Details</h4>
                <p className="text-sm text-slate-400">احصل على Redis URL و Token من الإعدادات</p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
