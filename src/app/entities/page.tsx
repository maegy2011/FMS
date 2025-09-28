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
  Users, 
  Plus, 
  Search, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  DollarSign,
  FileText
} from 'lucide-react'

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
  address?: string
  phone?: string
  email?: string
  description?: string
  parentId?: string
  isActive: boolean
  createdAt: string
  parent?: Entity
  children?: Entity[]
  _count?: {
    incomes: number
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

const typeLabels = {
  'MAIN': 'رئيسية',
  'SUBSIDIARY': 'تابعة',
  'EMPLOYEE': 'موظف'
}

const typeColors = {
  'MAIN': 'bg-blue-100 text-blue-800',
  'SUBSIDIARY': 'bg-green-100 text-green-800',
  'EMPLOYEE': 'bg-purple-100 text-purple-800'
}

export default function EntitiesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    parentId: ''
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
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/entities', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const entitiesData = await response.json()
        setEntities(entitiesData)
      }
    } catch (error) {
      console.error('Error loading entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newEntity.name,
          type: newEntity.type,
          address: newEntity.address || undefined,
          phone: newEntity.phone || undefined,
          email: newEntity.email || undefined,
          description: newEntity.description || undefined,
          parentId: newEntity.parentId || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تمت الإضافة بنجاح',
          description: 'تمت إضافة الجهة بنجاح',
        })
        setIsAddDialogOpen(false)
        setNewEntity({
          name: '',
          type: '',
          address: '',
          phone: '',
          email: '',
          description: '',
          parentId: ''
        })
        loadEntities()
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

  const handleDeleteEntity = async (entityId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجهة؟')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/entities/${entityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تم الحذف بنجاح',
          description: 'تم حذف الجهة بنجاح',
        })
        loadEntities()
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

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || entity.type === typeFilter
    
    return matchesSearch && matchesType
  })

  // Build hierarchy tree
  const buildEntityTree = (entities: Entity[], parentId?: string): Entity[] => {
    return entities
      .filter(entity => entity.parentId === parentId)
      .map(entity => ({
        ...entity,
        children: buildEntityTree(entities, entity.id)
      }))
  }

  const entityTree = buildEntityTree(entities)

  const renderEntityTree = (entities: Entity[], level = 0) => {
    return entities.map((entity) => (
      <div key={entity.id} className={`${level > 0 ? 'mr-6' : ''}`}>
        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{entity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {entity.parent && `تابعة لـ: ${entity.parent.name}`}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={typeColors[entity.type as keyof typeof typeColors]}>
                  {typeLabels[entity.type as keyof typeof typeLabels] || entity.type}
                </Badge>
                {entity._count && entity._count.incomes > 0 && (
                  <Badge variant="outline">
                    {entity._count.incomes} إيراد
                  </Badge>
                )}
              </div>
              
              {entity.description && (
                <p className="text-sm text-muted-foreground mb-2">{entity.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {entity.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {entity.address}
                  </div>
                )}
                {entity.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {entity.phone}
                  </div>
                )}
                {entity.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {entity.email}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button size="sm" variant="outline">
                <Edit className="w-3 h-3 ml-1" />
                تعديل
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDeleteEntity(entity.id)}
              >
                <Trash2 className="w-3 h-3 ml-1" />
                حذف
              </Button>
            </div>
          </div>
        </div>
        
        {entity.children && entity.children.length > 0 && (
          <div className="mt-2">
            {renderEntityTree(entity.children, level + 1)}
          </div>
        )}
      </div>
    ))
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">إدارة الجهات</h1>
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
            <h2 className="text-2xl font-bold gold-accent mb-2">الجهات</h2>
            <p className="text-muted-foreground">إدارة جميع الجهات الرئيسية والتابعة والموظفين</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة جهة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة جهة جديدة</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات الجهة الجديدة
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEntity} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الجهة</Label>
                    <Input
                      id="name"
                      value={newEntity.name}
                      onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                      required
                      className="text-right"
                      placeholder="أدخل اسم الجهة"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الجهة</Label>
                    <Select value={newEntity.type} onValueChange={(value) => setNewEntity({...newEntity, type: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentId">جهة رئيسية (اختياري)</Label>
                    <Select value={newEntity.parentId} onValueChange={(value) => setNewEntity({...newEntity, parentId: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الجهة الرئيسية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">لا يوجد</SelectItem>
                        {entities.filter(e => e.type === 'MAIN').map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان (اختياري)</Label>
                    <Input
                      id="address"
                      value={newEntity.address}
                      onChange={(e) => setNewEntity({...newEntity, address: e.target.value})}
                      className="text-right"
                      placeholder="أدخل العنوان"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">الهاتف (اختياري)</Label>
                    <Input
                      id="phone"
                      value={newEntity.phone}
                      onChange={(e) => setNewEntity({...newEntity, phone: e.target.value})}
                      className="text-right"
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEntity.email}
                      onChange={(e) => setNewEntity({...newEntity, email: e.target.value})}
                      className="text-right"
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف (اختياري)</Label>
                    <Input
                      id="description"
                      value={newEntity.description}
                      onChange={(e) => setNewEntity({...newEntity, description: e.target.value})}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="بحث بالاسم أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
              
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

        {/* Entities List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              شجرة الجهات
            </CardTitle>
            <CardDescription>
              جميع الجهات المسجلة في النظام ({entities.length} جهة)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entityTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد جهات مسجلة بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {renderEntityTree(entityTree)}
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
          <Link href="/entities" className="flex flex-col items-center gap-1 p-2 text-primary">
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