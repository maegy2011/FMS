'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Target,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Revenue {
  id: string;
  reference: string;
  sourceId: string;
  sourceName: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: string;
  dueDate?: string;
  receivedDate?: string;
  accountId: string;
  accountName: string;
  categoryName?: string;
  partyName?: string;
  userName: string;
  createdAt: string;
}

interface RevenueSource {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  isRecurring: boolean;
  frequency?: string;
  amount: number;
  currency: string;
  active: boolean;
  partyName?: string;
  createdAt: string;
}

const revenueStatuses = {
  'PENDING': 'قيد الانتظار',
  'RECEIVED': 'مستلم',
  'OVERDUE': 'متأخر',
  'CANCELLED': 'ملغي'
};

const revenueSourceTypes = {
  'SALES': 'مبيعات',
  'SERVICES': 'خدمات',
  'INVESTMENTS': 'استثمارات',
  'RENTAL': 'إيجار',
  'COMMISSIONS': 'عمولات',
  'ROYALTIES': 'إتاوات',
  'INTEREST': 'فوائد',
  'OTHER': 'أخرى'
};

const partyTypes = {
  'CUSTOMER': 'عميل',
  'SUPPLIER': 'مورد',
  'PARTNER': 'شريك',
  'INVESTOR': 'مستثمر',
  'EMPLOYEE': 'موظف',
  'GOVERNMENT': 'حكومي',
  'BANK': 'بنك',
  'OTHER': 'أخرى'
};

const currencies = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'RECEIVED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'RECEIVED':
      return <CheckCircle className="h-4 w-4" />;
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'OVERDUE':
      return <XCircle className="h-4 w-4" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function RevenuesPage() {
  const { user, hasPermission } = useAuth();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [revenueSources, setRevenueSources] = useState<RevenueSource[]>([]);
  const [filteredRevenues, setFilteredRevenues] = useState<Revenue[]>([]);
  const [filteredRevenueSources, setFilteredRevenueSources] = useState<RevenueSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [editingSource, setEditingSource] = useState<RevenueSource | null>(null);
  const [activeTab, setActiveTab] = useState('revenues');

  // Mock accounts for dropdown
  const accounts = [
    { id: '1', name: 'الصندوق' },
    { id: '2', name: 'حساب البنك' },
    { id: '3', name: 'الإيرادات' },
  ];

  // Mock parties for dropdown
  const parties = [
    { id: '1', name: 'شركة التقنية المتقدمة', type: 'CUSTOMER' },
    { id: '2', name: 'مؤسسة التجارة الحديثة', type: 'CUSTOMER' },
    { id: '3', name: 'بنك الاستثمار العربي', type: 'BANK' },
  ];

  // Mock categories for dropdown
  const categories = [
    { id: '1', name: 'المبيعات' },
    { id: '2', name: 'الخدمات' },
    { id: '3', name: 'الاستثمارات' },
  ];

  const [revenueFormData, setRevenueFormData] = useState({
    sourceId: '',
    amount: 0,
    currency: 'SAR',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    dueDate: '',
    accountId: '',
    categoryId: '',
    partyId: '',
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: '',
    description: '',
    type: '',
    category: '',
    isRecurring: false,
    frequency: '',
    amount: 0,
    currency: 'SAR',
    accountId: '',
    categoryId: '',
    partyId: '',
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockRevenues: Revenue[] = [
      {
        id: '1',
        reference: 'REV-001',
        sourceId: '1',
        sourceName: 'مبيعات المنتجات',
        amount: 15000,
        currency: 'SAR',
        description: 'إيراد مبيعات شهر يناير',
        date: '2024-01-31',
        status: 'RECEIVED',
        receivedDate: '2024-01-31',
        accountId: '1',
        accountName: 'الصندوق',
        categoryName: 'المبيعات',
        partyName: 'شركة التقنية المتقدمة',
        userName: 'مدير النظام',
        createdAt: '2024-01-31',
      },
      {
        id: '2',
        reference: 'REV-002',
        sourceId: '2',
        sourceName: 'خدمات استشارية',
        amount: 8000,
        currency: 'SAR',
        description: 'إيراد خدمات استشارية شهر يناير',
        date: '2024-01-31',
        status: 'RECEIVED',
        receivedDate: '2024-01-31',
        accountId: '1',
        accountName: 'الصندوق',
        categoryName: 'الخدمات',
        partyName: 'مؤسسة التجارة الحديثة',
        userName: 'مدير مالي',
        createdAt: '2024-01-31',
      },
      {
        id: '3',
        reference: 'REV-003',
        sourceId: '3',
        sourceName: 'عوائد الاستثمارات',
        amount: 5000,
        currency: 'SAR',
        description: 'عوائد استثمارات الربع الأول',
        date: '2024-03-31',
        status: 'PENDING',
        dueDate: '2024-03-31',
        accountId: '2',
        accountName: 'حساب البنك',
        categoryName: 'الاستثمارات',
        partyName: 'بنك الاستثمار العربي',
        userName: 'محاسب',
        createdAt: '2024-03-31',
      },
      {
        id: '4',
        reference: 'REV-004',
        sourceId: '4',
        sourceName: 'إيجار العقارات',
        amount: 3000,
        currency: 'SAR',
        description: 'إيراد إيجار شهر فبراير',
        date: '2024-02-28',
        status: 'OVERDUE',
        dueDate: '2024-02-28',
        accountId: '1',
        accountName: 'الصندوق',
        userName: 'مدير النظام',
        createdAt: '2024-02-28',
      },
    ];

    const mockRevenueSources: RevenueSource[] = [
      {
        id: '1',
        name: 'مبيعات المنتجات',
        description: 'إيرادات من مبيعات المنتجات التقنية',
        type: 'SALES',
        category: 'منتجات',
        isRecurring: true,
        frequency: 'monthly',
        amount: 15000,
        currency: 'SAR',
        active: true,
        partyName: 'شركة التقنية المتقدمة',
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'خدمات استشارية',
        description: 'إيرادات من الخدمات الاستشارية',
        type: 'SERVICES',
        category: 'استشارات',
        isRecurring: true,
        frequency: 'monthly',
        amount: 8000,
        currency: 'SAR',
        active: true,
        partyName: 'مؤسسة التجارة الحديثة',
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        name: 'عوائد الاستثمارات',
        description: 'عوائد من الاستثمارات المالية',
        type: 'INVESTMENTS',
        category: 'استثمارات',
        isRecurring: true,
        frequency: 'quarterly',
        amount: 5000,
        currency: 'SAR',
        active: true,
        partyName: 'بنك الاستثمار العربي',
        createdAt: '2024-01-01',
      },
      {
        id: '4',
        name: 'إيجار العقارات',
        description: 'إيرادات من تأجير العقارات',
        type: 'RENTAL',
        category: 'عقارات',
        isRecurring: true,
        frequency: 'monthly',
        amount: 3000,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
    ];

    setRevenues(mockRevenues);
    setRevenueSources(mockRevenueSources);
    setFilteredRevenues(mockRevenues);
    setFilteredRevenueSources(mockRevenueSources);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = revenues;

    if (searchTerm) {
      filtered = filtered.filter(revenue =>
        revenue.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.sourceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(revenue => revenue.status === filterStatus);
    }

    setFilteredRevenues(filtered);
  }, [revenues, searchTerm, filterStatus]);

  useEffect(() => {
    let filtered = revenueSources;

    if (searchTerm) {
      filtered = filtered.filter(source =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(source => source.type === filterType);
    }

    setFilteredRevenueSources(filtered);
  }, [revenueSources, searchTerm, filterType]);

  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAccount = accounts.find(acc => acc.id === revenueFormData.accountId);
    const selectedSource = revenueSources.find(src => src.id === revenueFormData.sourceId);
    const selectedCategory = categories.find(cat => cat.id === revenueFormData.categoryId);
    const selectedParty = parties.find(party => party.id === revenueFormData.partyId);
    
    if (editingRevenue) {
      // Update existing revenue
      setRevenues(revenues.map(rev => 
        rev.id === editingRevenue.id 
          ? { 
              ...rev, 
              ...revenueFormData,
              accountName: selectedAccount?.name || rev.accountName,
              sourceName: selectedSource?.name || rev.sourceName,
              categoryName: selectedCategory?.name || rev.categoryName,
              partyName: selectedParty?.name || rev.partyName,
            }
          : rev
      ));
    } else {
      // Create new revenue
      const newRevenue: Revenue = {
        id: Date.now().toString(),
        reference: revenueFormData.sourceId ? `REV-${Date.now()}` : `REV-${Date.now()}`,
        sourceId: revenueFormData.sourceId,
        sourceName: selectedSource?.name || '',
        ...revenueFormData,
        accountName: selectedAccount?.name || '',
        categoryName: selectedCategory?.name || '',
        partyName: selectedParty?.name || '',
        userName: user?.name || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRevenues([...revenues, newRevenue]);
    }

    resetRevenueForm();
    setIsDialogOpen(false);
  };

  const handleSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAccount = accounts.find(acc => acc.id === sourceFormData.accountId);
    const selectedCategory = categories.find(cat => cat.id === sourceFormData.categoryId);
    const selectedParty = parties.find(party => party.id === sourceFormData.partyId);
    
    if (editingSource) {
      // Update existing source
      setRevenueSources(revenueSources.map(src => 
        src.id === editingSource.id 
          ? { 
              ...src, 
              ...sourceFormData,
              partyName: selectedParty?.name || src.partyName,
            }
          : src
      ));
    } else {
      // Create new source
      const newSource: RevenueSource = {
        id: Date.now().toString(),
        ...sourceFormData,
        partyName: selectedParty?.name || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRevenueSources([...revenueSources, newSource]);
    }

    resetSourceForm();
    setIsSourceDialogOpen(false);
  };

  const handleRevenueEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    setRevenueFormData({
      sourceId: revenue.sourceId,
      amount: revenue.amount,
      currency: revenue.currency,
      description: revenue.description,
      date: revenue.date,
      status: revenue.status,
      dueDate: revenue.dueDate || '',
      accountId: revenue.accountId,
      categoryId: '',
      partyId: '',
    });
    setIsDialogOpen(true);
  };

  const handleSourceEdit = (source: RevenueSource) => {
    setEditingSource(source);
    setSourceFormData({
      name: source.name,
      description: source.description,
      type: source.type,
      category: source.category,
      isRecurring: source.isRecurring,
      frequency: source.frequency || '',
      amount: source.amount,
      currency: source.currency,
      accountId: '',
      categoryId: '',
      partyId: '',
    });
    setIsSourceDialogOpen(true);
  };

  const handleRevenueDelete = (revenueId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإيراد؟')) {
      setRevenues(revenues.filter(rev => rev.id !== revenueId));
    }
  };

  const handleSourceDelete = (sourceId: string) => {
    if (confirm('هل أنت متأكد من حذف مصدر الإيراد؟')) {
      setRevenueSources(revenueSources.filter(src => src.id !== sourceId));
    }
  };

  const resetRevenueForm = () => {
    setRevenueFormData({
      sourceId: '',
      amount: 0,
      currency: 'SAR',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      dueDate: '',
      accountId: '',
      categoryId: '',
      partyId: '',
    });
    setEditingRevenue(null);
  };

  const resetSourceForm = () => {
    setSourceFormData({
      name: '',
      description: '',
      type: '',
      category: '',
      isRecurring: false,
      frequency: '',
      amount: 0,
      currency: 'SAR',
      accountId: '',
      categoryId: '',
      partyId: '',
    });
    setEditingSource(null);
  };

  const totalReceived = revenues
    .filter(rev => rev.status === 'RECEIVED')
    .reduce((sum, rev) => sum + rev.amount, 0);

  const totalPending = revenues
    .filter(rev => rev.status === 'PENDING')
    .reduce((sum, rev) => sum + rev.amount, 0);

  const totalOverdue = revenues
    .filter(rev => rev.status === 'OVERDUE')
    .reduce((sum, rev) => sum + rev.amount, 0);

  const totalExpectedRevenue = revenueSources
    .filter(src => src.active)
    .reduce((sum, src) => sum + src.amount, 0);

  if (!hasPermission('ACCOUNTANT')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة إدارة الإيرادات
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="إدارة الإيرادات"
          subtitle="إدارة وتتبع جميع مصادر الإيرادات"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  الإيرادات المستلمة
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-green-600">
                  {totalReceived.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  الإيرادات المنتظرة
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-yellow-600">
                  {totalPending.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  الإيرادات المتأخرة
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-red-600">
                  {totalOverdue.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  الإيرادات المتوقعة
                </CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-blue-600">
                  {totalExpectedRevenue.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenues" className="arabic-text">الإيرادات</TabsTrigger>
              <TabsTrigger value="sources" className="arabic-text">مصادر الإيرادات</TabsTrigger>
            </TabsList>

            <TabsContent value="revenues" className="space-y-6">
              {/* Filters and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="بحث بالمرجع أو الوصف..."
                      className="pr-10 pl-10 arabic-text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40 arabic-text">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Object.entries(revenueStatuses).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="arabic-text" onClick={resetRevenueForm}>
                      <Plus className="ml-2 h-4 w-4" />
                      إيراد جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="arabic-text">
                        {editingRevenue ? 'تعديل إيراد' : 'إنشاء إيراد جديد'}
                      </DialogTitle>
                      <DialogDescription className="arabic-text">
                        {editingRevenue ? 'تعديل معلومات الإيراد' : 'إضافة إيراد جديد إلى النظام'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRevenueSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="arabic-text">مصدر الإيراد</Label>
                            <Select value={revenueFormData.sourceId} onValueChange={(value) => setRevenueFormData({...revenueFormData, sourceId: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue placeholder="اختر المصدر" />
                              </SelectTrigger>
                              <SelectContent>
                                {revenueSources.map((source) => (
                                  <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="arabic-text">المبلغ</Label>
                            <Input
                              type="number"
                              value={revenueFormData.amount}
                              onChange={(e) => setRevenueFormData({...revenueFormData, amount: parseFloat(e.target.value) || 0})}
                              className="arabic-text"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="arabic-text">العملة</Label>
                            <Select value={revenueFormData.currency} onValueChange={(value) => setRevenueFormData({...revenueFormData, currency: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map(currency => (
                                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="arabic-text">الحالة</Label>
                            <Select value={revenueFormData.status} onValueChange={(value) => setRevenueFormData({...revenueFormData, status: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(revenueStatuses).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="arabic-text">التاريخ</Label>
                            <Input
                              type="date"
                              value={revenueFormData.date}
                              onChange={(e) => setRevenueFormData({...revenueFormData, date: e.target.value})}
                              className="arabic-text"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="arabic-text">تاريخ الاستحقاق</Label>
                            <Input
                              type="date"
                              value={revenueFormData.dueDate}
                              onChange={(e) => setRevenueFormData({...revenueFormData, dueDate: e.target.value})}
                              className="arabic-text"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="arabic-text">الوصف</Label>
                          <Textarea
                            value={revenueFormData.description}
                            onChange={(e) => setRevenueFormData({...revenueFormData, description: e.target.value})}
                            className="arabic-text"
                            placeholder="وصف الإيراد..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="arabic-text">الحساب</Label>
                          <Select value={revenueFormData.accountId} onValueChange={(value) => setRevenueFormData({...revenueFormData, accountId: value})}>
                            <SelectTrigger className="arabic-text">
                              <SelectValue placeholder="اختر الحساب" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="arabic-text">
                          {editingRevenue ? 'تحديث' : 'إنشاء'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Revenues Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">قائمة الإيرادات</CardTitle>
                  <CardDescription className="arabic-text">
                    جميع الإيرادات المسجلة في النظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="arabic-text">المرجع</TableHead>
                          <TableHead className="arabic-text">المصدر</TableHead>
                          <TableHead className="arabic-text">الوصف</TableHead>
                          <TableHead className="arabic-text">المبلغ</TableHead>
                          <TableHead className="arabic-text">التاريخ</TableHead>
                          <TableHead className="arabic-text">الحالة</TableHead>
                          <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRevenues.map((revenue) => (
                          <TableRow key={revenue.id}>
                            <TableCell className="font-medium">{revenue.reference}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-blue-600" />
                                <span className="arabic-text">{revenue.sourceName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="arabic-text">{revenue.description}</TableCell>
                            <TableCell className="font-bold arabic-text">
                              {revenue.amount.toLocaleString()} {revenue.currency}
                            </TableCell>
                            <TableCell className="arabic-text">{revenue.date}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(revenue.status)}
                                <Badge variant="secondary" className={getStatusColor(revenue.status)}>
                                  {revenueStatuses[revenue.status as keyof typeof revenueStatuses]}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevenueEdit(revenue)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevenueDelete(revenue.id)}
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              {/* Filters and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="بحث بالمصدر أو الوصف..."
                      className="pr-10 pl-10 arabic-text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40 arabic-text">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Object.entries(revenueSourceTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="arabic-text" onClick={resetSourceForm}>
                      <Plus className="ml-2 h-4 w-4" />
                      مصدر جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="arabic-text">
                        {editingSource ? 'تعديل مصدر' : 'إنشاء مصدر جديد'}
                      </DialogTitle>
                      <DialogDescription className="arabic-text">
                        {editingSource ? 'تعديل معلومات مصدر الإيراد' : 'إضافة مصدر إيراد جديد إلى النظام'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSourceSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label className="arabic-text">اسم المصدر</Label>
                          <Input
                            value={sourceFormData.name}
                            onChange={(e) => setSourceFormData({...sourceFormData, name: e.target.value})}
                            className="arabic-text"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="arabic-text">الوصف</Label>
                          <Textarea
                            value={sourceFormData.description}
                            onChange={(e) => setSourceFormData({...sourceFormData, description: e.target.value})}
                            className="arabic-text"
                            placeholder="وصف مصدر الإيراد..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="arabic-text">النوع</Label>
                            <Select value={sourceFormData.type} onValueChange={(value) => setSourceFormData({...sourceFormData, type: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(revenueSourceTypes).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="arabic-text">الفئة</Label>
                            <Input
                              value={sourceFormData.category}
                              onChange={(e) => setSourceFormData({...sourceFormData, category: e.target.value})}
                              className="arabic-text"
                              placeholder="الفئة"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="arabic-text">المبلغ</Label>
                            <Input
                              type="number"
                              value={sourceFormData.amount}
                              onChange={(e) => setSourceFormData({...sourceFormData, amount: parseFloat(e.target.value) || 0})}
                              className="arabic-text"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="arabic-text">العملة</Label>
                            <Select value={sourceFormData.currency} onValueChange={(value) => setSourceFormData({...sourceFormData, currency: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map(currency => (
                                  <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            id="isRecurring"
                            type="checkbox"
                            checked={sourceFormData.isRecurring}
                            onChange={(e) => setSourceFormData({...sourceFormData, isRecurring: e.target.checked})}
                            className="rounded"
                          />
                          <Label htmlFor="isRecurring" className="arabic-text">متكرر</Label>
                        </div>
                        {sourceFormData.isRecurring && (
                          <div className="space-y-2">
                            <Label className="arabic-text">التكرار</Label>
                            <Select value={sourceFormData.frequency} onValueChange={(value) => setSourceFormData({...sourceFormData, frequency: value})}>
                              <SelectTrigger className="arabic-text">
                                <SelectValue placeholder="اختر التكرار" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">يومي</SelectItem>
                                <SelectItem value="weekly">أسبوعي</SelectItem>
                                <SelectItem value="monthly">شهري</SelectItem>
                                <SelectItem value="quarterly">ربع سنوي</SelectItem>
                                <SelectItem value="yearly">سنوي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="arabic-text">
                          {editingSource ? 'تحديث' : 'إنشاء'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Revenue Sources Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">مصادر الإيرادات</CardTitle>
                  <CardDescription className="arabic-text">
                    جميع مصادر الإيرادات المسجلة في النظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="arabic-text">المصدر</TableHead>
                          <TableHead className="arabic-text">النوع</TableHead>
                          <TableHead className="arabic-text">الفئة</TableHead>
                          <TableHead className="arabic-text">المبلغ</TableHead>
                          <TableHead className="arabic-text">التكرار</TableHead>
                          <TableHead className="arabic-text">الحالة</TableHead>
                          <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRevenueSources.map((source) => (
                          <TableRow key={source.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                  <Star className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium arabic-text">{source.name}</p>
                                  <p className="text-sm text-muted-foreground arabic-text">
                                    {source.partyName}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="arabic-text">
                              {revenueSourceTypes[source.type as keyof typeof revenueSourceTypes]}
                            </TableCell>
                            <TableCell className="arabic-text">{source.category}</TableCell>
                            <TableCell className="font-bold arabic-text">
                              {source.amount.toLocaleString()} {source.currency}
                            </TableCell>
                            <TableCell className="arabic-text">
                              {source.isRecurring ? source.frequency : '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={source.active ? 'default' : 'secondary'}>
                                {source.active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSourceEdit(source)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSourceDelete(source.id)}
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}