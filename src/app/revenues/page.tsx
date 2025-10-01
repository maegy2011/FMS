'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Edit, Plus, Search, DollarSign, Calendar, FileText, Building2, Eye, Download, Upload, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface Revenue {
  id: number
  serial: number
  entityName: string
  value: number
  dueDate: string
  period: string
  type: 'subscriptions' | 'penalties' | 'legal_fees' | 'computerization' | 'other'
  notes?: string
  createdAt: string
  updatedAt: string
  entity?: {
    id: number
    name: string
    type: string
    governorate: string
  }
}

interface Entity {
  id: number
  name: string
  type: 'main' | 'branch' | 'workers'
  governorate: string
}

const revenueTypes = [
  { value: 'subscriptions', label: 'اشتراكات' },
  { value: 'penalties', label: 'جزاءات' },
  { value: 'legal_fees', label: 'اتعاب محاماة' },
  { value: 'computerization', label: 'ميكنة' },
  { value: 'other', label: 'أخرى' }
]

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية', 'البحيرة',
  'الغربية', 'كفر الشيخ', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'شمال سيناء',
  'جنوب سيناء', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'مطروح', 'قنا', 'سوهاج', 'أسيوط',
  'الفيوم', 'بني سويف', 'المنيا'
]

const entityTypes = [
  { value: 'main', label: 'رئيسية' },
  { value: 'branch', label: 'فرعية' },
  { value: 'workers', label: 'عاملين' }
]

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

// Generate years from 2020 to current year + 5
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2019 + 5 }, (_, i) => {
  const year = 2020 + i
  return { value: year.toString(), label: year.toString() }
})

export default function RevenuesManagement() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)
  const [formData, setFormData] = useState({
    entityName: '',
    entityId: '',
    value: '',
    dueDate: '',
    period: '',
    type: 'subscriptions' as 'subscriptions' | 'penalties' | 'legal_fees' | 'computerization' | 'other',
    notes: ''
  })
  const [isAddEntityDialogOpen, setIsAddEntityDialogOpen] = useState(false)
  const [newEntityData, setNewEntityData] = useState({
    name: '',
    type: 'main' as 'main' | 'branch' | 'workers',
    governorate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Parse period into month and year
  const parsePeriod = (period: string) => {
    if (!period) return { month: '', year: '' }
    
    // Handle YYYY-MM format
    const yyyyMmMatch = period.match(/^(\d{4})-(\d{2})$/)
    if (yyyyMmMatch) {
      return { month: yyyyMmMatch[2], year: yyyyMmMatch[1] }
    }
    
    // Handle MM/YYYY format
    const mmYyyyMatch = period.match(/^(\d{2})\/(\d{4})$/)
    if (mmYyyyMatch) {
      return { month: mmYyyyMatch[1], year: mmYyyyMatch[2] }
    }
    
    // Handle YYYY format (year only)
    const yyyyMatch = period.match(/^(\d{4})$/)
    if (yyyyMatch) {
      return { month: '', year: yyyyMatch[1] }
    }
    
    return { month: '', year: '' }
  }

  // Format month and year into period string
  const formatPeriod = (month: string, year: string) => {
    if (year && month) {
      return `${year}-${month}`
    }
    if (year) {
      return year
    }
    return ''
  }

  // Handle month change
  const handleMonthChange = (month: string) => {
    const currentPeriod = parsePeriod(formData.period)
    const newMonth = month === "none" ? "" : month
    const newPeriod = formatPeriod(newMonth, currentPeriod.year)
    setFormData({...formData, period: newPeriod})
  }

  // Handle year change
  const handleYearChange = (year: string) => {
    const currentPeriod = parsePeriod(formData.period)
    const newYear = year === "none" ? "" : year
    const newPeriod = formatPeriod(currentPeriod.month, newYear)
    setFormData({...formData, period: newPeriod})
  }

  // Fetch revenues
  const fetchRevenues = async () => {
    try {
      const response = await fetch('/api/revenues')
      if (response.ok) {
        const data = await response.json()
        setRevenues(data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في جلب بيانات الإيرادات',
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

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const response = await fetch('/api/entities')
      if (response.ok) {
        const data = await response.json()
        setEntities(data)
      }
    } catch (error) {
      console.error('Error fetching entities:', error)
    }
  }

  useEffect(() => {
    fetchRevenues()
    fetchEntities()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, addNew: boolean = false) => {
    e.preventDefault()
    
    if (!formData.entityName || !formData.value || !formData.dueDate || !formData.period || !formData.type) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول المطلوبة',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Validate period format
    const periodRegex = /^(\d{4})(-(\d{2}))?$/
    if (!periodRegex.test(formData.period)) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'تنسيق فترة الإيراد غير صحيح. يرجى استخدام التنسيق: سنة (مثال: 2024) أو سنة-شهر (مثال: 2024-01)',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Validate month if provided
    if (formData.period.includes('-')) {
      const month = formData.period.split('-')[1]
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'الشهر يجب أن يكون بين 01 و 12',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#f59e0b'
        })
        return
      }
    }

    try {
      const url = editingRevenue ? `/api/revenues/${editingRevenue.id}` : '/api/revenues'
      const method = editingRevenue ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        entityId: formData.entityId || null
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: editingRevenue ? 'تم تحديث الإيراد بنجاح' : 'تم إضافة الإيراد بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        
        fetchRevenues()
        fetchEntities()
        
        if (addNew) {
          // Reset form for new entry
          setFormData({
            entityName: '',
            entityId: '',
            value: '',
            dueDate: '',
            period: '',
            type: 'subscriptions',
            notes: ''
          })
        } else {
          // Close dialog
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingRevenue(null)
          setFormData({
            entityName: '',
            entityId: '',
            value: '',
            dueDate: '',
            period: '',
            type: 'subscriptions',
            notes: ''
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حفظ البيانات',
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
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    const { value: confirmDelete } = await Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف هذا الإيراد؟ لا يمكن التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    })

    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/revenues/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: 'تم حذف الإيراد بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchRevenues()
        fetchEntities()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حذف الإيراد',
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
    }
  }

  // Handle edit
  const handleEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue)
    setFormData({
      entityName: revenue.entityName,
      entityId: revenue.entity?.id?.toString() || '',
      value: revenue.value.toString(),
      dueDate: new Date(revenue.dueDate).toISOString().split('T')[0],
      period: revenue.period,
      type: revenue.type,
      notes: revenue.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  // Handle entity selection
  const handleEntityChange = (entityId: string) => {
    if (entityId === 'new') {
      setIsAddEntityDialogOpen(true)
    } else {
      const entity = entities.find(e => e.id.toString() === entityId)
      if (entity) {
        setFormData({
          ...formData,
          entityId,
          entityName: entity.name
        })
      }
    }
  }

  // Handle new entity form submission
  const handleAddNewEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEntityData.name || !newEntityData.type || !newEntityData.governorate) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول المطلوبة',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    try {
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntityData),
      })

      if (response.ok) {
        const newEntity = await response.json()
        
        // Update entities list
        setEntities(prev => [newEntity, ...prev])
        
        // Auto-select the new entity
        setFormData({
          ...formData,
          entityId: newEntity.id.toString(),
          entityName: newEntity.name
        })
        
        // Reset form and close dialog
        setNewEntityData({
          name: '',
          type: 'main',
          governorate: ''
        })
        setIsAddEntityDialogOpen(false)
        
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: 'تم إضافة الجهة بنجاح وتم تحديدها تلقائياً',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في إضافة الجهة',
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
    }
  }

  // Filter and search revenues
  const filteredAndSearchedRevenues = revenues.filter(revenue => {
    const matchesSearch = searchQuery.length >= 3 ? 
      revenue.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (revenue.notes && revenue.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      revenue.serial.toString().includes(searchQuery) ||
      revenue.value.toString().includes(searchQuery)
      : true
    
    const matchesType = filterType === 'all' || revenue.type === filterType
    const matchesPeriod = filterPeriod === 'all' || revenue.period.includes(filterPeriod)
    
    return matchesSearch && matchesType && matchesPeriod
  })

  // Pagination
  const totalPages = Math.ceil(filteredAndSearchedRevenues.length / itemsPerPage)
  const paginatedRevenues = filteredAndSearchedRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate total revenue
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.value, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">جاري تحميل بيانات الإيرادات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">وحدة الإيرادات</h1>
          <p className="text-muted-foreground">إدارة وتسجيل الإيرادات المالية للجهات</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} ج.م</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة إيراد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة إيراد جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الإيراد الجديد في النموذج أدناه
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity">الجهة</Label>
                    <Select onValueChange={handleEntityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id.toString()}>
                            {entity.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ إضافة جهة جديدة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="value">القيمة (ج.م)</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      placeholder="أدخل القيمة"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">فترة الإيراد</Label>
                    <div className="flex gap-2">
                      <Select onValueChange={handleMonthChange} value={parsePeriod(formData.period).month || "none"}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="الشهر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- اختر الشهر --</SelectItem>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={handleYearChange} value={parsePeriod(formData.period).year || "none"}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- اختر السنة --</SelectItem>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500">التنسيق: سنة-شهر (مثال: 2024-01) أو سنة فقط (مثال: 2024)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الإيراد</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {revenueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="أدخل الملاحظات (اختياري)"
                  />
                </div>
                
                <DialogFooter className="flex gap-2">
                  <Button type="button" variant="outline" onClick={(e) => handleSubmit(e as any, true)}>
                    حفظ وإضافة جديد
                  </Button>
                  <Button type="submit">حفظ</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ابحث في الإيرادات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterType">نوع الإيراد</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {revenueTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterPeriod">الفترة</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="Q1">الربع الأول</SelectItem>
                  <SelectItem value="Q2">الربع الثاني</SelectItem>
                  <SelectItem value="Q3">الربع الثالث</SelectItem>
                  <SelectItem value="Q4">الربع الرابع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenues Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الإيرادات</CardTitle>
          <CardDescription>
            عرض جميع الإيرادات المسجلة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم المسلسل</TableHead>
                  <TableHead>الجهة</TableHead>
                  <TableHead>القيمة</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الفترة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium">{revenue.serial}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{revenue.entityName}</span>
                        {revenue.entity && (
                          <Badge variant="outline" className="text-xs">
                            {revenue.entity.type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {revenue.value.toFixed(2)} ج.م
                    </TableCell>
                    <TableCell>
                      {new Date(revenue.dueDate).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>{revenue.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {revenueTypes.find(t => t.value === revenue.type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(revenue)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(revenue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSearchedRevenues.length)} من {filteredAndSearchedRevenues.length} إيراد
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل الإيراد</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الإيراد في النموذج أدناه
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editEntity">الجهة</Label>
                <Select onValueChange={handleEntityChange} value={formData.entityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ إضافة جهة جديدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editValue">القيمة (ج.م)</Label>
                <Input
                  id="editValue"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="أدخل القيمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="editDueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="editPeriod">فترة الإيراد</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={handleMonthChange} value={parsePeriod(formData.period).month || "none"}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- اختر الشهر --</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={handleYearChange} value={parsePeriod(formData.period).year || "none"}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- اختر السنة --</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">التنسيق: سنة-شهر (مثال: 2024-01) أو سنة فقط (مثال: 2024)</p>
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="editType">نوع الإيراد</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editNotes">ملاحظات</Label>
              <Input
                id="editNotes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="أدخل الملاحظات (اختياري)"
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Entity Dialog */}
      <Dialog open={isAddEntityDialogOpen} onOpenChange={setIsAddEntityDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة جهة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الجهة الجديدة في النموذج أدناه
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewEntity} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newEntityName">اسم الجهة</Label>
                <Input
                  id="newEntityName"
                  value={newEntityData.name}
                  onChange={(e) => setNewEntityData({...newEntityData, name: e.target.value})}
                  placeholder="أدخل اسم الجهة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newEntityType">نوع الجهة</Label>
                <Select 
                  value={newEntityData.type} 
                  onValueChange={(value: any) => setNewEntityData({...newEntityData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newEntityGovernorate">المحافظة</Label>
                <Select 
                  value={newEntityData.governorate} 
                  onValueChange={(value) => setNewEntityData({...newEntityData, governorate: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((governorate) => (
                      <SelectItem key={governorate} value={governorate}>
                        {governorate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddEntityDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">إضافة الجهة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}