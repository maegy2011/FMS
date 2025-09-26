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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Users,
  CreditCard,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Landmark,
  Truck,
  Crown,
  Building,
  Shield
} from 'lucide-react';

interface Party {
  id: string;
  name: string;
  type: string;
  code: string;
  description: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  website: string;
  taxId: string;
  commercialId: string;
  status: string;
  creditLimit: number;
  balance: number;
  currency: string;
  createdAt: string;
  lastTransaction?: string;
  transactionCount?: number;
}

interface PartyTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  type: string;
  status: string;
}

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

const partyStatuses = {
  'ACTIVE': 'نشط',
  'INACTIVE': 'غير نشط',
  'PENDING': 'قيد الانتظار',
  'BLOCKED': 'محظور'
};

const currencies = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];

const getPartyIcon = (type: string) => {
  switch (type) {
    case 'CUSTOMER':
      return <Users className="h-5 w-5" />;
    case 'SUPPLIER':
      return <Truck className="h-5 w-5" />;
    case 'PARTNER':
      return <Briefcase className="h-5 w-5" />;
    case 'INVESTOR':
      return <TrendingUp className="h-5 w-5" />;
    case 'EMPLOYEE':
      return <User className="h-5 w-5" />;
    case 'GOVERNMENT':
      return <Building className="h-5 w-5" />;
    case 'BANK':
      return <Landmark className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

const getPartyColor = (type: string) => {
  switch (type) {
    case 'CUSTOMER':
      return 'bg-blue-100 text-blue-600';
    case 'SUPPLIER':
      return 'bg-green-100 text-green-600';
    case 'PARTNER':
      return 'bg-purple-100 text-purple-600';
    case 'INVESTOR':
      return 'bg-yellow-100 text-yellow-600';
    case 'EMPLOYEE':
      return 'bg-orange-100 text-orange-600';
    case 'GOVERNMENT':
      return 'bg-red-100 text-red-600';
    case 'BANK':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PartiesPage() {
  const { user, hasPermission } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [activeTab, setActiveTab] = useState('parties');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    country: 'المملكة العربية السعودية',
    postalCode: '',
    website: '',
    taxId: '',
    commercialId: '',
    status: 'ACTIVE',
    creditLimit: 0,
    balance: 0,
    currency: 'SAR',
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockParties: Party[] = [
      {
        id: '1',
        name: 'شركة التقنية المتقدمة',
        type: 'CUSTOMER',
        code: 'CUST-001',
        description: 'شركة رائدة في تقديم الحلول التقنية',
        email: 'info@techcompany.com',
        phone: '0112345678',
        mobile: '0501234567',
        address: 'شارع الملك فهد، حي النخيل',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        postalCode: '12345',
        website: 'https://techcompany.com',
        taxId: '3001234567',
        commercialId: '1010123456',
        status: 'ACTIVE',
        creditLimit: 50000,
        balance: 15000,
        currency: 'SAR',
        createdAt: '2024-01-01',
        lastTransaction: '2024-01-15',
        transactionCount: 25,
      },
      {
        id: '2',
        name: 'مؤسسة التجارة الحديثة',
        type: 'CUSTOMER',
        code: 'CUST-002',
        description: 'متخصصة في التجارة الإلكترونية',
        email: 'contact@moderntrade.com',
        phone: '0123456789',
        mobile: '0512345678',
        address: 'شارع التحلية، حي الروضة',
        city: 'جدة',
        country: 'المملكة العربية السعودية',
        postalCode: '23456',
        website: 'https://moderntrade.com',
        taxId: '3002345678',
        commercialId: '1010234567',
        status: 'ACTIVE',
        creditLimit: 30000,
        balance: 8000,
        currency: 'SAR',
        createdAt: '2024-01-02',
        lastTransaction: '2024-01-14',
        transactionCount: 18,
      },
      {
        id: '3',
        name: 'شركة المستلزمات المكتبية',
        type: 'SUPPLIER',
        code: 'SUP-001',
        description: 'توريد المستلزمات والمعدات المكتبية',
        email: 'sales@officesupplies.com',
        phone: '0134567890',
        mobile: '0523456789',
        address: 'شارع الخليج، حي الفيصلية',
        city: 'الدمام',
        country: 'المملكة العربية السعودية',
        postalCode: '34567',
        website: 'https://officesupplies.com',
        taxId: '3003456789',
        commercialId: '1010345678',
        status: 'ACTIVE',
        creditLimit: 0,
        balance: -5000,
        currency: 'SAR',
        createdAt: '2024-01-03',
        lastTransaction: '2024-01-13',
        transactionCount: 12,
      },
      {
        id: '4',
        name: 'بنك الاستثمار العربي',
        type: 'BANK',
        code: 'BANK-001',
        description: 'بنك رائد في الاستثمارات المالية',
        email: 'info@arabinvestment.com',
        phone: '0145678901',
        mobile: '0534567890',
        address: 'شارع الملك عبدالله، حي المركز',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        postalCode: '45678',
        website: 'https://arabinvestment.com',
        taxId: '3004567890',
        commercialId: '1010456789',
        status: 'ACTIVE',
        creditLimit: 100000,
        balance: 75000,
        currency: 'SAR',
        createdAt: '2024-01-04',
        lastTransaction: '2024-01-12',
        transactionCount: 8,
      },
      {
        id: '5',
        name: 'شركة الأمل للاستثمار',
        type: 'PARTNER',
        code: 'PART-001',
        description: 'شريك استراتيجي في المشاريع الكبرى',
        email: 'partners@amalco.com',
        phone: '0156789012',
        mobile: '0545678901',
        address: 'شارق الأمير محمد، حي العليا',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        postalCode: '56789',
        website: 'https://amalco.com',
        taxId: '3005678901',
        commercialId: '1010567890',
        status: 'ACTIVE',
        creditLimit: 200000,
        balance: 120000,
        currency: 'SAR',
        createdAt: '2024-01-05',
        lastTransaction: '2024-01-11',
        transactionCount: 15,
      },
      {
        id: '6',
        name: 'مؤسسة النور للتجارة',
        type: 'CUSTOMER',
        code: 'CUST-003',
        description: 'تجارة الجملة والتجزئة',
        email: 'info@nourtrade.com',
        phone: '0167890123',
        mobile: '0556789012',
        address: 'شارع الملك فهد، حي الربوة',
        city: 'مكة',
        country: 'المملكة العربية السعودية',
        postalCode: '67890',
        status: 'PENDING',
        creditLimit: 25000,
        balance: 0,
        currency: 'SAR',
        createdAt: '2024-01-06',
        lastTransaction: '2024-01-10',
        transactionCount: 3,
      },
    ];

    setParties(mockParties);
    setFilteredParties(mockParties);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = parties;

    if (searchTerm) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.phone.includes(searchTerm)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(party => party.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(party => party.status === filterStatus);
    }

    setFilteredParties(filtered);
  }, [parties, searchTerm, filterType, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingParty) {
      // Update existing party
      setParties(parties.map(party => 
        party.id === editingParty.id 
          ? { ...party, ...formData }
          : party
      ));
    } else {
      // Create new party
      const newParty: Party = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setParties([...parties, newParty]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      type: party.type,
      code: party.code,
      description: party.description,
      email: party.email,
      phone: party.phone,
      mobile: party.mobile,
      address: party.address,
      city: party.city,
      country: party.country,
      postalCode: party.postalCode,
      website: party.website,
      taxId: party.taxId,
      commercialId: party.commercialId,
      status: party.status,
      creditLimit: party.creditLimit,
      balance: party.balance,
      currency: party.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (partyId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الجهة؟')) {
      setParties(parties.filter(party => party.id !== partyId));
    }
  };

  const togglePartyStatus = (partyId: string) => {
    setParties(parties.map(party => 
      party.id === partyId 
        ? { 
            ...party, 
            status: party.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
          }
        : party
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      code: '',
      description: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      country: 'المملكة العربية السعودية',
      postalCode: '',
      website: '',
      taxId: '',
      commercialId: '',
      status: 'ACTIVE',
      creditLimit: 0,
      balance: 0,
      currency: 'SAR',
    });
    setEditingParty(null);
  };

  const totalParties = parties.length;
  const activeParties = parties.filter(p => p.status === 'ACTIVE').length;
  const totalCreditLimit = parties.reduce((sum, party) => sum + party.creditLimit, 0);
  const totalBalance = parties.reduce((sum, party) => sum + party.balance, 0);

  const typeDistribution = Object.entries(partyTypes).map(([type, label]) => ({
    type,
    label,
    count: parties.filter(p => p.type === type).length,
    percentage: totalParties > 0 ? (parties.filter(p => p.type === type).length / totalParties) * 100 : 0
  }));

  if (!hasPermission('ACCOUNTANT')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة إدارة الجهات
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
          title="إدارة الجهات"
          subtitle="إدارة العملاء والموردين والشركاء التجاريين"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الجهات
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">{totalParties}</div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  الجهات النشطة
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-green-600">{activeParties}</div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الحدود الائتمانية
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-blue-600">
                  {totalCreditLimit.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>

            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الأرصدة
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold arabic-text ${
                  totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalBalance >= 0 ? '+' : ''}{totalBalance.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Type Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="arabic-text">توزيع الجهات حسب النوع</CardTitle>
              <CardDescription className="arabic-text">
                نظرة عامة على توزيع الجهات حسب تصنيفها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {typeDistribution.map((item) => (
                  <div key={item.type} className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getPartyColor(item.type)}`}>
                      {getPartyIcon(item.type)}
                    </div>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-sm text-muted-foreground arabic-text">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{Math.round(item.percentage)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="بحث بالاسم أو الكود أو البريد الإلكتروني..."
                  className="pr-10 pl-10 arabic-text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 arabic-text">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(partyTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 arabic-text">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(partyStatuses).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="arabic-text" onClick={resetForm}>
                  <Plus className="ml-2 h-4 w-4" />
                  جهة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {editingParty ? 'تعديل جهة' : 'إنشاء جهة جديدة'}
                  </DialogTitle>
                  <DialogDescription className="arabic-text">
                    {editingParty ? 'تعديل معلومات الجهة' : 'إضافة جهة جديدة إلى النظام'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">الاسم</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="arabic-text"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">النوع</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger className="arabic-text">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(partyTypes).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">الكود</Label>
                        <Input
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="arabic-text"
                          placeholder="مثل: CUST-001"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">الحالة</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                          <SelectTrigger className="arabic-text">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(partyStatuses).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="arabic-text">الوصف</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="arabic-text"
                        placeholder="وصف الجهة..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">البريد الإلكتروني</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="arabic-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">الموقع الإلكتروني</Label>
                        <Input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          className="arabic-text"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">الهاتف</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="arabic-text"
                          placeholder="0112345678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">الجوال</Label>
                        <Input
                          value={formData.mobile}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                          className="arabic-text"
                          placeholder="0501234567"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="arabic-text">العنوان</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="arabic-text"
                        placeholder="العنوان الكامل"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">المدينة</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="arabic-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">البلد</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          className="arabic-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">الرمز البريدي</Label>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          className="arabic-text"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">الرقم الضريبي</Label>
                        <Input
                          value={formData.taxId}
                          onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                          className="arabic-text"
                          placeholder="3001234567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">السجل التجاري</Label>
                        <Input
                          value={formData.commercialId}
                          onChange={(e) => setFormData({...formData, commercialId: e.target.value})}
                          className="arabic-text"
                          placeholder="1010123456"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="arabic-text">الحد الائتماني</Label>
                        <Input
                          type="number"
                          value={formData.creditLimit}
                          onChange={(e) => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})}
                          className="arabic-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">الرصيد الحالي</Label>
                        <Input
                          type="number"
                          value={formData.balance}
                          onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                          className="arabic-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="arabic-text">العملة</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
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
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="arabic-text">
                      {editingParty ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Parties Table */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">قائمة الجهات</CardTitle>
              <CardDescription className="arabic-text">
                جميع الجهات المسجلة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">الجهة</TableHead>
                      <TableHead className="arabic-text">النوع</TableHead>
                      <TableHead className="arabic-text">جهات الاتصال</TableHead>
                      <TableHead className="arabic-text">الحد الائتماني</TableHead>
                      <TableHead className="arabic-text">الرصيد</TableHead>
                      <TableHead className="arabic-text">الحالة</TableHead>
                      <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParties.map((party) => (
                      <TableRow key={party.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getPartyColor(party.type)}`}>
                              {getPartyIcon(party.type)}
                            </div>
                            <div>
                              <p className="font-medium arabic-text">{party.name}</p>
                              <p className="text-sm text-muted-foreground arabic-text">
                                {party.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="arabic-text">
                          {partyTypes[party.type as keyof typeof partyTypes]}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {party.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3" />
                                <span className="arabic-text">{party.email}</span>
                              </div>
                            )}
                            {party.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                <span className="arabic-text">{party.phone}</span>
                              </div>
                            )}
                            {party.mobile && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                <span className="arabic-text">{party.mobile}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="arabic-text">
                          {party.creditLimit > 0 ? `${party.creditLimit.toLocaleString()} ${party.currency}` : '—'}
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold arabic-text ${
                            party.balance > 0 ? 'text-green-600' : 
                            party.balance < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {party.balance !== 0 ? `${party.balance >= 0 ? '+' : ''}${party.balance.toLocaleString()} ${party.currency}` : '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(party.status)}>
                            {partyStatuses[party.status as keyof typeof partyStatuses]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(party)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePartyStatus(party.id)}
                            >
                              {party.status === 'ACTIVE' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(party.id)}
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
        </main>
      </div>
    </div>
  );
}