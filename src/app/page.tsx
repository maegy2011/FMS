'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FixedSelect, FixedSelectItem } from '@/components/ui/fixed-select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Captcha } from '@/components/ui/captcha'
import { Trash2, Edit, Plus, Search, Building2, Users, Home, Scale, FileText, Gavel, Archive, ArchiveRestore, Eye, EyeOff, Download, Upload, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, MoreHorizontal, Calendar } from 'lucide-react'
import { formatCurrency, convertToArabicNumerals, showSwal } from '@/lib/utils'

interface Entity {
  id: number
  name: string
  type: 'main' | 'branch' | 'workers'
  governorate: string
  isArchived: boolean
  archivedAt?: string
  createdAt: string
  updatedAt: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  totalRevenue?: number
  revenuesCount?: number
  subtype?: string
}

const entityTypes = [
  { value: 'main', label: 'رئيسية', icon: Building2, color: 'bg-purple-100 text-purple-800' },
  { value: 'branch', label: 'فرعية', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { value: 'workers', label: 'عاملين', icon: Users, color: 'bg-green-100 text-green-800' }
]

const mainEntitySubtypes = [
  { value: 'diwan', label: 'الديوان' },
  { value: 'registry', label: 'الشهر العقاري' },
  { value: 'courts', label: 'المحاكم' },
  { value: 'prosecution', label: 'النيابة' }
]

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية', 'البحيرة',
  'الغربية', 'كفر الشيخ', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'شمال سيناء',
  'جنوب سيناء', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'مطروح', 'قنا', 'سوهاج', 'أسيوط',
  'الفيوم', 'بني سويف', 'المنيا'
]

export default function EntitiesManagement() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterGovernorate, setFilterGovernorate] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string>('active')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [captchaValid, setCaptchaValid] = useState(false)
  const [captchaReset, setCaptchaReset] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'main' as 'main' | 'branch' | 'workers',
    subtype: '',
    governorate: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingEntity, setViewingEntity] = useState<Entity | null>(null)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    type: 'all',
    governorate: 'all',
    hasDescription: false,
    hasPhone: false,
    hasEmail: false,
    hasWebsite: false,
    minTotalRevenue: '',
    maxTotalRevenue: '',
    minRevenuesCount: '',
    maxRevenuesCount: '',
    createdAfter: '',
    createdBefore: '',
    revenueStartDate: '',
    revenueEndDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [selectedEntities, setSelectedEntities] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const itemsPerPage = 5

  // Fetch entities
  const fetchEntities = async () => {
    try {
      let url = '/api/entities'
      
      // Add date range parameters if active
      if (filters.revenueStartDate || filters.revenueEndDate) {
        const params = new URLSearchParams()
        if (filters.revenueStartDate) params.append('startDate', filters.revenueStartDate)
        if (filters.revenueEndDate) params.append('endDate', filters.revenueEndDate)
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEntities(data)
      } else {
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في جلب البيانات',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      showSwal({
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
    fetchEntities()
  }, [filters.revenueStartDate, filters.revenueEndDate])

  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, addNew: boolean = false) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.governorate || (formData.type === 'main' && !formData.subtype)) {
      showSwal({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول المطلوبة',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b',
        timer: 3000,
        timerProgressBar: true
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          console.log('Swal closed successfully')
        }
      })
      return
    }

    // Show loading state
    showSwal({
      title: 'جاري الحفظ...',
      text: 'يرجى الانتظار',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      const url = editingEntity ? `/api/entities/${editingEntity.id}` : '/api/entities'
      const method = editingEntity ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showSwal({
          icon: 'success',
          title: 'نجاح',
          text: editingEntity ? 'تم تحديث الجهة بنجاح' : 'تم إضافة الجهة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
        
        if (addNew) {
          // Reset form for new entry
          setFormData({
            name: '',
            type: 'main',
            subtype: '',
            governorate: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            website: ''
          })
        } else {
          // Close dialog
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingEntity(null)
          setFormData({
            name: '',
            type: 'main',
            subtype: '',
            governorate: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            website: ''
          })
        }
      } else {
        const errorData = await response.json()
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: errorData.error || 'فشل في حفظ البيانات',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      showSwal({
        icon: 'error',
        title: 'خطأ',
        text: error instanceof Error ? error.message : 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmDelete } = await showSwal({
      title: 'تأكيد الحذف',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من حذف هذه الجهة؟ لا يمكن التراجع عن هذا الإجراء!</p>
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
          
          // Create React component manually
          const captchaElement = document.createElement('div')
          captchaDiv.appendChild(captchaElement)
          
          // Simple captcha implementation
          let captchaText = ''
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
          for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          
          captchaElement.innerHTML = `
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

    // Show loading state
    showSwal({
      title: 'جاري الحذف...',
      text: 'يرجى الانتظار',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      const response = await fetch(`/api/entities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.message.includes('archived')) {
          // Entity was archived instead of deleted
          showSwal({
            icon: 'warning',
            title: 'تم الأرشفة',
            html: `
              <div class="text-right">
                <p>تم أرشفة الجهة بنجاح بدلاً من حذفها لأنها مرتبطة بـ ${result.revenuesCount} إيرادات مسجلة.</p>
                <p class="text-sm text-gray-600 mt-2">يمكن إعادة تفعيل الجهة من قائمة الأرشيف في أي وقت.</p>
              </div>
            `,
            confirmButtonText: 'موافق',
            confirmButtonColor: '#f59e0b'
          })
        } else {
          // Entity was deleted successfully
          showSwal({
            icon: 'success',
            title: 'نجاح',
            text: 'تم حذف الجهة بنجاح',
            confirmButtonText: 'موافق',
            confirmButtonColor: '#16a34a'
          })
        }
        fetchEntities()
      } else {
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حذف الجهة',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      showSwal({
        icon: 'error',
        title: 'خطأ',
        text: error instanceof Error ? error.message : 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Handle view
  const handleView = (entity: Entity) => {
    setViewingEntity(entity)
    setIsViewDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity)
    setFormData({
      name: entity.name,
      type: entity.type,
      subtype: entity.subtype || '',
      governorate: entity.governorate,
      description: entity.description || '',
      address: entity.address || '',
      phone: entity.phone || '',
      email: entity.email || '',
      website: entity.website || ''
    })
    setIsEditDialogOpen(true)
  }

  // Handle archive/unarchive
  const handleArchive = async (id: number, archive: boolean) => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmArchive } = await showSwal({
      title: archive ? 'تأكيد الأرشفة' : 'تأكيد إعادة التفعيل',
      html: `
        <div class="text-right">
          <p>${archive ? 'هل أنت متأكد من أرشفة هذه الجهة؟ يمكن إعادة تفعيلها لاحقاً.' : 'هل أنت متأكد من إعادة تفعيل هذه الجهة؟'}</p>
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

    // Show loading state
    showSwal({
      title: archive ? 'جاري الأرشفة...' : 'جاري إعادة التفعيل...',
      text: 'يرجى الانتظار',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      const response = await fetch(`/api/entities/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archive }),
      })

      if (response.ok) {
        showSwal({
          icon: 'success',
          title: 'نجاح',
          text: archive ? 'تم أرشفة الجهة بنجاح' : 'تم إعادة تفعيل الجهة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
      } else {
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: archive ? 'فشل في أرشفة الجهة' : 'فشل في إعادة تفعيل الجهة',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      console.error('Archive error:', error)
      showSwal({
        icon: 'error',
        title: 'خطأ',
        text: error instanceof Error ? error.message : 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Filter and search entities
  const filteredAndSearchedEntities = entities.filter(entity => {
    const matchesTab = activeTab === 'active' ? !entity.isArchived : entity.isArchived
    
    // Quick search (minimum 3 characters)
    const matchesSearch = searchQuery.length >= 3 ? 
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.governorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entity.description && entity.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entity.address && entity.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entity.phone && entity.phone.includes(searchQuery)) ||
      (entity.email && entity.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entity.website && entity.website.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entity.totalRevenue && entity.totalRevenue.toString().includes(searchQuery))
      : true
    
    const matchesType = filterType === 'all' || entity.type === filterType
    const matchesGovernorate = filterGovernorate === 'all' || entity.governorate === filterGovernorate
    
    // Advanced filters
    const matchesDescription = !filters.hasDescription || !!entity.description
    const matchesPhone = !filters.hasPhone || !!entity.phone
    const matchesEmail = !filters.hasEmail || !!entity.email
    const matchesWebsite = !filters.hasWebsite || !!entity.website
    
    const matchesMinRevenue = !filters.minTotalRevenue || (entity.totalRevenue || 0) >= parseFloat(filters.minTotalRevenue)
    const matchesMaxRevenue = !filters.maxTotalRevenue || (entity.totalRevenue || 0) <= parseFloat(filters.maxTotalRevenue)
    
    const matchesMinCount = !filters.minRevenuesCount || (entity.revenuesCount || 0) >= parseInt(filters.minRevenuesCount)
    const matchesMaxCount = !filters.maxRevenuesCount || (entity.revenuesCount || 0) <= parseInt(filters.maxRevenuesCount)
    
    const matchesCreatedAfter = !filters.createdAfter || new Date(entity.createdAt) >= new Date(filters.createdAfter)
    const matchesCreatedBefore = !filters.createdBefore || new Date(entity.createdAt) <= new Date(filters.createdBefore)
    
    return matchesTab && matchesSearch && matchesType && matchesGovernorate &&
           matchesDescription && matchesPhone && matchesEmail && matchesWebsite &&
           matchesMinRevenue && matchesMaxRevenue && matchesMinCount && matchesMaxCount &&
           matchesCreatedAfter && matchesCreatedBefore
  })

  // Sort entities
  const sortedEntities = [...filteredAndSearchedEntities].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (filters.sortBy) {
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      case 'governorate':
        aValue = a.governorate
        bValue = b.governorate
        break
      case 'totalRevenue':
        aValue = a.totalRevenue || 0
        bValue = b.totalRevenue || 0
        break
      case 'revenuesCount':
        aValue = a.revenuesCount || 0
        bValue = b.revenuesCount || 0
        break
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedEntities.length / itemsPerPage)
  const paginatedEntities = sortedEntities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle export
  const handleExport = async () => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmExport } = await showSwal({
      title: 'تأكيد التصدير',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من تصدير بيانات الجهات؟</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'نعم، صدر',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#16a34a',
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

    if (!confirmExport) return

    try {
      // Show loading state
      showSwal({
        title: 'جاري التصدير...',
        text: 'يرجى الانتظار',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      const response = await fetch('/api/entities/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `entities_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        showSwal({
          icon: 'success',
          title: 'نجاح',
          text: 'تم تصدير البيانات بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
      } else {
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في تصدير البيانات',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      showSwal({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      showSwal({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى اختيار ملف للإستيراد',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmImport } = await showSwal({
      title: 'تأكيد الاستيراد',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من استيراد الملف المحدد؟ سيتم إضافة البيانات إلى النظام.</p>
          <div id="captcha-container" class="mt-4"></div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، استورد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#f59e0b',
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

    if (!confirmImport) return

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      // Show loading state
      showSwal({
        title: 'جاري الاستيراد...',
        text: 'يرجى الانتظار',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      const response = await fetch('/api/entities/import', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        showSwal({
          icon: 'success',
          title: 'نجاح',
          text: 'تم استيراد البيانات بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
        setImportFile(null)
      } else {
        showSwal({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في استيراد البيانات',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      showSwal({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ في الاتصال',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  // Calculate statistics
  const activeEntities = entities.filter(e => !e.isArchived)
  const archivedEntities = entities.filter(e => e.isArchived)
  const totalRevenue = entities.reduce((sum, entity) => sum + (entity.totalRevenue || 0), 0)
  const mainEntities = activeEntities.filter(e => e.type === 'main')
  const branchEntities = activeEntities.filter(e => e.type === 'branch')
  const workersEntities = activeEntities.filter(e => e.type === 'workers')

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            إدارة الجهات
          </CardTitle>
          <CardDescription>
            إدارة الجهات الرئيسية والفرعية والعاملين
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
                <Upload className="h-4 w-4 ml-2" />
                استيراد
              </Button>
              <Button onClick={handleExport} variant="outline" disabled={entities.length === 0}>
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة جهة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجهات</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertToArabicNumerals(entities.length.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {convertToArabicNumerals(activeEntities.length.toString())} نشط، {convertToArabicNumerals(archivedEntities.length.toString())} مؤرشف
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات الإجمالية</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              من {convertToArabicNumerals(activeEntities.length.toString())} جهة نشطة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجهات الرئيسية</CardTitle>
            <Scale className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertToArabicNumerals(mainEntities.length.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {convertToArabicNumerals(mainEntities.reduce((sum, e) => sum + (e.revenuesCount || 0), 0).toString())} إيرادة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجهات الفرعية</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertToArabicNumerals(branchEntities.length.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {convertToArabicNumerals(branchEntities.reduce((sum, e) => sum + (e.revenuesCount || 0), 0).toString())} إيرادة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجهات العاملين</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertToArabicNumerals(workersEntities.length.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {convertToArabicNumerals(workersEntities.reduce((sum, e) => sum + (e.revenuesCount || 0), 0).toString())} إيرادة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
          <CardDescription>ابحث وصفِ الجهات حسب المعايير المختلفة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث (3 أحرف على الأقل)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="h-4 w-4 ml-2" />
              تصفية متقدمة
            </Button>
          </div>

          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg space-y-4 md:space-y-0">
              <div>
                <Label htmlFor="filterType">النوع</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 ml-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filterGovernorate">المحافظة</Label>
                <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
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
                <Label htmlFor="revenueStartDate">من تاريخ</Label>
                <Input
                  type="date"
                  value={filters.revenueStartDate}
                  onChange={(e) => setFilters({...filters, revenueStartDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="revenueEndDate">إلى تاريخ</Label>
                <Input
                  type="date"
                  value={filters.revenueEndDate}
                  onChange={(e) => setFilters({...filters, revenueEndDate: e.target.value})}
                />
              </div>

              <div>
                <Label>الحقول المتوفرة</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={filters.hasDescription}
                      onChange={(e) => setFilters({...filters, hasDescription: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">يحتوي على وصف</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={filters.hasPhone}
                      onChange={(e) => setFilters({...filters, hasPhone: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">يحتوي على هاتف</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={filters.hasEmail}
                      onChange={(e) => setFilters({...filters, hasEmail: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">يحتوي على بريد إلكتروني</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={filters.hasWebsite}
                      onChange={(e) => setFilters({...filters, hasWebsite: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">يحتوي على موقع إلكتروني</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="minTotalRevenue">الإيرادات من</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minTotalRevenue}
                  onChange={(e) => setFilters({...filters, minTotalRevenue: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="maxTotalRevenue">الإيرادات إلى</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxTotalRevenue}
                  onChange={(e) => setFilters({...filters, maxTotalRevenue: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="minRevenuesCount">عدد الإيرادات من</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minRevenuesCount}
                  onChange={(e) => setFilters({...filters, minRevenuesCount: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="maxRevenuesCount">عدد الإيرادات إلى</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxRevenuesCount}
                  onChange={(e) => setFilters({...filters, maxRevenuesCount: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="createdAfter">أنشئ بعد تاريخ</Label>
                <Input
                  type="date"
                  value={filters.createdAfter}
                  onChange={(e) => setFilters({...filters, createdAfter: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="createdBefore">أنشئ قبل تاريخ</Label>
                <Input
                  type="date"
                  value={filters.createdBefore}
                  onChange={(e) => setFilters({...filters, createdBefore: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="sortBy">الترتيب حسب</Label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="governorate">المحافظة</SelectItem>
                    <SelectItem value="totalRevenue">الإيرادات</SelectItem>
                    <SelectItem value="revenuesCount">عدد الإيرادات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">طريقة الترتيب</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => setFilters({...filters, sortOrder: value})}>
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
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">الجهات النشطة ({convertToArabicNumerals(activeEntities.length.toString())})</TabsTrigger>
          <TabsTrigger value="archived">الجهات المؤرشفة ({convertToArabicNumerals(archivedEntities.length.toString())})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الجهات النشطة</CardTitle>
              <CardDescription>قائمة بجميع الجهات النشطة في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">النوع الفرعي</TableHead>
                        <TableHead className="text-right">المحافظة</TableHead>
                        <TableHead className="text-right">الإيرادات</TableHead>
                        <TableHead className="text-right">عدد الإيرادات</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntities.map((entity) => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">{entity.name}</TableCell>
                          <TableCell>
                            {(() => {
                              const entityType = entityTypes.find(t => t.value === entity.type)
                              return entityType ? (
                                <Badge className={entityType.color}>
                                  <entityType.icon className="h-3 w-3 ml-1" />
                                  {entityType.label}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{entity.type}</Badge>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            {entity.type === 'main' && entity.subtype ? (
                              <Badge variant="secondary">
                                {mainEntitySubtypes.find(st => st.value === entity.subtype)?.label || entity.subtype}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{entity.governorate}</TableCell>
                          <TableCell>{formatCurrency(entity.totalRevenue || 0)}</TableCell>
                          <TableCell>{convertToArabicNumerals((entity.revenuesCount || 0).toString())}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(entity)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(entity)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleArchive(entity.id, true)}>
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(entity.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        عرض {convertToArabicNumerals(((currentPage - 1) * itemsPerPage + 1).toString())} إلى {convertToArabicNumerals((Math.min(currentPage * itemsPerPage, sortedEntities.length)).toString())} من {convertToArabicNumerals(sortedEntities.length.toString())} جهة
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronRight className="h-4 w-4 ml-2" />
                          السابق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          التالي
                          <ChevronLeft className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الجهات المؤرشفة</CardTitle>
              <CardDescription>قائمة بجميع الجهات المؤرشفة في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">النوع الفرعي</TableHead>
                        <TableHead className="text-right">المحافظة</TableHead>
                        <TableHead className="text-right">تاريخ الأرشفة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntities.map((entity) => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">{entity.name}</TableCell>
                          <TableCell>
                            {(() => {
                              const entityType = entityTypes.find(t => t.value === entity.type)
                              return entityType ? (
                                <Badge className={entityType.color}>
                                  <entityType.icon className="h-3 w-3 ml-1" />
                                  {entityType.label}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{entity.type}</Badge>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            {entity.type === 'main' && entity.subtype ? (
                              <Badge variant="secondary">
                                {mainEntitySubtypes.find(st => st.value === entity.subtype)?.label || entity.subtype}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{entity.governorate}</TableCell>
                          <TableCell>{entity.archivedAt ? new Date(entity.archivedAt).toLocaleDateString('ar-EG') : '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(entity)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleArchive(entity.id, false)}>
                                <ArchiveRestore className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(entity.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        عرض {convertToArabicNumerals(((currentPage - 1) * itemsPerPage + 1).toString())} إلى {convertToArabicNumerals((Math.min(currentPage * itemsPerPage, sortedEntities.length)).toString())} من {convertToArabicNumerals(sortedEntities.length.toString())} جهة
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronRight className="h-4 w-4 ml-2" />
                          السابق
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          التالي
                          <ChevronLeft className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Entity Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة جهة جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات الجهة الجديدة في النموذج أدناه</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">النوع *</Label>
                <FixedSelect value={formData.type} onValueChange={(value: 'main' | 'branch' | 'workers') => setFormData({...formData, type: value, subtype: ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <FixedSelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 ml-2" />
                          {type.label}
                        </div>
                      </FixedSelectItem>
                    ))}
                  </SelectContent>
                </FixedSelect>
              </div>
              
              {formData.type === 'main' && (
                <div>
                  <Label htmlFor="subtype">النوع الفرعي *</Label>
                  <FixedSelect value={formData.subtype} onValueChange={(value) => setFormData({...formData, subtype: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع الفرعي" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainEntitySubtypes.map(subtype => (
                        <FixedSelectItem key={subtype.value} value={subtype.value}>{subtype.label}</FixedSelectItem>
                      ))}
                    </SelectContent>
                  </FixedSelect>
                </div>
              )}
              
              <div>
                <Label htmlFor="governorate">المحافظة *</Label>
                <FixedSelect value={formData.governorate} onValueChange={(value) => setFormData({...formData, governorate: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map(gov => (
                      <FixedSelectItem key={gov} value={gov}>{gov}</FixedSelectItem>
                    ))}
                  </SelectContent>
                </FixedSelect>
              </div>
              
              <div>
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" variant="outline" onClick={(e) => {
                e.preventDefault()
                handleSubmit(e, true)
              }}>
                حفظ وإضافة جديد
              </Button>
              <Button type="submit">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Entity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل جهة</DialogTitle>
            <DialogDescription>عدل بيانات الجهة في النموذج أدناه</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">الاسم *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">النوع *</Label>
                <FixedSelect value={formData.type} onValueChange={(value: 'main' | 'branch' | 'workers') => setFormData({...formData, type: value, subtype: ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <FixedSelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 ml-2" />
                          {type.label}
                        </div>
                      </FixedSelectItem>
                    ))}
                  </SelectContent>
                </FixedSelect>
              </div>
              
              {formData.type === 'main' && (
                <div>
                  <Label htmlFor="edit-subtype">النوع الفرعي *</Label>
                  <FixedSelect value={formData.subtype} onValueChange={(value) => setFormData({...formData, subtype: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع الفرعي" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainEntitySubtypes.map(subtype => (
                        <FixedSelectItem key={subtype.value} value={subtype.value}>{subtype.label}</FixedSelectItem>
                      ))}
                    </SelectContent>
                  </FixedSelect>
                </div>
              )}
              
              <div>
                <Label htmlFor="edit-governorate">المحافظة *</Label>
                <FixedSelect value={formData.governorate} onValueChange={(value) => setFormData({...formData, governorate: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map(gov => (
                      <FixedSelectItem key={gov} value={gov}>{gov}</FixedSelectItem>
                    ))}
                  </SelectContent>
                </FixedSelect>
              </div>
              
              <div>
                <Label htmlFor="edit-phone">الهاتف</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-address">العنوان</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-website">الموقع الإلكتروني</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                تحديث
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Entity Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الجهة</DialogTitle>
            <DialogDescription>عرض بيانات الجهة بالتفصيل</DialogDescription>
          </DialogHeader>
          {viewingEntity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">الاسم</Label>
                <p>{viewingEntity.name}</p>
              </div>
              
              <div>
                <Label className="font-semibold">النوع</Label>
                <p>
                  {(() => {
                    const entityType = entityTypes.find(t => t.value === viewingEntity.type)
                    return entityType ? (
                      <Badge className={entityType.color}>
                        <entityType.icon className="h-3 w-3 ml-1" />
                        {entityType.label}
                      </Badge>
                    ) : (
                      viewingEntity.type
                    )
                  })()}
                </p>
              </div>
              
              {viewingEntity.type === 'main' && viewingEntity.subtype && (
                <div>
                  <Label className="font-semibold">النوع الفرعي</Label>
                  <p>{mainEntitySubtypes.find(st => st.value === viewingEntity.subtype)?.label || viewingEntity.subtype}</p>
                </div>
              )}
              
              <div>
                <Label className="font-semibold">المحافظة</Label>
                <p>{viewingEntity.governorate}</p>
              </div>
              
              <div>
                <Label className="font-semibold">الحالة</Label>
                <p>{viewingEntity.isArchived ? 'مؤرشف' : 'نشط'}</p>
              </div>
              
              <div>
                <Label className="font-semibold">الهاتف</Label>
                <p>{viewingEntity.phone || '-'}</p>
              </div>
              
              <div>
                <Label className="font-semibold">البريد الإلكتروني</Label>
                <p>{viewingEntity.email || '-'}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="font-semibold">الوصف</Label>
                <p>{viewingEntity.description || '-'}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="font-semibold">العنوان</Label>
                <p>{viewingEntity.address || '-'}</p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="font-semibold">الموقع الإلكتروني</Label>
                <p>{viewingEntity.website || '-'}</p>
              </div>
              
              <div>
                <Label className="font-semibold">تاريخ الإنشاء</Label>
                <p>{new Date(viewingEntity.createdAt).toLocaleDateString('ar-EG')}</p>
              </div>
              
              <div>
                <Label className="font-semibold">تاريخ التحديث</Label>
                <p>{new Date(viewingEntity.updatedAt).toLocaleDateString('ar-EG')}</p>
              </div>
              
              {viewingEntity.archivedAt && (
                <div>
                  <Label className="font-semibold">تاريخ الأرشفة</Label>
                  <p>{new Date(viewingEntity.archivedAt).toLocaleDateString('ar-EG')}</p>
                </div>
              )}
              
              <div>
                <Label className="font-semibold">إجمالي الإيرادات</Label>
                <p>{formatCurrency(viewingEntity.totalRevenue || 0)}</p>
              </div>
              
              <div>
                <Label className="font-semibold">عدد الإيرادات</Label>
                <p>{convertToArabicNumerals((viewingEntity.revenuesCount || 0).toString())}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Entities Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>استيراد الجهات</DialogTitle>
            <DialogDescription>اختر ملف CSV لاستيراد الجهات</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importFile">ملف CSV</Label>
              <Input
                id="importFile"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">ملاحظات:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>يجب أن يكون الملف بصيغة CSV</li>
                <li>يتضمن الأعمدة: name, type, governorate</li>
                <li>الحقول الاختيارية: description, address, phone, email, website, subtype</li>
                <li>النوع الرئيسي يتطلب حقل subtype</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              استيراد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}