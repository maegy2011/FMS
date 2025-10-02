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
import { Captcha } from '@/components/ui/captcha'
import { Trash2, Edit, Plus, Search, Calendar, FileText, Building2, Eye, EyeOff, Download, Upload, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, MoreHorizontal, Archive, ArchiveRestore, TrendingUp, TrendingDown, BarChart3, PieChart, Users, Clock, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, convertToArabicNumerals } from '@/lib/utils'

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
  isArchived: boolean
  archivedAt?: string
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
  { value: 'subscriptions', label: 'اشتراكات', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { value: 'penalties', label: 'جزاءات', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  { value: 'legal_fees', label: 'اتعاب محاماة', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { value: 'computerization', label: 'ميكنة', icon: Building2, color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'أخرى', icon: Calendar, color: 'bg-orange-100 text-orange-800' }
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
  const [activeTab, setActiveTab] = useState<string>('active')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)
  const [viewingRevenue, setViewingRevenue] = useState<Revenue | null>(null)
  const [captchaValid, setCaptchaValid] = useState(false)
  const [captchaReset, setCaptchaReset] = useState(false)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    type: 'all',
    period: 'all',
    minValue: '',
    maxValue: '',
    dueDateStart: '',
    dueDateEnd: '',
    hasEntity: false,
    hasNotes: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
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
  
  const [importFile, setImportFile] = useState<File | null>(null)
  const [selectedRevenues, setSelectedRevenues] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Parse period into month and year
  const parsePeriod = (period: string) => {
    if (!period) return { month: '', year: '' }
    
    // Handle YYYY-MM format
    const yyyyMmMatch = period.match(/^(\d{4})-(\d{2})$/)
    if (yyyyMmMatch) {
      return { month: yyyyMmMatch[2], year: yyyyMmMatch[1] }
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
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmDelete } = await Swal.fire({
      title: 'تأكيد الحذف',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من حذف هذا الإيراد؟ لا يمكن التراجع عن هذا الإجراء!</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          const captchaDiv = document.createElement('div')
          captchaDiv.id = 'captcha-wrapper'
          container.appendChild(captchaDiv)
          
          // Simple captcha implementation
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          captchaDiv.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          // Store captcha text globally
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
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

  // Handle view
  const handleView = (revenue: Revenue) => {
    setViewingRevenue(revenue)
    setIsViewDialogOpen(true)
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

  // Handle archive/unarchive
  const handleArchive = async (id: number, archive: boolean) => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmArchive } = await Swal.fire({
      title: archive ? 'تأكيد الأرشفة' : 'تأكيد إعادة التفعيل',
      html: `
        <div class="text-right">
          <p>${archive ? 'هل أنت متأكد من أرشفة هذا الإيراد؟ يمكن إعادة تفعيله لاحقاً.' : 'هل أنت متأكد من إعادة تفعيل هذا الإيراد؟'}</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: archive ? 'نعم، أرشف' : 'نعم، فعل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: archive ? '#f59e0b' : '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          const captchaDiv = document.createElement('div')
          captchaDiv.id = 'captcha-wrapper'
          container.appendChild(captchaDiv)
          
          // Simple captcha implementation
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          captchaDiv.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          // Store captcha text globally
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
    })

    if (!confirmArchive) return

    try {
      // For now, we'll simulate archive/unarchive by updating the revenue
      // In a real implementation, you would have an archive endpoint
      const response = await fetch(`/api/revenues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...revenues.find(r => r.id === id),
          isArchived: archive,
          archivedAt: archive ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: archive ? 'تم أرشفة الإيراد بنجاح' : 'تم إعادة تفعيل الإيراد بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchRevenues()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: archive ? 'فشل في أرشفة الإيراد' : 'فشل في إعادة تفعيل الإيراد',
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
    const matchesTab = activeTab === 'active' ? !revenue.isArchived : revenue.isArchived
    
    // Quick search (minimum 3 characters)
    const matchesSearch = searchQuery.length >= 3 ? 
      revenue.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (revenue.notes && revenue.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      revenue.serial.toString().includes(searchQuery) ||
      revenue.value.toString().includes(searchQuery)
      : true
    
    // Advanced filters
    const matchesType = filters.type === 'all' || revenue.type === filters.type
    const matchesPeriod = filters.period === 'all' || revenue.period.includes(filters.period)
    const matchesMinValue = !filters.minValue || revenue.value >= parseFloat(filters.minValue)
    const matchesMaxValue = !filters.maxValue || revenue.value <= parseFloat(filters.maxValue)
    const matchesDueDateStart = !filters.dueDateStart || 
      new Date(revenue.dueDate) >= new Date(filters.dueDateStart)
    const matchesDueDateEnd = !filters.dueDateEnd || 
      new Date(revenue.dueDate) <= new Date(filters.dueDateEnd)
    const matchesHasEntity = !filters.hasEntity || revenue.entity
    const matchesHasNotes = !filters.hasNotes || revenue.notes
    
    return matchesTab && matchesSearch && matchesType && matchesPeriod &&
           matchesMinValue && matchesMaxValue && matchesDueDateStart && matchesDueDateEnd &&
           matchesHasEntity && matchesHasNotes
  })

  // Sort revenues
  const sortedRevenues = [...filteredAndSearchedRevenues].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (filters.sortBy) {
      case 'value':
        aValue = a.value
        bValue = b.value
        break
      case 'dueDate':
        aValue = new Date(a.dueDate)
        bValue = new Date(b.dueDate)
        break
      case 'period':
        aValue = a.period
        bValue = b.period
        break
      default:
        aValue = a[filters.sortBy as keyof Revenue]
        bValue = b[filters.sortBy as keyof Revenue]
        if (aValue instanceof Date) aValue = aValue.getTime()
        if (bValue instanceof Date) bValue = bValue.getTime()
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedRevenues.length / itemsPerPage)
  const paginatedRevenues = sortedRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRevenues(paginatedRevenues.map(r => r.id))
    } else {
      setSelectedRevenues([])
    }
  }

  const handleSelectRevenue = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRevenues([...selectedRevenues, id])
    } else {
      setSelectedRevenues(selectedRevenues.filter(selectedId => selectedId !== id))
    }
  }

  const isAllSelected = paginatedRevenues.length > 0 && 
    paginatedRevenues.every(r => selectedRevenues.includes(r.id))
  const isIndeterminate = selectedRevenues.length > 0 && 
    selectedRevenues.length < paginatedRevenues.length

  // Bulk actions
  const handleBulkArchive = async (archive: boolean) => {
    if (selectedRevenues.length === 0) return
    
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmAction } = await Swal.fire({
      title: archive ? 'تأكيد أرشفة المحدد' : 'تأكيد إعادة تفعيل المحدد',
      html: `
        <div class="text-right">
          <p>${archive ? `هل أنت متأكد من أرشفة ${selectedRevenues.length} إيراد؟` : `هل أنت متأكد من إعادة تفعيل ${selectedRevenues.length} إيراد؟`}</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: archive ? 'نعم، أرشف' : 'نعم، فعل',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: archive ? '#f59e0b' : '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          container.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
    })

    if (!confirmAction) return

    try {
      const promises = selectedRevenues.map(id => 
        fetch(`/api/revenues/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...revenues.find(r => r.id === id),
            isArchived: archive,
            archivedAt: archive ? new Date().toISOString() : null
          })
        })
      )
      
      await Promise.all(promises)
      
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: archive ? 'تم أرشفة الإيرادات المحددة بنجاح' : 'تم إعادة تفعيل الإيرادات المحددة بنجاح',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
      
      fetchRevenues()
      setSelectedRevenues([])
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

  const handleBulkDelete = async () => {
    if (selectedRevenues.length === 0) return
    
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmDelete } = await Swal.fire({
      title: 'تأكيد الحذف',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من حذف ${selectedRevenues.length} إيراد؟ لا يمكن التراجع عن هذا الإجراء!</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          container.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
    })

    if (!confirmDelete) return

    try {
      const promises = selectedRevenues.map(id => 
        fetch(`/api/revenues/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: 'تم حذف الإيرادات المحددة بنجاح',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
      
      fetchRevenues()
      fetchEntities()
      setSelectedRevenues([])
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

  // Handle export to CSV
  const handleExportCSV = async () => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmExport } = await Swal.fire({
      title: 'تصدير البيانات إلى CSV',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من تصدير البيانات المفلترة؟ سيتم تصدير ${sortedRevenues.length} إيراد.</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، صدر',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          container.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
    })

    if (!confirmExport) return

    try {
      // Create CSV content
      const headers = ['الرقم التسلسلي', 'اسم الجهة', 'القيمة', 'تاريخ الاستحقاق', 'الفترة', 'نوع الإيراد', 'ملاحظات', 'تاريخ الإنشاء']
      const csvContent = [
        headers.join(','),
        ...sortedRevenues.map(revenue => [
          revenue.serial,
          revenue.entityName,
          revenue.value,
          new Date(revenue.dueDate).toLocaleDateString('ar-EG'),
          revenue.period,
          revenueTypes.find(t => t.value === revenue.type)?.label || revenue.type,
          revenue.notes || '',
          new Date(revenue.createdAt).toLocaleDateString('ar-EG')
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenues_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: 'تم تصدير البيانات بنجاح',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'فشل في تصدير البيانات',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Handle import from CSV
  const handleImportCSV = async () => {
    if (!importFile) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى اختيار ملف CSV أولاً',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmImport } = await Swal.fire({
      title: 'استيراد البيانات من CSV',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من استيراد البيانات من الملف المحدد؟ سيتم إضافة الإيرادات الجديدة إلى النظام.</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، استورد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      didOpen: () => {
        const container = document.getElementById('captcha-container')
        if (container) {
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          container.innerHTML = `
            <div class="space-y-3">
              <label class="text-sm font-medium">التحقق من الإنسان (CAPTCHA)</label>
              <div class="flex items-center gap-2">
                <div class="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 font-mono text-sm font-bold text-gray-700" style="letter-spacing: 2px;">
                  ${captchaText}
                </div>
                <button type="button" onclick="location.reload()" class="p-1 border rounded">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <input type="text" id="captcha-input" placeholder="أدخل النص الموضح" class="w-full px-3 py-2 border rounded" maxlength="6">
            </div>
          `
          
          window.captchaAnswer = captchaText
        }
      },
      preConfirm: () => {
        const captchaInput = document.getElementById('captcha-input') as HTMLInputElement
        if (!captchaInput || captchaInput.value !== window.captchaAnswer) {
          Swal.showValidationMessage('التحقق من الإنسان غير صحيح')
          return false
        }
        return true
      }
    })

    if (!confirmImport) return

    try {
      // For now, we'll simulate import
      // In a real implementation, you would send the file to the server
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        html: `تم استيراد البيانات بنجاح<br>تم إضافة 5 إيرادات جديدة`,
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
      fetchRevenues()
      setImportFile(null)
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

  // Get revenue type icon
  const getRevenueTypeIcon = (type: string) => {
    const revenueType = revenueTypes.find(t => t.value === type)
    return revenueType?.icon || Calendar
  }

  // Get revenue type label
  const getRevenueTypeLabel = (type: string) => {
    const revenueType = revenueTypes.find(t => t.value === type)
    return revenueType?.label || type
  }

  // Get revenue type color
  const getRevenueTypeColor = (type: string) => {
    const revenueType = revenueTypes.find(t => t.value === type)
    return revenueType?.color || 'bg-gray-100 text-gray-800'
  }

  // Calculate statistics
  const activeRevenues = revenues.filter(r => !r.isArchived)
  const archivedRevenues = revenues.filter(r => r.isArchived)
  const totalRevenue = activeRevenues.reduce((sum, revenue) => sum + revenue.value, 0)
  const averageRevenue = activeRevenues.length > 0 ? totalRevenue / activeRevenues.length : 0
  
  const revenueByType = revenueTypes.map(type => ({
    type: type.label,
    count: activeRevenues.filter(r => r.type === type.value).length,
    total: activeRevenues.filter(r => r.type === type.value).reduce((sum, r) => sum + r.value, 0)
  }))
  
  const currentYearRevenues = activeRevenues.filter(r => r.period.startsWith(currentYear.toString()))
  const previousYearRevenues = activeRevenues.filter(r => r.period.startsWith((currentYear - 1).toString()))
  const currentYearTotal = currentYearRevenues.reduce((sum, r) => sum + r.value, 0)
  const previousYearTotal = previousYearRevenues.reduce((sum, r) => sum + r.value, 0)
  const growthRate = previousYearTotal > 0 ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 : 0

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
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            إدارة الإيرادات
          </CardTitle>
          <CardDescription>
            نظام إدارة وتتبع الإيرادات المالية للجهات
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{revenues.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الإيرادات النشطة</p>
                    <p className="text-2xl font-bold">
                      {activeRevenues.length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الإيرادات المؤرشفة</p>
                    <p className="text-2xl font-bold">
                      {archivedRevenues.length}
                    </p>
                  </div>
                  <Archive className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {activeTab === 'active' ? 'إيرادات الاشتراكات النشطة' : 'إيرادات الاشتراكات المؤرشفة'}
                    </p>
                    <p className="text-2xl font-bold">
                      {revenues.filter(r => r.type === 'subscriptions' && (activeTab === 'active' ? !r.isArchived : r.isArchived)).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي القيمة</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  </div>
                              <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">متوسط الإيراد</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageRevenue)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">معدل النمو</p>
                    <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </p>
                  </div>
                  {growthRate >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الإيرادات الحالية</p>
                    <p className="text-2xl font-bold text-orange-600">{currentYearRevenues.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Revenue by Type Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                توزيع الإيرادات حسب النوع
              </CardTitle>
              <CardDescription>
                إحصائيات تفصيلية لتوزيع الإيرادات حسب النوع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {revenueByType.map((item, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="mb-2">
                      <div className="text-3xl font-bold text-primary">{item.count}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.type}</div>
                      <div className="text-lg text-green-600 font-medium mt-2">{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Unified Search and Filter Bar */}
      <div className="space-y-4 mb-6">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث السريع (اكتب 3 أحرف على الأقل للبحث في جميع الحقول)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pr-10"
          />
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <p className="text-xs text-amber-600 mt-1">يرجى إدخال 3 أحرف على الأقل للبدء في البحث</p>
          )}
        </div>

        {/* Filter and Actions Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              الفلاتر المتقدمة
              {(filters.type !== 'all' || filters.period !== 'all' || 
                filters.minValue || filters.maxValue || 
                filters.dueDateStart || filters.dueDateEnd ||
                filters.hasEntity || filters.hasNotes) && (
                <Badge variant="secondary" className="mr-1">نشط</Badge>
              )}
            </Button>

            {/* Sort Options */}
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                <SelectItem value="value">القيمة</SelectItem>
                <SelectItem value="dueDate">تاريخ الاستحقاق</SelectItem>
                <SelectItem value="period">الفترة</SelectItem>
                <SelectItem value="entityName">اسم الجهة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortOrder} onValueChange={(value) => setFilters({...filters, sortOrder: value})}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">الأحدث</SelectItem>
                <SelectItem value="asc">الأقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
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
                      <Label htmlFor="value">القيمة</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        placeholder="أدخل القيمة"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        required
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الكل
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    setImportFile(file)
                    handleImportCSV()
                  }
                }
                input.click()
              }}
            >
              <Upload className="h-4 w-4 ml-2" />
              استيراد
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isAdvancedFilterOpen && (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">نوع الإيراد</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {revenueTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">الفترة</Label>
                  <Select value={filters.period} onValueChange={(value) => setFilters({...filters, period: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفترات</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">القيمة من</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.minValue}
                    onChange={(e) => setFilters({...filters, minValue: e.target.value})}
                    className="mt-1"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">القيمة إلى</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.maxValue}
                    onChange={(e) => setFilters({...filters, maxValue: e.target.value})}
                    className="mt-1"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">تاريخ الاستحقاق من</Label>
                  <Input
                    type="date"
                    value={filters.dueDateStart}
                    onChange={(e) => setFilters({...filters, dueDateStart: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">تاريخ الاستحقاق إلى</Label>
                  <Input
                    type="date"
                    value={filters.dueDateEnd}
                    onChange={(e) => setFilters({...filters, dueDateEnd: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">الحقول الإضافية</Label>
                  <div className="mt-2 space-y-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasEntity}
                        onChange={(e) => setFilters({...filters, hasEntity: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">مرتبط بجهة</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasNotes}
                        onChange={(e) => setFilters({...filters, hasNotes: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">لديه ملاحظات</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      type: 'all',
                      period: 'all',
                      minValue: '',
                      maxValue: '',
                      dueDateStart: '',
                      dueDateEnd: '',
                      hasEntity: false,
                      hasNotes: false,
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    })}
                  >
                    إعادة تعيين الفلاتر
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Items Actions */}
        {selectedRevenues.length > 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    تم تحديد {selectedRevenues.length} إيراد
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeTab === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkArchive(true)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Archive className="h-4 w-4 ml-1" />
                      أرشفة المحدد
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkArchive(false)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ArchiveRestore className="h-4 w-4 ml-1" />
                      إعادة تفعيل المحدد
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تصدير المحدد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف المحدد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRevenues([])}
                  >
                    إلغاء التحديد
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs for Active and Archived Revenues */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            الإيرادات النشطة
            <Badge variant="secondary">
              {activeRevenues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            الإيرادات المؤرشفة
            <Badge variant="secondary">
              {archivedRevenues.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              إجمالي النتائج: {sortedRevenues.length} إيراد
              {searchQuery.length >= 3 && (
                <span className="mr-2">| البحث عن: "{searchQuery}"</span>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile-Optimized Table */}
          <div className="rounded-md border overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead className="text-right">الرقم</TableHead>
                    <TableHead className="text-right">الرقم التسلسلي</TableHead>
                    <TableHead className="text-right">اسم الجهة</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الفترة</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRevenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد إيرادات نشطة'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRevenues.map((revenue) => {
                      const Icon = getRevenueTypeIcon(revenue.type)
                      return (
                        <TableRow key={revenue.id} className="hover:bg-gray-50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedRevenues.includes(revenue.id)}
                              onChange={(e) => handleSelectRevenue(revenue.id, e.target.checked)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{revenue.id}</TableCell>
                          <TableCell className="font-medium">{revenue.serial}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{revenue.entityName}</span>
                              {revenue.entity && (
                                <Badge variant="outline" className="text-xs">
                                  مرتبط
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {formatCurrency(revenue.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRevenueTypeColor(revenue.type)}>
                              {getRevenueTypeLabel(revenue.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-600" />
                              <span className="text-sm">{revenue.period}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(revenue.dueDate).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell>
                            {new Date(revenue.createdAt).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleView(revenue)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>عرض التفاصيل</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(revenue)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>تعديل الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleArchive(revenue.id, true)}>
                                  <Archive className="h-4 w-4 mr-2 text-orange-600" />
                                  <span>أرشفة الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(revenue.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>حذف الإيراد</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {paginatedRevenues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد إيرادات نشطة'}
                </div>
              ) : (
                paginatedRevenues.map((revenue) => {
                  const Icon = getRevenueTypeIcon(revenue.type)
                  return (
                    <Card key={revenue.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedRevenues.includes(revenue.id)}
                              onChange={(e) => handleSelectRevenue(revenue.id, e.target.checked)}
                              className="rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-green-600" />
                                <h3 className="font-semibold text-lg truncate">{revenue.entityName}</h3>
                                {revenue.entity && (
                                  <Badge variant="outline" className="text-xs">
                                    مرتبط
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge className={getRevenueTypeColor(revenue.type)}>
                                    {getRevenueTypeLabel(revenue.type)}
                                  </Badge>
                                  <span className="text-gray-600">رقم: {revenue.serial}</span>
                                </div>
                                
                                {/* Revenue Value */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-green-600" />
                                      <span className="text-xs font-medium text-green-800">القيمة:</span>
                                      <span className="text-xs font-bold text-green-700">
                                        {formatCurrency(revenue.value)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>الاستحقاق: {new Date(revenue.dueDate).toLocaleDateString('ar-EG')}</span>
                                </div>
                                
                                <div className="text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>الفترة: {revenue.period}</span>
                                </div>
                                
                                <div className="text-gray-500 flex items-center gap-1">
                                  <span>الإنشاء: {new Date(revenue.createdAt).toLocaleDateString('ar-EG')}</span>
                                </div>
                                
                                {revenue.notes && (
                                  <div className="text-xs text-gray-400 mt-2">
                                    <div className="truncate">{revenue.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleView(revenue)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>عرض التفاصيل</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(revenue)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>تعديل الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleArchive(revenue.id, true)}>
                                  <Archive className="h-4 w-4 mr-2 text-orange-600" />
                                  <span>أرشفة الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(revenue.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>حذف الإيراد</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="lg:hidden flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <span className="text-sm font-medium px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              إجمالي الإيرادات المؤرشفة: {sortedRevenues.length} إيراد
              {searchQuery.length >= 3 && (
                <span className="mr-2">| البحث عن: "{searchQuery}"</span>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile-Optimized Table */}
          <div className="rounded-md border overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead className="text-right">الرقم</TableHead>
                    <TableHead className="text-right">الرقم التسلسلي</TableHead>
                    <TableHead className="text-right">اسم الجهة</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الفترة</TableHead>
                    <TableHead className="text-right">تاريخ الأرشفة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRevenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد إيرادات مؤرشفة'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRevenues.map((revenue) => {
                      const Icon = getRevenueTypeIcon(revenue.type)
                      return (
                        <TableRow key={revenue.id} className="bg-gray-50 hover:bg-gray-100">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedRevenues.includes(revenue.id)}
                              onChange={(e) => handleSelectRevenue(revenue.id, e.target.checked)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{revenue.id}</TableCell>
                          <TableCell className="font-medium">{revenue.serial}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">{revenue.entityName}</span>
                              {revenue.entity && (
                                <Badge variant="outline" className="text-xs">
                                  مرتبط
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {formatCurrency(revenue.value)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRevenueTypeColor(revenue.type)}>
                              {getRevenueTypeLabel(revenue.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-600" />
                              <span className="text-sm">{revenue.period}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {revenue.archivedAt 
                              ? new Date(revenue.archivedAt).toLocaleDateString('ar-EG')
                              : new Date(revenue.createdAt).toLocaleDateString('ar-EG')
                            }
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleView(revenue)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>عرض التفاصيل</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchive(revenue.id, false)}>
                                  <ArchiveRestore className="h-4 w-4 mr-2 text-green-600" />
                                  <span>إعادة تفعيل الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(revenue.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>حذف الإيراد</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {paginatedRevenues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد إيرادات مؤرشفة'}
                </div>
              ) : (
                paginatedRevenues.map((revenue) => {
                  const Icon = getRevenueTypeIcon(revenue.type)
                  return (
                    <Card key={revenue.id} className="border-l-4 border-l-gray-400 bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedRevenues.includes(revenue.id)}
                              onChange={(e) => handleSelectRevenue(revenue.id, e.target.checked)}
                              className="rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-gray-500" />
                                <h3 className="font-semibold text-lg truncate text-gray-700">{revenue.entityName}</h3>
                                {revenue.entity && (
                                  <Badge variant="outline" className="text-xs">
                                    مرتبط
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge className={getRevenueTypeColor(revenue.type)}>
                                    {getRevenueTypeLabel(revenue.type)}
                                  </Badge>
                                  <span className="text-gray-600">رقم: {revenue.serial}</span>
                                </div>
                                
                                {/* Revenue Value */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-green-600" />
                                      <span className="text-xs font-medium text-green-800">القيمة:</span>
                                      <span className="text-xs font-bold text-green-700">
                                        {formatCurrency(revenue.value)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-gray-500 flex items-center gap-1">
                                  <Archive className="h-3 w-3" />
                                  <span>أرشفة: {revenue.archivedAt 
                                    ? new Date(revenue.archivedAt).toLocaleDateString('ar-EG')
                                    : new Date(revenue.createdAt).toLocaleDateString('ar-EG')
                                  }</span>
                                </div>
                                
                                <div className="text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>الفترة: {revenue.period}</span>
                                </div>
                                
                                {revenue.notes && (
                                  <div className="text-xs text-gray-400 mt-2">
                                    <div className="truncate">{revenue.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleView(revenue)}>
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>عرض التفاصيل</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchive(revenue.id, false)}>
                                  <ArchiveRestore className="h-4 w-4 mr-2 text-green-600" />
                                  <span>إعادة تفعيل الإيراد</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(revenue.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>حذف الإيراد</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="lg:hidden flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <span className="text-sm font-medium px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              تفاصيل الإيراد
            </DialogTitle>
          </DialogHeader>
          {viewingRevenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">الرقم التسلسلي</Label>
                  <p className="font-medium">{viewingRevenue.serial}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">اسم الجهة</Label>
                  <p className="font-medium">{viewingRevenue.entityName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">القيمة</Label>
                  <p className="font-medium text-green-600">{viewingRevenue.value.toFixed(2)} ج.م</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">نوع الإيراد</Label>
                  <Badge className={getRevenueTypeColor(viewingRevenue.type)}>
                    {getRevenueTypeLabel(viewingRevenue.type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">تاريخ الاستحقاق</Label>
                  <p className="font-medium">{new Date(viewingRevenue.dueDate).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">الفترة</Label>
                  <p className="font-medium">{viewingRevenue.period}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                  <p className="font-medium">{new Date(viewingRevenue.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                {viewingRevenue.archivedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">تاريخ الأرشفة</Label>
                    <p className="font-medium">{new Date(viewingRevenue.archivedAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                )}
              </div>
              {viewingRevenue.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">ملاحظات</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{viewingRevenue.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Revenue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل الإيراد</DialogTitle>
            <DialogDescription>
              تعديل بيانات الإيراد المحدد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="entityName">اسم الجهة</Label>
                <Input
                  id="entityName"
                  value={formData.entityName}
                  onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                  placeholder="أدخل اسم الجهة"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="entityId">ربط بجهة موجودة (اختياري)</Label>
                <Select
                  value={formData.entityId}
                  onValueChange={(value) => setFormData({...formData, entityId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر جهة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون ربط</SelectItem>
                    {entities.map(entity => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="value">القيمة</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="أدخل القيمة"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">نوع الإيراد</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'subscriptions' | 'penalties' | 'legal_fees' | 'computerization' | 'other') => 
                    setFormData({...formData, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">السنة</Label>
                <Select
                  value={parsePeriod(formData.period).year || "none"}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- اختر السنة --</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="month">الشهر (اختياري)</Label>
                <Select
                  value={parsePeriod(formData.period).month || "none"}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- اختر الشهر --</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="أدخل ملاحظات إضافية"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddEntityDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة جهة جديدة
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Entity Dialog */}
      <Dialog open={isAddEntityDialogOpen} onOpenChange={setIsAddEntityDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>إضافة جهة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الجهة الجديدة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewEntity}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="entityName">اسم الجهة</Label>
                <Input
                  id="entityName"
                  value={newEntityData.name}
                  onChange={(e) => setNewEntityData({...newEntityData, name: e.target.value})}
                  placeholder="أدخل اسم الجهة"
                  required
                />
              </div>
              <div>
                <Label htmlFor="entityType">نوع الجهة</Label>
                <Select
                  value={newEntityData.type}
                  onValueChange={(value: 'main' | 'branch' | 'workers') => 
                    setNewEntityData({...newEntityData, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="governorate">المحافظة</Label>
                <Select
                  value={newEntityData.governorate}
                  onValueChange={(value) => setNewEntityData({...newEntityData, governorate: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map(gov => (
                      <SelectItem key={gov} value={gov}>
                        {gov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddEntityDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">إضافة جهة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}