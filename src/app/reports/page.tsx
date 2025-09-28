'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Users,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FilePdf
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  username: string
  fullName: string
  role: string
  email: string
}

interface Report {
  id: string
  title: string
  type: string
  content: string
  createdAt: string
  generatedBy: {
    fullName: string
  }
}

interface ReportStats {
  totalIncomes: number
  collectedIncomes: number
  pendingIncomes: number
  overdueIncomes: number
  totalEntities: number
  totalReports: number
  monthlyStats: Array<{
    month: string
    total: number
    collected: number
  }>
  entityTypeStats: Array<{
    type: string
    count: number
    totalAmount: number
  }>
  incomeTypeStats: Array<{
    type: string
    count: number
    totalAmount: number
  }>
}

const roleLabels = {
  'SYSTEM_MANAGER': 'مدير النظام',
  'EXPERT': 'خبير',
  'ACCOUNT_HEAD': 'رئيس الحسابات',
  'REVIEWER': 'مراجع',
  'ACCOUNTANT': 'محاسب',
  'ADVISOR': 'مستشار'
}

const reportTypeLabels = {
  'MONTHLY_INCOME': 'تقرير شهري للإيرادات',
  'ENTITY_SUMMARY': 'ملخص الجهات',
  'OVERDUE_REPORT': 'تقرير الإيرادات المتأخرة',
  'COLLECTION_REPORT': 'تقرير التحصيل',
  'ANALYSIS_REPORT': 'تحليل مالي'
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      window.location.href = '/'
      return
    }

    setUser(JSON.parse(userData))
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [reportsResponse, statsResponse] = await Promise.all([
        fetch('/api/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/reports/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: selectedReportType
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تم إنشاء التقرير بنجاح',
          description: 'تم إنشاء التقرير وإضافته إلى القائمة',
        })
        setIsGenerateDialogOpen(false)
        setSelectedReportType('')
        loadData()
      } else {
        toast({
          title: 'خطأ',
          description: data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'يرجى التحقق من اتصال الإنترنت',
        variant: 'destructive',
      })
    }
  }

  const handleDownloadReport = async (reportId: string, format: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/reports/${reportId}/export/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report_${reportId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'تم التنزيل بنجاح',
          description: `تم تنزيل التقرير بصيغة ${format.toUpperCase()}`,
        })
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'يرجى التحقق من اتصال الإنترنت',
        variant: 'destructive',
      })
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
      <header className="bg-white/80 dark:bg:black/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">التقارير والإحصائيات</h1>
                <p className="text-sm text-muted-foreground">
                  مرحباً {user?.fullName} | {roleLabels[user?.role as keyof typeof roleLabels] || user?.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                العودة للرئيسية
              </Button>
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
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold gold-accent mb-2">التقارير المالية</h2>
            <p className="text-muted-foreground">إنشاء وتحميل التقارير المالية والإحصائيات</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 ml-1" />
                  إنشاء تقرير
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إنشاء تقرير جديد</DialogTitle>
                  <DialogDescription>
                    اختر نوع التقرير الذي تريد إنشاءه
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label>نوع التقرير</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(reportTypeLabels).map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value={key}
                            checked={selectedReportType === key}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                            className="text-primary"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsGenerateDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!selectedReportType}>
                      إنشاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="islamic-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold gold-accent">
                  {formatCurrency(stats.totalIncomes)}
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نسبة التحصيل</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalIncomes > 0 ? ((stats.collectedIncomes / stats.totalIncomes) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الجهات النشطة</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalEntities}
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقارير المنشأة</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalReports}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Stats */}
            <Card className="islamic-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  الإحصائيات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{stat.month}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold gold-accent">{formatCurrency(stat.total)}</div>
                        <div className="text-sm text-green-600">
                          محصل: {formatCurrency(stat.collected)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Entity Type Stats */}
            <Card className="islamic-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  توزيع الجهات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.entityTypeStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{stat.type}</span>
                        <Badge variant="outline">{stat.count}</Badge>
                      </div>
                      <div className="font-bold gold-accent">
                        {formatCurrency(stat.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              التقارير المنشأة
            </CardTitle>
            <CardDescription>
              جميع التقارير المالية التي تم إنشاؤها ({reports.length} تقرير)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد تقارير منشأة بعد</p>
                <Button className="mt-4" onClick={() => setIsGenerateDialogOpen(true)}>
                  إنشاء أول تقرير
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{report.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {reportTypeLabels[report.type as keyof typeof reportTypeLabels] || report.type}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(report.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {report.generatedBy.fullName}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id, 'csv')}
                        >
                          <FileSpreadsheet className="w-3 h-3 ml-1" />
                          CSV
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id, 'pdf')}
                        >
                          <FilePdf className="w-3 h-3 ml-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Mobile Navigation */}
      <div className="mobile-nav lg:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
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
          <Link href="/reports" className="flex flex-col items-center gap-1 p-2 text-primary">
            <FileText className="w-5 h-5" />
            <span className="text-xs">التقارير</span>
          </Link>
        </div>
      </div>
    </div>
  )
}