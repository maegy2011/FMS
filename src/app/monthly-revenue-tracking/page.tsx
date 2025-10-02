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
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface MonthlyTracking {
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

interface Entity {
  id: number
  name: string
  type: string
  governorate: string
}

interface MonthlySummary {
  month: string
  monthName: string
  totalEntities: number
  paidEntities: number
  lateEntities: number
  pendingEntities: number
  totalRevenue: number
  paidRevenue: number
  lateRevenue: number
  pendingRevenue: number
}

interface OverallStats {
  totalEntities: number
  paidEntities: number
  lateEntities: number
  pendingEntities: number
  totalRevenue: number
  paidRevenue: number
  lateRevenue: number
  pendingRevenue: number
  collectionRate: number
}

const currentYear = new Date().getFullYear()
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

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية', 'البحيرة',
  'الغربية', 'كفر الشيخ', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'شمال سيناء',
  'جنوب سيناء', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'مطروح', 'قنا', 'سوهاج', 'أسيوط',
  'الفيوم', 'بني سويف', 'المنيا'
]

const statusTypes = [
  { value: 'paid', label: 'مدفوع', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'late', label: 'متأخر', icon: XCircle, color: 'bg-red-100 text-red-800' },
  { value: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'bg-gray-100 text-gray-800' }
]

export default function MonthlyRevenueTrackingPage() {
  const [trackingData, setTrackingData] = useState<MonthlyTracking[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedGovernorate, setSelectedGovernorate] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEntities, setSelectedEntities] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('entityName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [activeTab, setActiveTab] = useState('table')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('year', selectedYear)
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth)
      if (selectedGovernorate && selectedGovernorate !== 'all') params.append('governorate', selectedGovernorate)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedEntities.length > 0) params.append('entityIds', selectedEntities.join(','))
      params.append('revenueType', 'subscriptions')

      const response = await fetch(`/api/monthly-revenue-tracking?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTrackingData(data.trackingData)
        setMonthlySummary(data.monthlySummary)
        setOverallStats(data.overallStats)
        setEntities(data.entities)
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
    setCurrentPage(1) // Reset to first page when filters change
    fetchData()
  }, [selectedYear, selectedMonth, selectedGovernorate, selectedStatus, selectedEntities.length])

  const getStatusBadge = (status: string, daysOverdue: number) => {
    const statusType = statusTypes.find(t => t.value === status)
    if (statusType) {
      return (
        <Badge className={statusType.color}>
          <statusType.icon className="h-3 w-3 ml-1" />
          {status === 'late' ? `${statusType.label} ${daysOverdue} يوم` : statusType.label}
        </Badge>
      )
    }
    return <Badge variant="outline">غير معروف</Badge>
  }

  const filteredAndSortedData = trackingData
    .filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entityGovernorate.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof MonthlyTracking]
      let bValue = b[sortBy as keyof MonthlyTracking]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEntitySelection = (entityId: number, checked: boolean) => {
    if (checked) {
      setSelectedEntities([...selectedEntities, entityId])
    } else {
      setSelectedEntities(selectedEntities.filter(id => id !== entityId))
    }
  }

  const handleSelectAllEntities = (checked: boolean) => {
    if (checked) {
      setSelectedEntities(entities.map(e => e.id))
    } else {
      setSelectedEntities([])
    }
  }

  const resetFilters = () => {
    setSelectedYear(currentYear.toString())
    setSelectedMonth('all')
    setSelectedGovernorate('all')
    setSelectedStatus('all')
    setSelectedEntities([])
    setSearchTerm('')
    setSortBy('entityName')
    setSortOrder('asc')
  }

  const getCurrentMonthSummary = () => {
    if (monthlySummary.length === 0) return null
    return selectedMonth && selectedMonth !== 'all' 
      ? monthlySummary.find(summary => summary.month === selectedMonth)
      : monthlySummary[monthlySummary.length - 1]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <TrendingUp className="h-6 w-6 text-blue-600" />
            متابعة الإيرادات الشهرية - الاشتراكات
          </CardTitle>
          <CardDescription>
            متابعة الإيرادات الشهرية للجهات وتحديد المتأخرات في السداد لنوع الاشتراكات
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="year">السنة</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                  <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                  <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
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
                  {governorates.map(gov => (
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
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        <status.icon className="h-4 w-4 ml-2" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entity Selection */}
          <div>
            <Label>الجهات</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="select-all"
                  checked={selectedEntities.length === entities.length && entities.length > 0}
                  onCheckedChange={handleSelectAllEntities}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">تحديد الكل</Label>
              </div>
              {entities.map((entity) => (
                <div key={entity.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`entity-${entity.id}`}
                    checked={selectedEntities.includes(entity.id)}
                    onCheckedChange={(checked) => handleEntitySelection(entity.id, checked as boolean)}
                  />
                  <Label htmlFor={`entity-${entity.id}`} className="text-sm">
                    {entity.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ابحث عن جهة أو محافظة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sortBy">الترتيب حسب</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entityName">اسم الجهة</SelectItem>
                  <SelectItem value="entityGovernorate">المحافظة</SelectItem>
                  <SelectItem value="revenueValue">قيمة الإيراد</SelectItem>
                  <SelectItem value="dueDate">تاريخ الاستحقاق</SelectItem>
                  <SelectItem value="daysOverdue">الأيام المتأخرة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sortOrder">طريقة الترتيب</Label>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">تصاعدي</SelectItem>
                  <SelectItem value="desc">تنازلي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
            <div className="text-sm text-gray-600">
              عدد النتائج: {filteredAndSortedData.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الجهات</p>
                  <p className="text-2xl font-bold">{overallStats.totalEntities}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المدفوعة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.paidEntities}
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
                    {overallStats.lateEntities}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {overallStats.pendingEntities}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Revenue Summary Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">{overallStats.totalRevenue.toLocaleString()} ج.م</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الإيرادات المدفوعة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.paidRevenue.toLocaleString()} ج.م
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الإيرادات المتأخرة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStats.lateRevenue.toLocaleString()} ج.م
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">نسبة التحصيل</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {overallStats.collectionRate}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">جدول المتابعة</TabsTrigger>
          <TabsTrigger value="summary">ملخص شهري</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>جدول متابعة الإيرادات الشهرية</CardTitle>
              <CardDescription>
                عرض تفصيلي للإيرادات الشهرية وحالة السداد للاشتراكات
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
                    {paginatedData.map((item) => (
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    عرض {((currentPage - 1) * itemsPerPage + 1)} إلى {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} من {filteredAndSortedData.length} نتيجة
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الإيرادات الشهرية</CardTitle>
              <CardDescription>
                عرض ملخص شهري للإيرادات وحالة الجهات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الشهر</TableHead>
                      <TableHead>إجمالي الجهات</TableHead>
                      <TableHead>المدفوعة</TableHead>
                      <TableHead>المتأخرة</TableHead>
                      <TableHead>قيد الانتظار</TableHead>
                      <TableHead>إجمالي الإيرادات</TableHead>
                      <TableHead>نسبة التحصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlySummary.map((summary) => {
                      const collectionRate = summary.totalRevenue > 0 
                        ? ((summary.paidRevenue / summary.totalRevenue) * 100).toFixed(1)
                        : '0'
                      
                      return (
                        <TableRow key={summary.month}>
                          <TableCell className="font-medium">{summary.monthName}</TableCell>
                          <TableCell>{summary.totalEntities}</TableCell>
                          <TableCell className="text-green-600">{summary.paidEntities}</TableCell>
                          <TableCell className="text-red-600">{summary.lateEntities}</TableCell>
                          <TableCell className="text-orange-600">{summary.pendingEntities}</TableCell>
                          <TableCell>{summary.totalRevenue.toLocaleString()} ج.م</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${collectionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{collectionRate}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}