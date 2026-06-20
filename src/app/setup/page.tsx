'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { 
  Database,
  HardDrive,
  Cloud,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  Loader2,
  Server,
  Key,
  Link2,
  AlertTriangle
} from 'lucide-react'

type DatabaseProvider = 'sqlite' | 'supabase' | 'mongodb' | 'neon' | 'turso' | 'upstash'

interface ProviderConfig {
  id: DatabaseProvider
  name: string
  nameAr: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  fields: { name: string; placeholder: string; type: string; required: boolean }[]
  docsUrl: string
}

const providers: ProviderConfig[] = [
  {
    id: 'sqlite',
    name: 'SQLite',
    nameAr: 'SQLite',
    description: 'تخزين محلي في ملفات - لا يحتاج إعدادات خارجية',
    icon: <HardDrive className="w-8 h-8" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    fields: [],
    docsUrl: ''
  },
  {
    id: 'supabase',
    name: 'Supabase',
    nameAr: 'Supabase',
    description: 'PostgreSQL كخدمة - مفتوح المصدر وAPI بسيط',
    icon: <Cloud className="w-8 h-8" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    fields: [
      { name: 'supabaseUrl', placeholder: 'https://xxxxx.supabase.co', type: 'url', required: true },
      { name: 'supabaseAnonKey', placeholder: 'مفتاح عام (Anon Key)', type: 'text', required: true },
      { name: 'supabaseServiceKey', placeholder: 'مفتاح الخدمة (Service Key)', type: 'password', required: true }
    ],
    docsUrl: 'https://supabase.com/dashboard'
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    nameAr: 'MongoDB Atlas',
    description: 'قاعدة بيانات NoSQL مرنة وقابلة للتوسع',
    icon: <Database className="w-8 h-8" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    fields: [
      { name: 'mongodbUri', placeholder: 'mongodb+srv://user:password@cluster...', type: 'password', required: true },
      { name: 'mongodbDbName', placeholder: 'اسم قاعدة البيانات', type: 'text', required: true }
    ],
    docsUrl: 'https://www.mongodb.com/atlas'
  },
  {
    id: 'neon',
    name: 'Neon',
    nameAr: 'Neon',
    description: 'PostgreSQL serverless مع فروع والتوسع التلقائي',
    icon: <Server className="w-8 h-8" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    fields: [
      { name: 'neonConnectionString', placeholder: 'postgresql://user:password@host/db', type: 'password', required: true }
    ],
    docsUrl: 'https://neon.tech'
  },
  {
    id: 'turso',
    name: 'Turso',
    nameAr: 'Turso',
    description: 'LibSQL (fork من SQLite) موزع على الحافة',
    icon: <Cloud className="w-8 h-8" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    fields: [
      { name: 'tursoDbUrl', placeholder: 'libsql://your-db.turso.io', type: 'url', required: true },
      { name: 'tursoAuthToken', placeholder: 'مفتاح المصادقة', type: 'password', required: true }
    ],
    docsUrl: 'https://turso.tech'
  },
  {
    id: 'upstash',
    name: 'Upstash',
    nameAr: 'Upstash',
    description: 'Redis serverless للذاكرة المؤقتة والأداء العالي',
    icon: <Database className="w-8 h-8" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    fields: [
      { name: 'upstashRedisUrl', placeholder: 'redis://xxx.upstash.io', type: 'url', required: true },
      { name: 'upstashRedisToken', placeholder: 'مفتاح Redis', type: 'password', required: true }
    ],
    docsUrl: 'https://upstash.com'
  }
]

export default function SetupPage() {
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testingResult, setTestingResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const currentProvider = providers.find(p => p.id === selectedProvider)

  const handleProviderSelect = (providerId: DatabaseProvider) => {
    setSelectedProvider(providerId)
    setConfig({})
    setTestingResult(null)
  }

  const handleConfigChange = (name: string, value: string) => {
    setConfig(prev => ({ ...prev, [name]: value }))
  }

  const handleTestConnection = async () => {
    if (!selectedProvider) return
    
    setTesting(true)
    setTestingResult(null)

    try {
      const res = await fetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, config })
      })
      
      const data = await res.json()
      setTestingResult({
        success: res.ok,
        message: data.message || data.error || 'حدث خطأ'
      })
    } catch (error) {
      setTestingResult({
        success: false,
        message: 'فشل الاتصال بالخادم'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!selectedProvider) return
    
    setSaving(true)

    try {
      // Create .env file with configuration
      let envContent = `DATABASE_URL="`
      
      if (selectedProvider === 'sqlite') {
        envContent += `file:./dev.db`
      } else if (selectedProvider === 'supabase') {
        envContent = `DATABASE_URL="postgresql://postgres:${config.supabaseServiceKey}@db.${config.supabaseUrl.replace('https://', '')}:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="${config.supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${config.supabaseAnonKey}"
SUPABASE_SERVICE_KEY="${config.supabaseServiceKey}"`
      } else if (selectedProvider === 'mongodb') {
        envContent = `MONGODB_URI="${config.mongodbUri}"
MONGODB_DB_NAME="${config.mongodbDbName}"`
      } else if (selectedProvider === 'neon') {
        envContent = `DATABASE_URL="${config.neonConnectionString}"`
      } else if (selectedProvider === 'turso') {
        envContent = `DATABASE_URL="libsql://${config.tursoDbUrl}"
TURSO_AUTH_TOKEN="${config.tursoAuthToken}"`
      } else if (selectedProvider === 'upstash') {
        envContent = `UPSTASH_REDIS_URL="${config.upstashRedisUrl}"
UPSTASH_REDIS_TOKEN="${config.upstashRedisToken}"`
      }
      
      envContent += `"`

      // Save to API
      const res = await fetch('/api/setup/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider: selectedProvider, 
          config,
          envContent: selectedProvider === 'sqlite' ? 'DATABASE_URL="file:./dev.db"' : undefined
        })
      })

      if (res.ok) {
        // Redirect to admin registration
        router.push(`/register?setup=true&provider=${selectedProvider}`)
      } else {
        const data = await res.json()
        setTestingResult({ success: false, message: data.error || 'فشل الحفظ' })
        setSaving(false)
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-4">
            <Database className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">مرحباً بك في GELVANO</h1>
          <p className="text-slate-400">اختر مزود قاعدة البيانات المناسب لمنصتك التعليمية</p>
        </div>

        {/* Provider Selection */}
        {!selectedProvider ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(provider => (
              <Card 
                key={provider.id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]"
                onClick={() => handleProviderSelect(provider.id)}
              >
                <CardContent className="p-6">
                  <div className={`${provider.bgColor} w-16 h-16 rounded-xl flex items-center justify-center ${provider.color} mb-4`}>
                    {provider.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{provider.nameAr}</h3>
                  <p className="text-sm text-slate-400">{provider.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Configuration Form */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`${currentProvider?.bgColor} w-12 h-12 rounded-xl flex items-center justify-center ${currentProvider?.color}`}>
                    {currentProvider?.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{currentProvider?.nameAr}</h2>
                    <p className="text-sm text-slate-400">{currentProvider?.description}</p>
                  </div>
                </div>
                {currentProvider?.docsUrl && (
                  <a 
                    href={currentProvider.docsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    التوثيق
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentProvider?.id === 'sqlite' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HardDrive className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">SQLite - تخزين محلي</h3>
                  <p className="text-slate-400 mb-4">
                    سيتم تخزين جميع البيانات في ملفات محلية داخل الخادم.
                    <br />
                    لا حاجة لإعدادات إضافية.
                  </p>
                </div>
              ) : (
                <>
                  {/* Provider Fields */}
                  <div className="space-y-4">
                    {currentProvider?.fields.map(field => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium mb-2">
                          {field.placeholder}
                          {field.required && <span className="text-red-400 mr-1">*</span>}
                        </label>
                        <input
                          type={field.type === 'password' ? 'password' : 'text'}
                          value={config[field.name] || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                          dir={field.type === 'url' ? 'ltr' : 'rtl'}
                          autoComplete="off"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Test Result */}
                  {testingResult && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${
                      testingResult.success 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {testingResult.success ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      )}
                      {testingResult.message}
                    </div>
                  )}
                </>
              )}

              {/* Info Box */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-400 mb-1">مهم</h4>
                    <p className="text-sm text-slate-400">
                      بمجرد الحفظ، سيتم الاتصال بقاعدة البيانات وإنشاء حساب المدير.
                      تأكد من صحة البيانات قبل المتابعة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentProvider?.id !== 'sqlite' && (
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testing || currentProvider?.fields?.some(f => f.required && !config[f.name])}
                    className="flex-1"
                  >
                    {testing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 ml-2" />
                        اختبار الاتصال
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving || (currentProvider?.id !== 'sqlite' && currentProvider?.fields?.some(f => f.required && !config[f.name]))}
                  className="flex-1"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      متابعة - إنشاء حساب المدير
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
