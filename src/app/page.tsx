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
import { Trash2, Edit, Plus, Search, Building2, Users, Home, Scale, FileText, Gavel, Archive, ArchiveRestore, Eye, EyeOff, Download, Upload, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, MoreHorizontal } from 'lucide-react'

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
}

const entityTypes = [
  { value: 'main', label: 'رئيسية', icon: Building2 },
  { value: 'branch', label: 'فرعية', icon: Home },
  { value: 'workers', label: 'عاملين', icon: Users }
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
    createdAfter: '',
    createdBefore: '',
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
      const response = await fetch('/api/entities')
      if (response.ok) {
        const data = await response.json()
        setEntities(data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في جلب البيانات',
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
    fetchEntities()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.governorate) {
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
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: editingEntity ? 'تم تحديث الجهة بنجاح' : 'تم إضافة الجهة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingEntity(null)
        setFormData({ name: '', type: 'main', subtype: '', governorate: '', description: '', address: '', phone: '', email: '', website: '' })
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

    try {
      const response = await fetch(`/api/entities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: 'تم حذف الجهة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حذف الجهة',
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
      subtype: '',
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
    
    const { value: confirmArchive } = await Swal.fire({
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

    try {
      const response = await fetch(`/api/entities/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archive }),
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: archive ? 'تم أرشفة الجهة بنجاح' : 'تم إعادة تفعيل الجهة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: archive ? 'فشل في أرشفة الجهة' : 'فشل في إعادة تفعيل الجهة',
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
      entity.id.toString().includes(searchQuery)
      : true
    
    // Advanced filters
    const matchesType = filters.type === 'all' || entity.type === filters.type
    const matchesGovernorate = filters.governorate === 'all' || entity.governorate === filters.governorate
    const matchesDescription = !filters.hasDescription || entity.description
    const matchesPhone = !filters.hasPhone || entity.phone
    const matchesEmail = !filters.hasEmail || entity.email
    const matchesWebsite = !filters.hasWebsite || entity.website
    
    const matchesCreatedAfter = !filters.createdAfter || 
      new Date(entity.createdAt) >= new Date(filters.createdAfter)
    const matchesCreatedBefore = !filters.createdBefore || 
      new Date(entity.createdAt) <= new Date(filters.createdBefore)
    
    return matchesTab && matchesSearch && matchesType && matchesGovernorate &&
           matchesDescription && matchesPhone && matchesEmail && matchesWebsite &&
           matchesCreatedAfter && matchesCreatedBefore
  })

  // Sort entities
  const sortedEntities = [...filteredAndSearchedEntities].sort((a, b) => {
    let aValue: any = a[filters.sortBy as keyof Entity]
    let bValue: any = b[filters.sortBy as keyof Entity]
    
    if (aValue instanceof Date) aValue = aValue.getTime()
    if (bValue instanceof Date) bValue = bValue.getTime()
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedEntities.length / itemsPerPage)
  const paginatedEntities = sortedEntities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntities(paginatedEntities.map(e => e.id))
    } else {
      setSelectedEntities([])
    }
  }

  const handleSelectEntity = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedEntities([...selectedEntities, id])
    } else {
      setSelectedEntities(selectedEntities.filter(selectedId => selectedId !== id))
    }
  }

  const isAllSelected = paginatedEntities.length > 0 && 
    paginatedEntities.every(e => selectedEntities.includes(e.id))
  const isIndeterminate = selectedEntities.length > 0 && 
    selectedEntities.length < paginatedEntities.length

  // Bulk actions
  const handleBulkArchive = async (archive: boolean) => {
    if (selectedEntities.length === 0) return
    
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmAction } = await Swal.fire({
      title: archive ? 'تأكيد أرشفة المحدد' : 'تأكيد إعادة تفعيل المحدد',
      html: `
        <div class="text-right">
          <p>${archive ? `هل أنت متأكد من أرشفة ${selectedEntities.length} جهة؟` : `هل أنت متأكد من إعادة تفعيل ${selectedEntities.length} جهة؟`}</p>
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
      const promises = selectedEntities.map(id => 
        fetch(`/api/entities/${id}/archive`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archive })
        })
      )
      
      await Promise.all(promises)
      
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: archive ? 'تم أرشفة الجهات المحددة بنجاح' : 'تم إعادة تفعيل الجهات المحددة بنجاح',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
      
      fetchEntities()
      setSelectedEntities([])
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
    if (selectedEntities.length === 0) return
    
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmDelete } = await Swal.fire({
      title: 'تأكيد الحذف',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من حذف ${selectedEntities.length} جهة؟ لا يمكن التراجع عن هذا الإجراء!</p>
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
      const promises = selectedEntities.map(id => 
        fetch(`/api/entities/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      
      Swal.fire({
        icon: 'success',
        title: 'نجاح',
        text: 'تم حذف الجهات المحددة بنجاح',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a'
      })
      
      fetchEntities()
      setSelectedEntities([])
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

  const handleBulkExport = async () => {
    if (selectedEntities.length === 0) return
    
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmExport } = await Swal.fire({
      title: 'تصدير المحدد إلى CSV',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من تصدير ${selectedEntities.length} جهة محددة؟</p>
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
      const response = await fetch('/api/entities/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityIds: selectedEntities })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `selected_entities_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: 'تم تصدير الجهات المحددة بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
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

  // Handle export to CSV
  const handleExportCSV = async () => {
    setCaptchaReset(false)
    setCaptchaValid(false)
    
    const { value: confirmExport } = await Swal.fire({
      title: 'تصدير البيانات إلى CSV',
      html: `
        <div class="text-right">
          <p>هل أنت متأكد من تصدير البيانات المفلترة؟ سيتم تصدير ${sortedEntities.length} جهة.</p>
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
      const response = await fetch('/api/entities/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          entityIds: sortedEntities.map(e => e.id) 
        }),
      })

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

        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: 'تم تصدير البيانات بنجاح',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في تصدير البيانات',
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
          <p>هل أنت متأكد من استيراد البيانات من الملف المحدد؟ سيتم إضافة الجهات الجديدة إلى النظام.</p>
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
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/entities/import', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          html: `تم استيراد البيانات بنجاح<br>تم إضافة ${result.imported} جهة جديدة`,
          confirmButtonText: 'موافق',
          confirmButtonColor: '#16a34a'
        })
        fetchEntities()
        setImportFile(null)
      } else {
        const error = await response.json()
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: error.message || 'فشل في استيراد البيانات',
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

  // Get entity type icon
  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return Building2
      case 'branch': return Home
      case 'workers': return Users
      default: return Building2
    }
  }

  // Get entity type label
  const getEntityTypeLabel = (type: string) => {
    const entity = entityTypes.find(t => t.value === type)
    return entity?.label || type
  }

  // Get entity type color
  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800'
      case 'branch': return 'bg-green-100 text-green-800'
      case 'workers': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            إدارة الجهات
          </CardTitle>
          <CardDescription>
            نظام إدارة الجهات الحكومية والمؤسسات
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  الفلاتر المتقدمة
                  {(filters.type !== 'all' || filters.governorate !== 'all' || 
                    filters.hasDescription || filters.hasPhone || filters.hasEmail || 
                    filters.hasWebsite || filters.createdAfter || filters.createdBefore) && (
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
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="type">النوع</SelectItem>
                    <SelectItem value="governorate">المحافظة</SelectItem>
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
                      إضافة جهة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>إضافة جهة جديدة</DialogTitle>
                      <DialogDescription>
                        أدخل بيانات الجهة الجديدة
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">اسم الجهة</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="أدخل اسم الجهة"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">نوع الجهة</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value: 'main' | 'branch' | 'workers') => 
                              setFormData({ ...formData, type: value })
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
                        <div className="grid gap-2">
                          <Label htmlFor="governorate">المحافظة</Label>
                          <Select
                            value={formData.governorate}
                            onValueChange={(value) => setFormData({ ...formData, governorate: value })}
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
                        <div className="grid gap-2">
                          <Label htmlFor="description">الوصف (اختياري)</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="أدخل وصف الجهة"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="address">العنوان (اختياري)</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="أدخل العنوان"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">الهاتف (اختياري)</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="أدخل رقم الهاتف"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="أدخل البريد الإلكتروني"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="website">الموقع الإلكتروني (اختياري)</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="أدخل الموقع الإلكتروني"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">إضافة جهة</Button>
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
            {isFilterOpen && (
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">نوع الجهة</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          {entityTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">المحافظة</Label>
                      <Select value={filters.governorate} onValueChange={(value) => setFilters({...filters, governorate: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المحافظات</SelectItem>
                          {governorates.map(gov => (
                            <SelectItem key={gov} value={gov}>
                              {gov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">الحقول الإضافية</Label>
                      <div className="mt-2 space-y-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.hasDescription}
                            onChange={(e) => setFilters({...filters, hasDescription: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm">لديه وصف</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.hasPhone}
                            onChange={(e) => setFilters({...filters, hasPhone: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm">لديه هاتف</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.hasEmail}
                            onChange={(e) => setFilters({...filters, hasEmail: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm">لديه بريد إلكتروني</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.hasWebsite}
                            onChange={(e) => setFilters({...filters, hasWebsite: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm">لديه موقع إلكتروني</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">تاريخ الإنشاء من</Label>
                      <Input
                        type="date"
                        value={filters.createdAfter}
                        onChange={(e) => setFilters({...filters, createdAfter: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">تاريخ الإنشاء إلى</Label>
                      <Input
                        type="date"
                        value={filters.createdBefore}
                        onChange={(e) => setFilters({...filters, createdBefore: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({
                          type: 'all',
                          governorate: 'all',
                          hasDescription: false,
                          hasPhone: false,
                          hasEmail: false,
                          hasWebsite: false,
                          createdAfter: '',
                          createdBefore: '',
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
            {selectedEntities.length > 0 && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        تم تحديد {selectedEntities.length} جهة
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
                        onClick={handleBulkExport}
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
                        onClick={() => setSelectedEntities([])}
                      >
                        إلغاء التحديد
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs for Active and Archived Entities */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                الجهات النشطة
                <Badge variant="secondary">
                  {entities.filter(e => !e.isArchived).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                الجهات المؤرشفة
                <Badge variant="secondary">
                  {entities.filter(e => e.isArchived).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600">
                  إجمالي النتائج: {sortedEntities.length} جهة
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
                        <TableHead className="text-right">اسم الجهة</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">المحافظة</TableHead>
                        <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد جهات نشطة'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedEntities.map((entity) => {
                          const Icon = getEntityTypeIcon(entity.type)
                          return (
                            <TableRow key={entity.id} className="hover:bg-gray-50">
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedEntities.includes(entity.id)}
                                  onChange={(e) => handleSelectEntity(entity.id, e.target.checked)}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{entity.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{entity.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getEntityTypeColor(entity.type)}>
                                  {getEntityTypeLabel(entity.type)}
                                </Badge>
                              </TableCell>
                              <TableCell>{entity.governorate}</TableCell>
                              <TableCell>
                                {new Date(entity.createdAt).toLocaleDateString('ar-EG')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(entity)}
                                    className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(entity)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleArchive(entity.id, true)}
                                    className="text-orange-600 hover:text-orange-700 h-8 w-8 p-0"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(entity.id)}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
                  {paginatedEntities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد جهات نشطة'}
                    </div>
                  ) : (
                    paginatedEntities.map((entity) => {
                      const Icon = getEntityTypeIcon(entity.type)
                      return (
                        <Card key={entity.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedEntities.includes(entity.id)}
                                  onChange={(e) => handleSelectEntity(entity.id, e.target.checked)}
                                  className="rounded mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4 text-blue-600" />
                                    <h3 className="font-semibold text-lg truncate">{entity.name}</h3>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getEntityTypeColor(entity.type)}>
                                        {getEntityTypeLabel(entity.type)}
                                      </Badge>
                                      <span className="text-gray-600">{entity.governorate}</span>
                                    </div>
                                    <div className="text-gray-500">
                                      {new Date(entity.createdAt).toLocaleDateString('ar-EG')}
                                    </div>
                                    {(entity.description || entity.phone || entity.email) && (
                                      <div className="text-xs text-gray-400 mt-2">
                                        {entity.description && (
                                          <div className="truncate">{entity.description}</div>
                                        )}
                                        {entity.phone && (
                                          <div>📞 {entity.phone}</div>
                                        )}
                                        {entity.email && (
                                          <div>✉️ {entity.email}</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(entity)}
                                  className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entity)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchive(entity.id, true)}
                                  className="text-orange-600 hover:text-orange-700 h-8 w-8 p-0"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entity.id)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
                  إجمالي الجهات المؤرشفة: {sortedEntities.length} جهة
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
                        <TableHead className="text-right">اسم الجهة</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">المحافظة</TableHead>
                        <TableHead className="text-right">تاريخ الأرشفة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد جهات مؤرشفة'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedEntities.map((entity) => {
                          const Icon = getEntityTypeIcon(entity.type)
                          return (
                            <TableRow key={entity.id} className="bg-gray-50 hover:bg-gray-100">
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedEntities.includes(entity.id)}
                                  onChange={(e) => handleSelectEntity(entity.id, e.target.checked)}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{entity.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">{entity.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getEntityTypeColor(entity.type)}>
                                  {getEntityTypeLabel(entity.type)}
                                </Badge>
                              </TableCell>
                              <TableCell>{entity.governorate}</TableCell>
                              <TableCell>
                                {entity.archivedAt 
                                  ? new Date(entity.archivedAt).toLocaleDateString('ar-EG')
                                  : new Date(entity.createdAt).toLocaleDateString('ar-EG')
                                }
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(entity)}
                                    className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleArchive(entity.id, false)}
                                    className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                                  >
                                    <ArchiveRestore className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(entity.id)}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
                  {paginatedEntities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery.length >= 3 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد جهات مؤرشفة'}
                    </div>
                  ) : (
                    paginatedEntities.map((entity) => {
                      const Icon = getEntityTypeIcon(entity.type)
                      return (
                        <Card key={entity.id} className="border-l-4 border-l-gray-400 bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedEntities.includes(entity.id)}
                                  onChange={(e) => handleSelectEntity(entity.id, e.target.checked)}
                                  className="rounded mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4 text-gray-500" />
                                    <h3 className="font-semibold text-lg truncate text-gray-700">{entity.name}</h3>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getEntityTypeColor(entity.type)}>
                                        {getEntityTypeLabel(entity.type)}
                                      </Badge>
                                      <span className="text-gray-600">{entity.governorate}</span>
                                    </div>
                                    <div className="text-gray-500">
                                      أرشفة: {entity.archivedAt 
                                        ? new Date(entity.archivedAt).toLocaleDateString('ar-EG')
                                        : new Date(entity.createdAt).toLocaleDateString('ar-EG')
                                      }
                                    </div>
                                    {(entity.description || entity.phone || entity.email) && (
                                      <div className="text-xs text-gray-400 mt-2">
                                        {entity.description && (
                                          <div className="truncate">{entity.description}</div>
                                        )}
                                        {entity.phone && (
                                          <div>📞 {entity.phone}</div>
                                        )}
                                        {entity.email && (
                                          <div>✉️ {entity.email}</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(entity)}
                                  className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchive(entity.id, false)}
                                  className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entity.id)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الجهات</p>
                    <p className="text-2xl font-bold">{entities.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الجهات النشطة</p>
                    <p className="text-2xl font-bold">
                      {entities.filter(e => !e.isArchived).length}
                    </p>
                  </div>
                  <Scale className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الجهات المؤرشفة</p>
                    <p className="text-2xl font-bold">
                      {entities.filter(e => e.isArchived).length}
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
                      {activeTab === 'active' ? 'الجهات الرئيسية النشطة' : 'الجهات الرئيسية المؤرشفة'}
                    </p>
                    <p className="text-2xl font-bold">
                      {entities.filter(e => e.type === 'main' && (activeTab === 'active' ? !e.isArchived : e.isArchived)).length}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل الجهة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الجهة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">اسم الجهة</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم الجهة"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">نوع الجهة</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'main' | 'branch' | 'workers') => 
                    setFormData({ ...formData, type: value })
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
              <div className="grid gap-2">
                <Label htmlFor="edit-governorate">المحافظة</Label>
                <Select
                  value={formData.governorate}
                  onValueChange={(value) => setFormData({ ...formData, governorate: value })}
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
              <div className="grid gap-2">
                <Label htmlFor="edit-description">الوصف (اختياري)</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف الجهة"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">العنوان (اختياري)</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="أدخل العنوان"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">الهاتف (اختياري)</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-website">الموقع الإلكتروني (اختياري)</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="أدخل الموقع الإلكتروني"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">تحديث الجهة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الجهة</DialogTitle>
            <DialogDescription>
              عرض معلومات كاملة عن الجهة
            </DialogDescription>
          </DialogHeader>
          {viewingEntity && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">الرقم التسلسلي</Label>
                  <p className="text-lg font-semibold">{viewingEntity.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">اسم الجهة</Label>
                  <p className="text-lg font-semibold">{viewingEntity.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">النوع</Label>
                  <div className="mt-1">
                    <Badge className={getEntityTypeColor(viewingEntity.type)}>
                      {getEntityTypeLabel(viewingEntity.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">المحافظة</Label>
                  <p className="text-lg">{viewingEntity.governorate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                  <p className="text-lg">{new Date(viewingEntity.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">الحالة</Label>
                  <div className="mt-1">
                    <Badge variant={viewingEntity.isArchived ? "destructive" : "default"}>
                      {viewingEntity.isArchived ? 'مؤرشفة' : 'نشطة'}
                    </Badge>
                  </div>
                </div>
              </div>
              {viewingEntity.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">الوصف</Label>
                  <p className="text-lg mt-1">{viewingEntity.description}</p>
                </div>
              )}
              {viewingEntity.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">العنوان</Label>
                  <p className="text-lg mt-1">{viewingEntity.address}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {viewingEntity.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الهاتف</Label>
                    <p className="text-lg mt-1">{viewingEntity.phone}</p>
                  </div>
                )}
                {viewingEntity.email && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">البريد الإلكتروني</Label>
                    <p className="text-lg mt-1">{viewingEntity.email}</p>
                  </div>
                )}
                {viewingEntity.website && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الموقع الإلكتروني</Label>
                    <p className="text-lg mt-1">{viewingEntity.website}</p>
                  </div>
                )}
              </div>
              {viewingEntity.archivedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">تاريخ الأرشفة</Label>
                  <p className="text-lg mt-1">{new Date(viewingEntity.archivedAt).toLocaleDateString('ar-EG')}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsViewDialogOpen(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}