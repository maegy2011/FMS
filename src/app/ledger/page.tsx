'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  ArrowRightLeft,
  Users
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

interface LedgerEntry {
  id: string
  description: string
  debit: number
  credit: number
  balance: number
  date: string
  createdAt: string
  income?: {
    id: string
    amount: number
    type: string
    entity: {
      name: string
    }
  }
  entity?: {
    name: string
    type: string
  }
}

const roleLabels = {
  'SYSTEM_MANAGER': 'مدير النظام',
  'EXPERT': 'خبير',
  'ACCOUNT_HEAD': 'رئيس الحسابات',
  'REVIEWER': 'مراجع',
  'ACCOUNTANT': 'محاسب',
  'ADVISOR': 'مستشار'
}

export default function LedgerPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    description: '',
    debit: '',
    credit: '',
    entityId: ''
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
      
      const [ledgerResponse, entitiesResponse] = await Promise.all([
        fetch('/api/ledger', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/entities', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (ledgerResponse.ok) {
        const ledgerData = await ledgerResponse.json()
        setLedgerEntries(ledgerData)
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

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: newEntry.description,
          debit: newEntry.debit ? parseFloat(newEntry.debit) : 0,
          credit: newEntry.credit ? parseFloat(newEntry.credit) : 0,
          entityId: newEntry.entityId && newEntry.entityId !== 'none' ? newEntry.entityId : undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تمت الإضافة بنجاح',
          description: 'تمت إضافة القيد في دفتر الاستاذ بنجاح',
        })
        setIsAddDialogOpen(false)
        setNewEntry({
          description: '',
          debit: '',
          credit: '',
          entityId: ''
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

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.income?.entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.entity?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || entry.date.startsWith(dateFilter)
    
    return matchesSearch && matchesDate
  })

  // Calculate totals
  const totals = filteredEntries.reduce((acc, entry) => {
    acc.totalDebit += entry.debit
    acc.totalCredit += entry.credit
    acc.finalBalance = acc.totalDebit - acc.totalCredit
    return acc
  }, { totalDebit: 0, totalCredit: 0, finalBalance: 0 })

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
                <h1 className="text-xl font-bold gold-accent">دفتر الاستاذ</h1>
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
            <h2 className="text-2xl font-bold gold-accent mb-2">دفتر الاستاذ العام</h2>
            <p className="text-muted-foreground">تسجيل جميع القيود المحاسبية والمالية</p>
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
                  إضافة قيد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة قيد جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات القيد المحاسبي الجديد
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEntry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">البيان</Label>
                    <Input
                      id="description"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                      required
                      className="text-right"
                      placeholder="أدخل بيان القيد"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="debit">مدين</Label>
                      <Input
                        id="debit"
                        type="number"
                        step="0.01"
                        value={newEntry.debit}
                        onChange={(e) => setNewEntry({...newEntry, debit: e.target.value})}
                        className="text-right"
                        placeholder="٠.٠٠"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credit">دائن</Label>
                      <Input
                        id="credit"
                        type="number"
                        step="0.01"
                        value={newEntry.credit}
                        onChange={(e) => setNewEntry({...newEntry, credit: e.target.value})}
                        className="text-right"
                        placeholder="٠.٠٠"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entityId">الجهة (اختياري)</Label>
                    <Select value={newEntry.entityId} onValueChange={(value) => setNewEntry({...newEntry, entityId: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">لا يوجد</SelectItem>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.totalDebit)}
              </div>
            </CardContent>
          </Card>

          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.totalCredit)}
              </div>
            </CardContent>
          </Card>

          <Card className="islamic-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الرصيد النهائي</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totals.finalBalance >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(Math.abs(totals.finalBalance))}
                <span className="text-sm ml-2">
                  {totals.finalBalance >= 0 ? '(مدين)' : '(دائن)'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="بحث بالبيان أو الجهة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
              
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-right"
                placeholder="تصفية حسب التاريخ"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ledger Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              قيود دفتر الاستاذ
            </CardTitle>
            <CardDescription>
              جميع القيود المسجلة في دفتر الاستاذ ({filteredEntries.length} قيد)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد قيود مطابقة للبحث</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted rounded-lg font-medium text-sm">
                  <div className="col-span-3 text-right">البيان</div>
                  <div className="col-span-2 text-right">الجهة</div>
                  <div className="col-span-2 text-center">مدين</div>
                  <div className="col-span-2 text-center">دائن</div>
                  <div className="col-span-2 text-center">الرصيد</div>
                  <div className="col-span-1 text-center">التاريخ</div>
                </div>

                {/* Table Body */}
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="col-span-3 text-right">
                      <div className="font-medium">{entry.description}</div>
                      {entry.income && (
                        <div className="text-sm text-muted-foreground">
                          {entry.income.entity.name} - {entry.income.type}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-right">
                      {entry.entity?.name || entry.income?.entity.name || '-'}
                    </div>
                    
                    <div className="col-span-2 text-center">
                      {entry.debit > 0 && (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(entry.debit)}
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-center">
                      {entry.credit > 0 && (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(entry.credit)}
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <span className={`font-medium ${
                        entry.balance >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(Math.abs(entry.balance))}
                      </span>
                    </div>
                    
                    <div className="col-span-1 text-center text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                ))}

                {/* Table Footer */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted rounded-lg font-bold">
                  <div className="col-span-7 text-right">الإجمالي</div>
                  <div className="col-span-2 text-center text-red-600">
                    {formatCurrency(totals.totalDebit)}
                  </div>
                  <div className="col-span-2 text-center text-green-600">
                    {formatCurrency(totals.totalCredit)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
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
          <Link href="/reports" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <FileText className="w-5 h-5" />
            <span className="text-xs">التقارير</span>
          </Link>
        </div>
      </div>
    </div>
  )
}