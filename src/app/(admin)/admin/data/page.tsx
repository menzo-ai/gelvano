'use client'

import { useState, useRef } from 'react'
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
  FileSpreadsheet,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  Bell,
  MessageSquare,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileJson,
  FileText,
  Image,
  RefreshCw,
  Trash2,
  Eye,
  Check,
  X
} from 'lucide-react'

interface ExportOption {
  id: string
  name: string
  description: string
  icon: any
  count: number
  color: string
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  failed: number
  errors: string[]
}

export default function AdminDataPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportOptions: ExportOption[] = [
    { id: 'users', name: 'المستخدمين', description: 'جميع بيانات المستخدمين', icon: Users, count: 1247, color: 'text-blue-400' },
    { id: 'courses', name: 'الكورسات', description: 'الكورسات والفصول والمحاضرات', icon: BookOpen, count: 18, color: 'text-emerald-400' },
    { id: 'enrollments', name: 'التسجيلات', description: 'تسجيلات الطلاب في الكورسات', icon: GraduationCap, count: 3456, color: 'text-purple-400' },
    { id: 'subscriptions', name: 'الاشتراكات', description: 'الاشتراكات والدفعات', icon: CreditCard, count: 892, color: 'text-amber-400' },
    { id: 'notifications', name: 'الإشعارات', description: 'إشعارات المستخدمين', icon: Bell, count: 5678, color: 'text-pink-400' },
    { id: 'messages', name: 'الرسائل', description: 'الرسائل بين المستخدمين', icon: MessageSquare, count: 2345, color: 'text-cyan-400' },
    { id: 'certificates', name: 'الشهادات', description: 'الشهادات الممنوحة', icon: Award, count: 456, color: 'text-amber-400' },
    { id: 'tickets', name: 'التذاكر', description: 'تذاكر الدعم الفني', icon: AlertCircle, count: 234, color: 'text-red-400' },
  ]

  const handleExport = async (type: string) => {
    setExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate sample data
    const data = generateSampleData(type)
    
    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gelvano_${type}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setExporting(false)
  }

  const handleExportAll = async () => {
    setExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate all data
    const allData: Record<string, any[]> = {}
    exportOptions.forEach(opt => {
      allData[opt.id] = generateSampleData(opt.id)
    })
    
    // Create and download file
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gelvano_full_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setExporting(false)
  }

  const generateSampleData = (type: string): any[] => {
    switch (type) {
      case 'users':
        return [
          { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'STUDENT', schoolYear: 1, isActive: true },
          { id: '2', name: 'فاطمة علي', email: 'fatma@example.com', role: 'STUDENT', schoolYear: 2, isActive: true },
          { id: '3', name: 'محمد خالد', email: 'mohamed@example.com', role: 'ADMIN', isActive: true },
        ]
      case 'courses':
        return [
          { id: '1', title: 'الفيزياء - الصف الأول', grade: 1, price: 500, isPublished: true },
          { id: '2', title: 'الميكانيكا', grade: 2, price: 600, isPublished: true },
          { id: '3', title: 'الكهرباء', grade: 3, price: 700, isPublished: true },
        ]
      case 'enrollments':
        return [
          { id: '1', userId: '1', courseId: '1', progress: 75, enrolledAt: '2024-01-15' },
          { id: '2', userId: '2', courseId: '2', progress: 50, enrolledAt: '2024-01-20' },
        ]
      default:
        return []
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportProgress(0)
    setImportResult(null)
    setShowImportModal(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Simulate import progress
      const keys = Object.keys(data)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setImportProgress(i)
      }

      // Calculate results
      let total = 0
      let imported = 0
      const errors: string[] = []

      keys.forEach(key => {
        if (Array.isArray(data[key])) {
          total += data[key].length
          imported += data[key].length // In real app, validate each item
        }
      })

      setImportResult({
        success: true,
        total,
        imported,
        failed: Math.floor(Math.random() * 5),
        errors: []
      })

    } catch (error) {
      setImportResult({
        success: false,
        total: 0,
        imported: 0,
        failed: 0,
        errors: ['خطأ في قراءة الملف', 'تأكد من صيغة JSON']
      })
    }

    setImporting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Database className="w-7 h-7 text-primary" />
            إدارة البيانات
          </h1>
          <p className="text-slate-400">تصدير واستيراد بيانات المنصة</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportAll} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            تصدير كامل
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            استيراد بيانات
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <p className="text-2xl font-bold">1,247</p>
          <p className="text-xs text-slate-400">مستخدم</p>
        </Card>
        <Card className="p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
          <p className="text-2xl font-bold">18</p>
          <p className="text-xs text-slate-400">كورس</p>
        </Card>
        <Card className="p-4 text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <p className="text-2xl font-bold">3,456</p>
          <p className="text-xs text-slate-400">تسجيل</p>
        </Card>
        <Card className="p-4 text-center">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-amber-400" />
          <p className="text-2xl font-bold">45,230</p>
          <p className="text-xs text-slate-400">إيراد (ج.م)</p>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <h3 className="font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            تصدير البيانات
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  disabled={exporting}
                  className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-primary/50 transition-all text-right group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center ${option.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="primary">{option.count}</Badge>
                  </div>
                  <h4 className="font-bold mb-1">{option.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{option.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-4 h-4" />
                    تصدير JSON
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <h3 className="font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            استيراد البيانات
          </h3>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="font-bold mb-2">اسحب الملفات هنا أو اضغط للاختيار</h4>
            <p className="text-sm text-slate-400 mb-4">الصيغ المدعومة: JSON فقط</p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileJson className="w-4 h-4" />
                JSON
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">تعليمات الاستيراد:</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                يجب أن يكون الملف بصيغة JSON
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                يفضل تصدير البيانات أولاً ثم تعديلها
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                تأكد من صحة البيانات قبل الاستيراد
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                البيانات الموجودة لن تُحذف (سيتم الإضافة فقط)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <h3 className="font-bold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            سجل النسخ الاحتياطي
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-15 10:30', type: 'كامل', size: '2.5 MB', status: 'success' },
              { date: '2024-01-14 08:00', type: 'المستخدمين', size: '156 KB', status: 'success' },
              { date: '2024-01-13 22:15', type: 'كامل', size: '2.4 MB', status: 'success' },
            ].map((backup, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${backup.status === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {backup.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">نسخ {backup.type}</p>
                    <p className="text-xs text-slate-400">{backup.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={backup.status === 'success' ? 'success' : 'danger'}>{backup.status === 'success' ? 'ناجح' : 'فاشل'}</Badge>
                  <span className="text-sm text-slate-400">{backup.size}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <h3 className="font-bold flex items-center gap-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            zona الخطر
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <p className="font-medium">حذف جميع البيانات</p>
                <p className="text-sm text-slate-400">حذف جميع بيانات المنصة نهائياً</p>
              </div>
              <Button variant="danger" size="sm">
                <Trash2 className="w-4 h-4" />
                حذف الكل
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <p className="font-medium">إعادة تعيين النظام</p>
                <p className="text-sm text-slate-400">مسح كل البيانات والبدء من جديد</p>
              </div>
              <Button variant="danger" size="sm">
                <RefreshCw className="w-4 h-4" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); setImportResult(null); }} title="استيراد البيانات" size="md">
        <div className="space-y-4">
          {importing ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <h4 className="font-bold mb-2">جاري استيراد البيانات...</h4>
              <Progress value={importProgress} showLabel className="mb-2" />
              <p className="text-sm text-slate-400">{importProgress}%</p>
            </div>
          ) : importResult ? (
            <div className="space-y-4">
              <div className={`text-center py-4 rounded-lg ${importResult.success ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {importResult.success ? (
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                )}
                <h4 className="font-bold text-lg mb-2">
                  {importResult.success ? 'تم الاستيراد بنجاح!' : 'فشل الاستيراد'}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-blue-400">{importResult.total}</p>
                  <p className="text-xs text-slate-400">الإجمالي</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-emerald-400">{importResult.imported}</p>
                  <p className="text-xs text-slate-400">تم استيراده</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
                  <p className="text-xs text-slate-400">فاشل</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="font-medium mb-2 text-red-400">الأخطاء:</p>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {importResult.errors.map((error, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowImportModal(false)}>
                  إغلاق
                </Button>
                {importResult.failed > 0 && (
                  <Button className="flex-1">
                    <RefreshCw className="w-4 h-4" />
                    إعادة المحاولة
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}