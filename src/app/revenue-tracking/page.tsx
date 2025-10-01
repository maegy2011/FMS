'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Download, Filter, RefreshCw, BarChart3, PieChart } from 'lucide-react'

interface RevenueTracking {
  id: number
  entityName: string
  entityGovernorate: string
  entityType: string
  revenueValue: number
  dueDate: string
  period: string
  daysOverdue: number
  status: 'paid' | 'late' | 'pending'
  paymentDate?: string
  notes?: string
}

interface MonthlySummary {
  month: string
  totalRevenues: number
  paidRevenues: number
  lateRevenues: number
  pendingRevenues: number
  totalAmount: number
  paidAmount: number
  lateAmount: number
  pendingAmount: number
}

const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]
const months = [
  { value: '01', label: 'يناير' },
  { value: '02', label: 'فبراير' },
  { value: '03', label: 'مارس' },
  { value: '04', label: 'أبريل' },
  { value: '05', label: 'مايو' },
  { value: '06', label: 'يونيو' },
  { value: '07', label: 'يوليو' },
  { value: '08', label: 'أغسطس' },
  { value: '09', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' }
]

export default function RevenueTrackingPage() {
  const [trackingData, setTrackingData] = useState<RevenueTracking[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedGovernorate, setSelectedGovernorate] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('table')

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedYear) params.append('year', selectedYear)
      if (selectedMonth) params.append('month', selectedMonth)
      if (selectedGovernorate && selectedGovernorate !== 'all') params.append('governorate', selectedGovernorate)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/revenue-tracking?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTrackingData(data.trackingData)
        setMonthlySummary(data.monthlySummary)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في جلب بيانات المتابعة',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedYear, selectedMonth, selectedGovernorate, selectedStatus])

  const getStatusBadge = (status: string, daysOverdue: number) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 ml-1" />مدفوع</Badge>
      case 'late':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 ml-1" />متأخر {daysOverdue} يوم</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 ml-1" />قيد الانتظار</Badge>
      default:
        return <Badge variant="outline">غير معروف</Badge>
    }
  }

  const filteredData = trackingData.filter(item => {
    const matchesYear = selectedYear ? item.period.startsWith(selectedYear) : true
    const matchesMonth = selectedMonth ? item.period.endsWith(selectedMonth) : true
    const matchesGovernorate = selectedGovernorate === 'all' || item.entityGovernorate === selectedGovernorate
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    return matchesYear && matchesMonth && matchesGovernorate && matchesStatus
  })

  const exportToCSV = () => {
    const headers = ['الجهة', 'المحافظة', 'النوع', 'القيمة', 'تاريخ الاستحقاق', 'الفترة', 'الأيام المتأخرة', 'الحالة', 'تاريخ الدفع', 'ملاحظات']
    const csvData = filteredData.map(item => [
      item.entityName,
      item.entityGovernorate,
      item.entityType,
      item.revenueValue,
      item.dueDate,
      item.period,
      item.daysOverdue,
      item.status === 'paid' ? 'مدفوع' : item.status === 'late' ? 'متأخر' : 'قيد الانتظار',
      item.paymentDate || '',
      item.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `متابعة_الايرادات_${selectedYear}_${selectedMonth || 'الكل'}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
      icon: 'success',
      title: 'نجاح',
      text: 'تم تصدير البيانات بنجاح',
      confirmButtonText: 'موافق',
      confirmButtonColor: '#16a34a'
    })
  }

  const getGovernorates = () => {
    const governorates = [...new Set(trackingData.map(item => item.entityGovernorate))]
    return governorates
  }

  const getCurrentMonthSummary = () => {
    if (monthlySummary.length === 0) return null
    return selectedMonth 
      ? monthlySummary.find(summary => summary.month.endsWith(selectedMonth))
      : monthlySummary[monthlySummary.length - 1]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">جاري تحميل بيانات المتابعة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            متابعة الإيرادات الشهرية
          </CardTitle>
          <CardDescription>
            متابعة الإيرادات الشهرية للجهات وتحديد المتأخرات في السداد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="year">السنة</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="month">الشهر</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="governorate">المحافظة</Label>
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {getGovernorates().map(gov => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{filteredData.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المدفوعة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredData.filter(item => item.status === 'paid').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المتأخرة</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredData.filter(item => item.status === 'late').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {filteredData.filter(item => item.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setSelectedYear(currentYear.toString())
                setSelectedMonth('')
                setSelectedGovernorate('all')
                setSelectedStatus('all')
                setTimeout(fetchData, 100) // Wait for state updates
              }}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
            
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 ml-2" />
              تصدير إلى CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">جدول المتابعة</TabsTrigger>
          <TabsTrigger value="charts">الرسوم البيانية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>جدول متابعة الإيرادات</CardTitle>
              <CardDescription>
                عرض تفصيلي للإيرادات الشهرية وحالة السداد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الجهة</TableHead>
                      <TableHead>المحافظة</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>تاريخ الاستحقاق</TableHead>
                      <TableHead>الفترة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الأيام المتأخرة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id} className={item.status === 'late' ? 'bg-red-50' : item.status === 'pending' ? 'bg-orange-50' : ''}>
                        <TableCell className="font-medium">{item.entityName}</TableCell>
                        <TableCell>{item.entityGovernorate}</TableCell>
                        <TableCell>{item.revenueValue.toLocaleString()} ج.م</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell>{item.period}</TableCell>
                        <TableCell>{getStatusBadge(item.status, item.daysOverdue)}</TableCell>
                        <TableCell>{item.daysOverdue > 0 ? item.daysOverdue : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  توزيع الحالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">المدفوعة</span>
                    <span className="text-sm text-green-600">
                      {filteredData.filter(item => item.status === 'paid').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(filteredData.filter(item => item.status === 'paid').length / filteredData.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">المتأخرة</span>
                    <span className="text-sm text-red-600">
                      {filteredData.filter(item => item.status === 'late').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(filteredData.filter(item => item.status === 'late').length / filteredData.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">قيد الانتظار</span>
                    <span className="text-sm text-orange-600">
                      {filteredData.filter(item => item.status === 'pending').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(filteredData.filter(item => item.status === 'pending').length / filteredData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  ملخص الشهر
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getCurrentMonthSummary() ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">إجمالي الإيرادات:</span>
                      <span className="font-medium">{getCurrentMonthSummary()?.totalRevenues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">إجمالي المبلغ:</span>
                      <span className="font-medium">{getCurrentMonthSummary()?.totalAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">المدفوع:</span>
                      <span className="font-medium text-green-600">{getCurrentMonthSummary()?.paidAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">المتأخر:</span>
                      <span className="font-medium text-red-600">{getCurrentMonthSummary()?.lateAmount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-600">قيد الانتظار:</span>
                      <span className="font-medium text-orange-600">{getCurrentMonthSummary()?.pendingAmount.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">لا توجد بيانات متاحة</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}