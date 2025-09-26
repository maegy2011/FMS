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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Mail,
  Phone,
  Building,
  Calendar,
  MoreHorizontal,
  Key
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

const userRoles = {
  'ADMIN': 'مدير النظام',
  'MANAGER': 'مدير',
  'ACCOUNTANT': 'محاسب',
  'VIEWER': 'مراقب'
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800';
    case 'MANAGER':
      return 'bg-blue-100 text-blue-800';
    case 'ACCOUNTANT':
      return 'bg-green-100 text-green-800';
    case 'VIEWER':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return <Shield className="h-4 w-4" />;
    case 'MANAGER':
      return <Building className="h-4 w-4" />;
    case 'ACCOUNTANT':
      return <Key className="h-4 w-4" />;
    case 'VIEWER':
      return <UserPlus className="h-4 w-4" />;
    default:
      return <UserPlus className="h-4 w-4" />;
  }
};

export default function UsersPage() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'VIEWER',
    active: true,
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@fms.com',
        name: 'مدير النظام',
        role: 'ADMIN',
        active: true,
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15',
      },
      {
        id: '2',
        email: 'manager@fms.com',
        name: 'مدير مالي',
        role: 'MANAGER',
        active: true,
        createdAt: '2024-01-02',
        lastLogin: '2024-01-14',
      },
      {
        id: '3',
        email: 'accountant@fms.com',
        name: 'محاسب',
        role: 'ACCOUNTANT',
        active: true,
        createdAt: '2024-01-03',
        lastLogin: '2024-01-13',
      },
      {
        id: '4',
        email: 'viewer@fms.com',
        name: 'مراقب',
        role: 'VIEWER',
        active: true,
        createdAt: '2024-01-04',
        lastLogin: '2024-01-12',
      },
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, active: !u.active }
        : u
    ));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'VIEWER',
      active: true,
    });
    setEditingUser(null);
  };

  const activeUsersCount = users.filter(u => u.active).length;
  const totalUsers = users.length;

  const roleDistribution = Object.entries(userRoles).map(([role, label]) => ({
    role,
    label,
    count: users.filter(u => u.role === role).length,
    percentage: totalUsers > 0 ? (users.filter(u => u.role === role).length / totalUsers) * 100 : 0
  }));

  if (!hasPermission('ADMIN')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة إدارة المستخدمين
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
          title="إدارة المستخدمين والصلاحيات"
          subtitle="إدارة حسابات المستخدمين وصلاحيات الوصول"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  إجمالي المستخدمين
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">{totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  المستخدمون النشطون
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">{activeUsersCount}</div>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text">
                  معدل النشاط
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold arabic-text">
                  {totalUsers > 0 ? Math.round((activeUsersCount / totalUsers) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="arabic-text">توزيع الأدوار</CardTitle>
              <CardDescription className="arabic-text">
                توزيع المستخدمين حسب الأدوار والصلاحيات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roleDistribution.map((item) => (
                  <div key={item.role} className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getRoleColor(item.role)}`}>
                      {getRoleIcon(item.role)}
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
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  className="pr-10 pl-10 arabic-text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48 arabic-text">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(userRoles).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="arabic-text" onClick={resetForm}>
                  <Plus className="ml-2 h-4 w-4" />
                  مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {editingUser ? 'تعديل مستخدم' : 'إنشاء مستخدم جديد'}
                  </DialogTitle>
                  <DialogDescription className="arabic-text">
                    {editingUser ? 'تعديل معلومات المستخدم' : 'إضافة مستخدم جديد إلى النظام'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="arabic-text">الاسم</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="arabic-text">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="arabic-text">الدور</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                        <SelectTrigger className="arabic-text">
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(userRoles).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="active" className="arabic-text">نشط</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="arabic-text">
                      {editingUser ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">قائمة المستخدمين</CardTitle>
              <CardDescription className="arabic-text">
                جميع المستخدمين المسجلين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">المستخدم</TableHead>
                      <TableHead className="arabic-text">البريد الإلكتروني</TableHead>
                      <TableHead className="arabic-text">الدور</TableHead>
                      <TableHead className="arabic-text">الحالة</TableHead>
                      <TableHead className="arabic-text">آخر تسجيل دخول</TableHead>
                      <TableHead className="arabic-text text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userItem.avatar} />
                              <AvatarFallback>
                                {userItem.name?.charAt(0) || userItem.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium arabic-text">{userItem.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(userItem.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="arabic-text">{userItem.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleColor(userItem.role)}>
                            {getRoleIcon(userItem.role)}
                            <span className="mr-1">
                              {userRoles[userItem.role as keyof typeof userRoles]}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userItem.active ? 'default' : 'secondary'}>
                            {userItem.active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell className="arabic-text">
                          {userItem.lastLogin 
                            ? new Date(userItem.lastLogin).toLocaleDateString('ar-SA')
                            : 'لم يسجل دخوله'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(userItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(userItem.id)}
                            >
                              {userItem.active ? 'تعطيل' : 'تفعيل'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(userItem.id)}
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