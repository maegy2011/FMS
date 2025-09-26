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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar as CalendarIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: string;
  accountId: string;
  accountName: string;
  categoryName?: string;
  userName: string;
  createdAt: string;
}

const transactionTypes = {
  'INCOME': 'إيراد',
  'EXPENSE': 'مصروف',
  'TRANSFER': 'تحويل',
  'ADJUSTMENT': 'تعديل'
};

const transactionStatuses = {
  'PENDING': 'قيد الانتظار',
  'COMPLETED': 'مكتمل',
  'CANCELLED': 'ملغي',
  'REVERSED': 'ملغوم'
};

const currencies = ['SAR', 'USD', 'EUR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'REVERSED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4" />;
    case 'REVERSED':
      return <ArrowDownRight className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function TransactionsPage() {
  const { user, hasPermission } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    reference: '',
    type: '',
    amount: 0,
    currency: 'SAR',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    accountId: '',
  });

  // Mock accounts for dropdown
  const accounts = [
    { id: '1', name: 'الصندوق' },
    { id: '2', name: 'حساب البنك' },
    { id: '3', name: 'الإيرادات' },
    { id: '4', name: 'المصروفات' },
  ];

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        reference: 'TRX-001',
        type: 'INCOME',
        amount: 5000,
        currency: 'SAR',
        description: 'إيراد من المبيعات',
        date: '2024-01-15',
        status: 'COMPLETED',
        accountId: '1',
        accountName: 'الصندوق',
        categoryName: 'المبيعات',
        userName: 'مدير النظام',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        reference: 'TRX-002',
        type: 'EXPENSE',
        amount: 2000,
        currency: 'SAR',
        description: 'إيجار المكتب',
        date: '2024-01-14',
        status: 'COMPLETED',
        accountId: '1',
        accountName: 'الصندوق',
        categoryName: 'المصروفات التشغيلية',
        userName: 'مدير مالي',
        createdAt: '2024-01-14',
      },
      {
        id: '3',
        reference: 'TRX-003',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'SAR',
        description: 'شراء معدات',
        date: '2024-01-13',
        status: 'PENDING',
        accountId: '2',
        accountName: 'حساب البنك',
        categoryName: 'المصروفات الرأسمالية',
        userName: 'محاسب',
        createdAt: '2024-01-13',
      },
      {
        id: '4',
        reference: 'TRX-004',
        type: 'INCOME',
        amount: 3000,
        currency: 'SAR',
        description: 'خدمات استشارية',
        date: '2024-01-12',
        status: 'COMPLETED',
        accountId: '1',
        accountName: 'الصندوق',
        categoryName: 'الخدمات',
        userName: 'مدير النظام',
        createdAt: '2024-01-12',
      },
      {
        id: '5',
        reference: 'TRX-005',
        type: 'EXPENSE',
        amount: 4000,
        currency: 'SAR',
        description: 'رواتب الموظفين',
        date: '2024-01-11',
        status: 'COMPLETED',
        accountId: '2',
        accountName: 'حساب البنك',
        categoryName: 'المصروفات التشغيلية',
        userName: 'مدير مالي',
        createdAt: '2024-01-11',
      },
    ];

    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
    
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(trx => 
        trx.id === editingTransaction.id 
          ? { 
              ...trx, 
              ...formData,
              accountName: selectedAccount?.name || trx.accountName,
            }
          : trx
      ));
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        reference: formData.reference || `TRX-${Date.now()}`,
        ...formData,
        accountName: selectedAccount?.name || '',
        userName: user?.name || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTransactions([...transactions, newTransaction]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      reference: transaction.reference,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      date: transaction.date,
      status: transaction.status,
      accountId: transaction.accountId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (transactionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      setTransactions(transactions.filter(trx => trx.id !== transactionId));
    }
  };

  const resetForm = () => {
    setFormData({
      reference: '',
      type: '',
      amount: 0,
      currency: 'SAR',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      accountId: '',
    });
    setEditingTransaction(null);
  };

  const totalIncome = transactions
    .filter(trx => trx.type === 'INCOME' && trx.status === 'COMPLETED')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const totalExpenses = transactions
    .filter(trx => trx.type === 'EXPENSE' && trx.status === 'COMPLETED')
    .reduce((sum, trx) => sum + trx.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  if (!hasPermission('ACCOUNTANT')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة المعاملات المالية
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
          title="إدارة المعاملات المالية"
          subtitle="إدارة وتتبع جميع المعاملات المالية"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي الإيرادات
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-green-600">
                  {totalIncome.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي المصروفات
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text text-red-600">
                  {totalExpenses.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  صافي التدفق النقدي
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold arabic-text ${
                  netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toLocaleString()} ر.س
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
                  placeholder="بحث بالمرجع أو الوصف..."
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
                {Object.entries(transactionTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 arabic-text">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(transactionStatuses).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="arabic-text" onClick={resetForm}>
                  <Plus className="ml-2 h-4 w-4" />
                  معاملة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {editingTransaction ? 'تعديل معاملة' : 'إنشاء معاملة جديدة'}
                  </DialogTitle>
                  <DialogDescription className="arabic-text">
                    {editingTransaction ? 'تعديل معلومات المعاملة المالية' : 'إضافة معاملة مالية جديدة إلى النظام'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reference" className="arabic-text">المرجع</Label>
                        <Input
                          id="reference"
                          value={formData.reference}
                          onChange={(e) => setFormData({...formData, reference: e.target.value})}
                          className="arabic-text"
                          placeholder="TRX-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="arabic-text">النوع</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger className="arabic-text">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(transactionTypes).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="arabic-text">المبلغ</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                          className="arabic-text"
                          required
                        />
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountId" className="arabic-text">الحساب</Label>
                      <Select value={formData.accountId} onValueChange={(value) => setFormData({...formData, accountId: value})}>
                        <SelectTrigger className="arabic-text">
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="arabic-text">التاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start arabic-text text-right">
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {formData.date ? format(new Date(formData.date), 'PPP', { locale: arSA }) : 'اختر التاريخ'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(formData.date)}
                            onSelect={(date) => {
                              if (date) {
                                setFormData({...formData, date: date.toISOString().split('T')[0]});
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="arabic-text">الحالة</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="arabic-text">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(transactionStatuses).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="arabic-text">الوصف</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="arabic-text"
                        placeholder="وصف المعاملة..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="arabic-text">
                      {editingTransaction ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">قائمة المعاملات</CardTitle>
              <CardDescription className="arabic-text">
                جميع المعاملات المالية في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">المرجع</TableHead>
                      <TableHead className="arabic-text">الوصف</TableHead>
                      <TableHead className="arabic-text">النوع</TableHead>
                      <TableHead className="arabic-text text-right">المبلغ</TableHead>
                      <TableHead className="arabic-text">الحساب</TableHead>
                      <TableHead className="arabic-text">الحالة</TableHead>
                      <TableHead className="arabic-text">التاريخ</TableHead>
                      <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono arabic-text">{transaction.reference}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium arabic-text">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground arabic-text">
                              {transaction.userName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            transaction.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }>
                            {transaction.type === 'INCOME' ? (
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="ml-1 h-3 w-3" />
                            )}
                            {transactionTypes[transaction.type as keyof typeof transactionTypes]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`font-bold arabic-text ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
                          </div>
                        </TableCell>
                        <TableCell className="arabic-text">{transaction.accountName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            <span className="mr-1">
                              {transactionStatuses[transaction.status as keyof typeof transactionStatuses]}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="arabic-text">
                          {new Date(transaction.date).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
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