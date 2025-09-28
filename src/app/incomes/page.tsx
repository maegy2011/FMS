'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
  Users,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  username: string
  fullName: string
  role: string
  email: string
}

interface Entity {
  id: string
  name: string
  type: string
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
  createdAt: string
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

const entityTypeLabels = {
  'MAIN': 'رئيسية',
  'SUBSIDIARY': 'تابعة',
  'EMPLOYEE': 'موظف'
}

export default function IncomesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newIncome, setNewIncome] = useState({
    amount: '',
    type: '',
    description: '',
    entityId: '',
    dueDate: format(new Date(), 'yyyy-MM-dd')
  })
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
      
      const [incomesResponse, entitiesResponse] = await Promise.all([
        fetch('/api/incomes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/entities', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (incomesResponse.ok) {
        const incomesData = await incomesResponse.json()
        setIncomes(incomesData)
      }

      if (entitiesResponse.ok) {
        const entitiesData = await entitiesResponse.json()
        setEntities(entitiesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(newIncome.amount),
          type: newIncome.type,
          description: newIncome.description,
          entityId: newIncome.entityId,
          dueDate: newIncome.dueDate
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تمت الإضافة بنجاح',
          description: 'تمت إضافة الإيراد بنجاح',
        })
        setIsAddDialogOpen(false)
        setNewIncome({
          amount: '',
          type: '',
          description: '',
          entityId: '',
          dueDate: format(new Date(), 'yyyy-MM-dd')
        })
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

  const handleUpdateStatus = async (incomeId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/incomes/${incomeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث حالة الإيراد بنجاح',
        })
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

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = income.entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         income.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || income.status === statusFilter
    const matchesType = typeFilter === 'ALL' || income.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

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
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">إدارة الإيرادات</h1>
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
            <h2 className="text-2xl font-bold gold-accent mb-2">الإيرادات المالية</h2>
            <p className="text-muted-foreground">إدارة ومتابعة جميع الإيرادات المالية للنظام</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 ml-1" />
              تصدير
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة إيراد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة إيراد جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات الإيراد الجديد
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                      required
                      className="text-right"
                      placeholder="أدخل المبلغ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الإيراد</Label>
                    <Select value={newIncome.type} onValueChange={(value) => setNewIncome({...newIncome, type: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع الإيراد" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entityId">الجهة</Label>
                    <Select value={newIncome.entityId} onValueChange={(value) => setNewIncome({...newIncome, entityId: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name} ({entityTypeLabels[entity.type as keyof typeof entityTypeLabels] || entity.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newIncome.dueDate}
                      onChange={(e) => setNewIncome({...newIncome, dueDate: e.target.value})}
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف (اختياري)</Label>
                    <Input
                      id="description"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                      className="text-right"
                      placeholder="أدخل الوصف"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex-1">
                      إضافة
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="بحث بالجهة أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الحالات</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الأنواع</SelectItem>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incomes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              قائمة الإيرادات
            </CardTitle>
            <CardDescription>
              جميع الإيرادات المسجلة في النظام ({filteredIncomes.length} إيراد)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIncomes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد إيرادات مطابقة للبحث</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncomes.map((income) => (
                  <div key={income.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{income.entity.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {entityTypeLabels[income.entity.type as keyof typeof entityTypeLabels] || income.entity.type}
                            </div>
                          </div>
                        </div>
                        
                        {income.description && (
                          <p className="text-sm text-muted-foreground mb-2">{income.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            الاستحقاق: {formatDate(income.dueDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            الإضافة: {formatDate(income.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold gold-accent mb-2">
                          {formatCurrency(income.amount)}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[income.status as keyof typeof statusColors]}>
                            {statusLabels[income.status as keyof typeof statusLabels] || income.status}
                          </Badge>
                          <Badge variant="outline">
                            {typeLabels[income.type as keyof typeof typeLabels] || income.type}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          {income.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateStatus(income.id, 'COLLECTED')}
                              >
                                <CheckCircle className="w-3 h-3 ml-1" />
                                تحصيل
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateStatus(income.id, 'CANCELLED')}
                              >
                                <X className="w-3 h-3 ml-1" />
                                إلغاء
                              </Button>
                            </>
                          )}
                        </div>
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
          <Link href="/incomes" className="flex flex-col items-center gap-1 p-2 text-primary">
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