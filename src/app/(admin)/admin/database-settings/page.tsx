'use client'

import { useState, useEffect, useRef } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import Input from '@/components/ui/input'
import Progress from '@/components/ui/progress'
import { 
  Database, 
  Download, 
  Upload, 
  Users,
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Settings,
  Save,
  Globe,
  HardDrive,
  Server
} from 'lucide-react'
import { DB_PROVIDERS, getDbProviderById, type DbProvider, type DbField } from '@/lib/db-providers'

interface ExportResult {
  success: boolean
  total: number
  exported: number
}

export default function DatabaseSettingsPage() {
  const [currentProvider, setCurrentProvider] = useState<string | null>(null)
  const [dbConfig, setDbConfig] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // Change database modal
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [newProvider, setNewProvider] = useState<DbProvider | null>(null)
  const [newConfig, setNewConfig] = useState<Record<string, string>>({})
  const [showConfirmChange, setShowConfirmChange] = useState(false)
  
  // Export/Import state
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<ExportResult | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/admin/database/status')
      const data = await response.json()
      if (data.configured) {
        setCurrentProvider(data.provider)
        setDbConfig(data.config || {})
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
    setIsLoading(false)
  }

  const handleConfigChange = (key: string, value: string) => {
    setDbConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleTestConnection = async () => {
    if (!currentProvider) return
    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: currentProvider, config: dbConfig })
      })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, message: `خطأ: ${error}` })
    }

    setIsTesting(false)
  }

  const handleSaveConfig = async () => {
    if (!currentProvider) return
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: currentProvider, config: dbConfig })
      })
      
      if (response.ok) {
        alert('تم حفظ الإعدادات بنجاح!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving:', error)
    }

    setIsSaving(false)
  }

  const handleChangeDatabaseProvider = async () => {
    if (!newProvider) return
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: newProvider, config: newConfig })
      })
      
      if (response.ok) {
        setShowConfirmChange(false)
        setShowChangeModal(false)
        alert('تم تغيير قاعدة البيانات بنجاح!')
        window.location.href = '/register'
      }
    } catch (error) {
      console.error('Error:', error)
    }

    setIsSaving(false)
  }

  const handleExportUsers = async () => {
    setExporting(true)
    setShowExportModal(true)
    setExportResult(null)

    try {
      const response = await fetch('/api/admin/data/export?type=users')
      const result = await response.json()
      
      if (result.success) {
        // Filter out admin users
        const usersWithoutAdmin = result.data.filter((user: any) => user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')
        
        const blob = new Blob([JSON.stringify(usersWithoutAdmin, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gelvano_users_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        setExportResult({
          success: true,
          total: result.data.length,
          exported: usersWithoutAdmin.length
        })
      }
    } catch (error) {
      setExportResult({ success: false, total: 0, exported: 0 })
    }

    setExporting(false)
  }

  const handleExportAll = async () => {
    setExporting(true)
    setShowExportModal(true)
    setExportResult(null)

    try {
      const response = await fetch('/api/admin/data/export?type=all')
      const result = await response.json()
      
      if (result.success) {
        // Filter out admin users from the data
        const dataWithoutAdmin = { ...result.data }
        if (dataWithoutAdmin.users) {
          dataWithoutAdmin.users = dataWithoutAdmin.users.filter((user: any) => 
            user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN'
          )
        }
        
        const blob = new Blob([JSON.stringify(dataWithoutAdmin, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gelvano_full_backup_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        setExportResult({ success: true, total: 0, exported: 0 })
      }
    } catch (error) {
      setExportResult({ success: false, total: 0, exported: 0 })
    }

    setExporting(false)
  }

  const providerInfo = currentProvider ? getDbProviderById(currentProvider) : null

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
            <Database className="w-7 h-7 text-primary" />
            إعدادات قاعدة البيانات
          </h1>
          <p className="text-slate-400">إدارة اتصال قاعدة البيانات</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowChangeModal(true)}>
            <Server className="w-4 h-4" />
            تغيير قاعدة البيانات
          </Button>
        </div>
      </div>

      {/* Current Provider Status */}
      {providerInfo && (
        <Card className="border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-3xl">{providerInfo.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{providerInfo.nameAr}</h3>
                  <p className="text-sm text-slate-400">{providerInfo.descriptionAr}</p>
                </div>
              </div>
              <Badge variant="success" className="text-sm px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                متصل
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      {providerInfo && providerInfo.fields.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-bold">إعدادات الاتصال</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerInfo.fields.map((field: DbField) => (
              <Input
                key={field.key}
                label={field.labelAr}
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={field.placeholderAr}
                value={dbConfig[field.key] || ''}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                helperText={field.helperTextAr}
              />
            ))}

            {providerInfo.requiresExternalService && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-200 mb-1">
                    تحتاج مساعدة؟
                  </p>
                  <a
                    href={providerInfo.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    زيارة موقع {providerInfo.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

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
                onClick={handleSaveConfig}
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
          </CardContent>
        </Card>
      )}

      {/* SQLite Info */}
      {currentProvider === 'sqlite' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold">قاعدة بيانات محلية</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800/50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="font-bold mb-2">التخزين المحلي مفعل</h4>
              <p className="text-sm text-slate-400">
                البيانات مخزنة محلياً في ملف قاعدة البيانات
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export/Import Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-bold">نسخ احتياطي</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleExportUsers}
              disabled={exporting}
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-all text-right"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">تصدير المستخدمين</h4>
                  <p className="text-xs text-slate-400">تصدير بيانات الطلاب فقط</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-all text-right"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold">تصدير كامل</h4>
                  <p className="text-xs text-slate-400">تصدير كل البيانات (بدون الأدمن)</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Change Database Modal */}
      <Modal 
        isOpen={showChangeModal} 
        onClose={() => { setShowChangeModal(false); setShowConfirmChange(false); }}
        title={showConfirmChange ? "⚠️ تأكيد التغيير" : "تغيير قاعدة البيانات"}
        size="lg"
      >
        {!showConfirmChange ? (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium mb-1">تحذير مهم!</p>
                  <p className="text-sm text-amber-200/80">
                    تغيير قاعدة البيانات سيؤدي إلى حذف جميع البيانات الحالية بما في ذلك حساب الأدمن!
                  </p>
                </div>
              </div>
            </div>

            {!newProvider ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      onClick={() => {
                        setNewProvider(provider.id as DbProvider)
                        setNewConfig({})
                      }}
                      className={`p-3 rounded-xl bg-slate-800/50 border-2 ${colorClasses[provider.color] || colorClasses.emerald} transition-all text-center`}
                    >
                      <span className="text-2xl mb-1 block">{provider.icon}</span>
                      <span className="font-bold text-sm">{provider.nameAr}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getDbProviderById(newProvider)?.icon}</span>
                    <span className="font-bold">{getDbProviderById(newProvider)?.nameAr}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => { setNewProvider(null); setNewConfig({}); }}
                  >
                    تغيير
                  </Button>
                </div>

                {getDbProviderById(newProvider)?.fields.map((field: DbField) => (
                  <Input
                    key={field.key}
                    label={field.labelAr}
                    type={field.type === 'password' ? 'password' : 'text'}
                    placeholder={field.placeholderAr}
                    value={newConfig[field.key] || ''}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                    required={field.required}
                  />
                ))}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setNewProvider(null)}>
                    رجوع
                  </Button>
                  <Button className="flex-1" onClick={() => setShowConfirmChange(true)}>
                    التالي
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-xl font-bold text-red-400 mb-2">هل أنت متأكد؟</h4>
              <p className="text-slate-300 mb-4">
                تغيير قاعدة البيانات سيؤدي إلى:
              </p>
              <ul className="text-sm text-slate-400 text-right space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  حذف جميع البيانات الحالية
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  حذف حساب الأدمن
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  بدء قاعدة بيانات جديدة
                </li>
              </ul>
              <p className="text-sm text-amber-400">
                سيتم توجيهك لصفحة إنشاء حساب الأدمن بعد ذلك
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowConfirmChange(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="danger"
                className="flex-1"
                onClick={handleChangeDatabaseProvider}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    نعم، متأكد
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Export Result Modal */}
      <Modal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)}
        title="تصدير البيانات"
      >
        <div className="text-center py-4">
          {exporting ? (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-slate-400">جاري التصدير...</p>
            </>
          ) : exportResult ? (
            <>
              {exportResult.success ? (
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              )}
              <h4 className="font-bold text-lg mb-2">
                {exportResult.success ? 'تم التصدير بنجاح!' : 'فشل التصدير'}
              </h4>
              {exportResult.total > 0 && (
                <p className="text-sm text-slate-400">
                  تم تصدير {exportResult.exported} من أصل {exportResult.total} مستخدم
                </p>
              )}
              <p className="text-sm text-slate-500 mt-4">
                (تم استثناء حساب الأدمن)
              </p>
              <Button className="w-full mt-4" onClick={() => setShowExportModal(false)}>
                إغلاق
              </Button>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
