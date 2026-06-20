'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Modal from '@/components/ui/modal'
import { 
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Users,
  BookOpen,
  FileText,
  DollarSign,
  Settings
} from 'lucide-react'

interface DatabaseStats {
  totalUsers: number
  totalCourses: number
  totalLectures: number
  totalEnrollments: number
  totalRevenue: number
  totalSubscriptions: number
}

export default function DatabasePage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [operation, setOperation] = useState<string | null>(null)
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null)
  const [currentProvider, setCurrentProvider] = useState<string>('')

  useEffect(() => {
    fetchStats()
    fetchCurrentProvider()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/database/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCurrentProvider = async () => {
    try {
      const res = await fetch('/api/admin/database/provider')
      if (res.ok) {
        const data = await res.json()
        setCurrentProvider(data.provider || 'sqlite')
      }
    } catch (error) {
      console.error('Error fetching provider:', error)
    }
  }

  const handleExport = async (type: 'all' | 'users') => {
    setLoading(true)
    setOperation('export')
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/database/export?type=${type}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gelvano_${type}_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage({ type: 'success', text: `تم تحميل نسخة ${type === 'all' ? 'كاملة' : 'المستخدمين'} بنجاح` })
      } else {
        throw new Error('فشل التصدير')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل الملف' })
    } finally {
      setLoading(false)
      setOperation(null)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setOperation('import')
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/database/import', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setMessage({ type: 'success', text: `تم استيراد ${data.count} سجل بنجاح` })
        fetchStats()
      } else {
        throw new Error('فشل الاستيراد')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل استيراد الملف' })
    } finally {
      setLoading(false)
      setOperation(null)
      e.target.value = ''
    }
  }

  const handleChangeProvider = async () => {
    setShowChangeModal(false)
    // Redirect to setup page to change database provider
    window.location.href = '/setup?change=true'
  }

  const handleDeleteAll = async () => {
    setShowDeleteModal(false)
    setLoading(true)
    setOperation('delete')
    setMessage(null)

    try {
      const res = await fetch('/api/admin/database/clear', {
        method: 'POST'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'تم حذف جميع البيانات بنجاح' })
        fetchStats()
      } else {
        throw new Error('فشل الحذف')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حذف البيانات' })
    } finally {
      setLoading(false)
      setOperation(null)
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-primary" />
            إدارة قاعدة البيانات
          </h1>
          <p className="text-slate-400">إدارة وتصدير واستيراد بيانات المنصة</p>
        </div>
        <Badge variant="info">
          <Server className="w-4 h-4 ml-1" />
          {currentProvider === 'sqlite' ? 'SQLite' : 
           currentProvider === 'supabase' ? 'Supabase' : 
           currentProvider === 'mongodb' ? 'MongoDB' : 
           currentProvider === 'neon' ? 'Neon' : 
           currentProvider === 'turso' ? 'Turso' : 'Upstash'}
        </Badge>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-slate-400">المستخدمين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
            <p className="text-xs text-slate-400">الكورسات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalLectures || 0}</p>
            <p className="text-xs text-slate-400">المحاضرات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalRevenue || 0}</p>
            <p className="text-xs text-slate-400">الإيرادات (ج)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalSubscriptions || 0}</p>
            <p className="text-xs text-slate-400">الاشتراكات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats?.totalEnrollments || 0}</p>
            <p className="text-xs text-slate-400">التسجيلات</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Export All */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleExport('all')}>
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Download className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="font-bold mb-2">تصدير كامل</h3>
            <p className="text-sm text-slate-400">تحميل نسخة احتياطية كاملة من جميع البيانات</p>
          </CardContent>
        </Card>

        {/* Export Users Only */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleExport('users')}>
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="font-bold mb-2">تصدير المستخدمين</h3>
            <p className="text-sm text-slate-400">تحميل بيانات المستخدمين فقط (بدون الأدمن)</p>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="font-bold mb-2">استيراد بيانات</h3>
            <p className="text-sm text-slate-400">رفع نسخة احتياطية سابقة</p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="mt-3 inline-block">
              <Button variant="outline" size="sm" disabled={loading}>
                <Upload className="w-4 h-4 ml-1" />
                اختر ملف
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* Change Provider */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowChangeModal(true)}>
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Server className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="font-bold mb-2">تغيير القاعدة</h3>
            <p className="text-sm text-slate-400">تغيير مزود قاعدة البيانات</p>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <h2 className="font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            منطقة الخطر
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">
            هذه الإجراءات لا يمكن التراجع عنها. تأكد من عمل نسخة احتياطية قبل المتابعة.
          </p>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            حذف جميع البيانات
          </Button>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>جاري معالجة الطلب...</span>
          </div>
        </div>
      )}

      {/* Change Provider Modal */}
      <Modal isOpen={showChangeModal} onClose={() => setShowChangeModal(false)} title="تغيير قاعدة البيانات" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400 mb-1">تحذير!</h4>
                <p className="text-sm text-slate-400">
                  تغيير قاعدة البيانات سيؤدي إلى حذف جميع البيانات الحالية بما في ذلك حسابك كمدير.
                  سيتم نقلك لإنشاء حساب جديد.
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-400">
            هل أنت متأكد من رغبتك في تغيير مزود قاعدة البيانات؟
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowChangeModal(false)} className="flex-1">
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleChangeProvider} className="flex-1">
              <CheckCircle className="w-4 h-4 ml-2" />
              نعم، متأكد
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete All Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="حذف جميع البيانات" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-1">تحذير نهائي!</h4>
                <p className="text-sm text-slate-400">
                  سيتم حذف جميع البيانات من قاعدة البيانات بما في ذلك:
                </p>
                <ul className="text-sm text-slate-400 mt-2 space-y-1">
                  <li>• جميع حسابات المستخدمين</li>
                  <li>• جميع الكورسات والمحاضرات</li>
                  <li>• جميع المدفوعات والاشتراكات</li>
                  <li>• جميع الرسائل والتعليقات</li>
                  <li className="text-red-400 font-bold">• بما في ذلك حسابك كمدير</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-slate-400">
            هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد؟
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDeleteAll} className="flex-1">
              <Trash2 className="w-4 h-4 ml-2" />
              نعم، احذف الكل
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
