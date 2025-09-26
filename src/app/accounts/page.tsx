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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  code: string;
  type: string;
  balance: number;
  currency: string;
  active: boolean;
  createdAt: string;
}

const accountTypes = {
  'ASSET': 'أصل',
  'LIABILITY': 'التزام',
  'EQUITY': 'حقوق ملكية',
  'REVENUE': 'إيراد',
  'EXPENSE': 'مصروف'
};

const currencies = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'ASSET':
      return <Building2 className="h-4 w-4" />;
    case 'LIABILITY':
      return <CreditCard className="h-4 w-4" />;
    case 'EQUITY':
      return <PiggyBank className="h-4 w-4" />;
    case 'REVENUE':
      return <TrendingUp className="h-4 w-4" />;
    case 'EXPENSE':
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
};

const getAccountColor = (type: string) => {
  switch (type) {
    case 'ASSET':
      return 'bg-blue-100 text-blue-600';
    case 'LIABILITY':
      return 'bg-red-100 text-red-600';
    case 'EQUITY':
      return 'bg-green-100 text-green-600';
    case 'REVENUE':
      return 'bg-purple-100 text-purple-600';
    case 'EXPENSE':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function AccountsPage() {
  const { user, hasPermission } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    currency: 'SAR',
    balance: 0,
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockAccounts: Account[] = [
      {
        id: '1',
        name: 'الصندوق',
        code: 'CASH-001',
        type: 'ASSET',
        balance: 10000,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'حساب البنك',
        code: 'BANK-001',
        type: 'ASSET',
        balance: 50000,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        name: 'الإيرادات',
        code: 'REV-001',
        type: 'REVENUE',
        balance: 0,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
      {
        id: '4',
        name: 'المصروفات',
        code: 'EXP-001',
        type: 'EXPENSE',
        balance: 0,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
      {
        id: '5',
        name: 'الذمم المدينة',
        code: 'AR-001',
        type: 'ASSET',
        balance: 12000,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
      {
        id: '6',
        name: 'الذمم الدائنة',
        code: 'AP-001',
        type: 'LIABILITY',
        balance: 5000,
        currency: 'SAR',
        active: true,
        createdAt: '2024-01-01',
      },
    ];

    setAccounts(mockAccounts);
    setFilteredAccounts(mockAccounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(account => account.type === filterType);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(acc => 
        acc.id === editingAccount.id 
          ? { ...acc, ...formData }
          : acc
      ));
    } else {
      // Create new account
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts([...accounts, newAccount]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      code: account.code,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      setAccounts(accounts.filter(acc => acc.id !== accountId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: '',
      currency: 'SAR',
      balance: 0,
    });
    setEditingAccount(null);
  };

  const totalAssets = accounts
    .filter(acc => acc.type === 'ASSET')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalLiabilities = accounts
    .filter(acc => acc.type === 'LIABILITY')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalEquity = totalAssets - totalLiabilities;

  if (!hasPermission('ACCOUNTANT')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة الحسابات المالية
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
          title="إدارة الحسابات المالية"
          subtitle="إدارة وتتبع جميع الحسابات المالية"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الأصول
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">
                  {totalAssets.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الالتزامات
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">
                  {totalLiabilities.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  حقوق الملكية
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">
                  {totalEquity.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="بحث بالاسم أو الكود..."
                  className="pr-10 pl-10 arabic-text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 arabic-text">
                <SelectValue placeholder="نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(accountTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="arabic-text" onClick={resetForm}>
                  <Plus className="ml-2 h-4 w-4" />
                  حساب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {editingAccount ? 'تعديل حساب' : 'إنشاء حساب جديد'}
                  </DialogTitle>
                  <DialogDescription className="arabic-text">
                    {editingAccount ? 'تعديل معلومات الحساب المالي' : 'إضافة حساب مالي جديد إلى النظام'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="arabic-text">اسم الحساب</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code" className="arabic-text">كود الحساب</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="arabic-text">نوع الحساب</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger className="arabic-text">
                          <SelectValue placeholder="اختر نوع الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(accountTypes).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="arabic-text">العملة</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="balance" className="arabic-text">الرصيد الافتتاحي</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={formData.balance}
                        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                        className="arabic-text"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="arabic-text">
                      {editingAccount ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Accounts Table */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">قائمة الحسابات</CardTitle>
              <CardDescription className="arabic-text">
                جميع الحسابات المالية في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">الحساب</TableHead>
                      <TableHead className="arabic-text">الكود</TableHead>
                      <TableHead className="arabic-text">النوع</TableHead>
                      <TableHead className="arabic-text text-right">الرصيد</TableHead>
                      <TableHead className="arabic-text">العملة</TableHead>
                      <TableHead className="arabic-text">الحالة</TableHead>
                      <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getAccountColor(account.type)}`}>
                              {getAccountIcon(account.type)}
                            </div>
                            <div>
                              <p className="font-medium arabic-text">{account.name}</p>
                              <p className="text-sm text-muted-foreground arabic-text">
                                {new Date(account.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono arabic-text">{account.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAccountColor(account.type)}>
                            {accountTypes[account.type as keyof typeof accountTypes]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold arabic-text">
                            {account.balance.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell>
                          <Badge variant={account.active ? 'default' : 'secondary'}>
                            {account.active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(account.id)}
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