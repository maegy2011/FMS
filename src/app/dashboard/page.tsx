'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  Plus, 
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  username: string
  fullName: string
  role: string
  email: string
}

interface Income {
  id: string
  amount: number
  type: string
  description?: string
  status: string
  dueDate: string
  collectedAt?: string
  entity: {
    name: string
    type: string
  }
}

interface DashboardStats {
  totalIncome: number
  collectedIncome: number
  pendingIncome: number
  overdueIncome: number
  totalEntities: number
  activeUsers: number
}

const roleLabels = {
  'SYSTEM_MANAGER': 'مدير النظام',
  'EXPERT': 'خبير',
  'ACCOUNT_HEAD': 'رئيس الحسابات',
  'REVIEWER': 'مراجع',
  'ACCOUNTANT': 'محاسب',
  'ADVISOR': 'مستشار'
}

const statusLabels = {
  'PENDING': 'قيد الانتظار',
  'COLLECTED': 'محصلة',
  'OVERDUE': 'متأخرة',
  'CANCELLED': 'ملغاة'
}

const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'COLLECTED': 'bg-green-100 text-green-800',
  'OVERDUE': 'bg-red-100 text-red-800',
  'CANCELLED': 'bg-gray-100 text-gray-800'
}

const typeLabels = {
  'TAXES': 'ضرائب',
  'FEES': 'رسوم',
  'FINES': 'غرامات',
  'GRANTS': 'منح',
  'DONATIONS': 'تبرعات',
  'INVESTMENTS': 'استثمارات',
  'OTHER': 'أخرى'
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      window.location.href = '/'
      return
    }

    setUser(JSON.parse(userData))
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [statsResponse, incomesResponse] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/incomes/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (incomesResponse.ok) {
        const incomesData = await incomesResponse.json()
        setRecentIncomes(incomesData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen andalusian-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen andalusian-pattern">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">لوحة التحكم</h1>
                <p className="text-sm text-muted-foreground">
                  مرحباً {user?.fullName} | {roleLabels[user?.role as keyof typeof roleLabels] || user?.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="islamic-border">
                <CheckCircle className="w-3 h-3 ml-1" />
                متصل
              </Badge>
              <Button variant="outline" size="sm" onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-accent">
                {stats ? formatCurrency(stats.totalIncome) : '٠.٠٠ ر.س'}
              </div>
              <p className="text-xs text-muted-foreground">
                الإيرادات المسجلة في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات المحصلة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats ? formatCurrency(stats.collectedIncome) : '٠.٠٠ ر.س'}
              </div>
              <p className="text-xs text-muted-foreground">
                الإيرادات التي تم تحصيلها
              </p>
            </CardContent>
          </Card>

          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات المعلقة</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats ? formatCurrency(stats.pendingIncome) : '٠.٠٠ ر.س'}
              </div>
              <p className="text-xs text-muted-foreground">
                الإيرادات قيد الانتظار
              </p>
            </CardContent>
          </Card>

          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات المتأخرة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats ? formatCurrency(stats.overdueIncome) : '٠.٠٠ ر.س'}
              </div>
              <p className="text-xs text-muted-foreground">
                الإيرادات المتأخرة عن الاستحقاق
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Incomes */}
          <div className="lg:col-span-2">
            <Card className="islamic-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      آخر الإيرادات
                    </CardTitle>
                    <CardDescription>
                      أحدث 10 إيرادات مسجلة في النظام
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 ml-1" />
                      تصفية
                    </Button>
                    <Link href="/incomes">
                      <Button size="sm">
                        <Plus className="w-4 h-4 ml-1" />
                        إضافة إيراد
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIncomes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد إيرادات مسجلة بعد</p>
                      <Link href="/incomes" className="block mt-4">
                        <Button size="sm">إضافة أول إيراد</Button>
                      </Link>
                    </div>
                  ) : (
                    recentIncomes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{income.entity.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {typeLabels[income.type as keyof typeof typeLabels] || income.type}
                              {income.description && ` - ${income.description}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold gold-accent">{formatCurrency(income.amount)}</div>
                          <div className="flex items-center gap-2 justify-end">
                            <Badge className={statusColors[income.status as keyof typeof statusColors]}>
                              {statusLabels[income.status as keyof typeof statusLabels] || income.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(income.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="islamic-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/incomes" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 ml-2" />
                    إضافة إيراد جديد
                  </Button>
                </Link>
                <Link href="/entities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 ml-2" />
                    إضافة جهة جديدة
                  </Button>
                </Link>
                <Link href="/reports" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 ml-2" />
                    إنشاء تقرير جديد
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="islamic-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  معلومات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">المستخدمون النشطون</span>
                  <span className="font-medium">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي الجهات</span>
                  <span className="font-medium">{stats?.totalEntities || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">نسبة التحصيل</span>
                  <span className="font-medium">
                    {stats && stats.totalIncome > 0 
                      ? `${((stats.collectedIncome / stats.totalIncome) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="mobile-nav lg:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-primary">
            <Building2 className="w-5 h-5" />
            <span className="text-xs">الرئيسية</span>
          </Link>
          <Link href="/incomes" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">الإيرادات</span>
          </Link>
          <Link href="/entities" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span className="text-xs">الجهات</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <FileText className="w-5 h-5" />
            <span className="text-xs">التقارير</span>
          </Link>
        </div>
      </div>
    </div>
  )
}