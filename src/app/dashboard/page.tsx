"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2, 
  FileText,
  BarChart3,
  Plus,
  LogOut,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardStats {
  totalIncome: number;
  totalEntities: number;
  monthlyIncome: number;
  recentTransactions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalEntities: 0,
    monthlyIncome: 0,
    recentTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'SYSTEM_ADMIN': 'مدير النظام',
      'MANAGER': 'مدير',
      'ACCOUNTANT': 'محاسب',
      'AUDITOR': 'مراقب'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b3d] mx-auto"></div>
          <p className="mt-4 text-[#1e4b3d]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern">
      {/* Header */}
      <header className="bg-[#1e4b3d] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="bg-[#d4af37] p-2 rounded-full">
                <DollarSign className="h-6 w-6 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">لوحة التحكم</h1>
                <p className="text-[#fefcf8]/80 text-sm">نظام الإدارة المالية</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="text-left">
                <p className="font-medium">{user?.name}</p>
                <p className="text-[#fefcf8]/80 text-sm">{getRoleDisplayName(user?.role || '')}</p>
              </div>
              <div className="flex space-x-reverse space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/settings')}
                  className="text-white hover:text-[#d4af37]"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-[#d4af37]"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#1e4b3d] mb-2">
            مرحباً، {user?.name}
          </h2>
          <p className="text-gray-600">
            آخر تسجيل دخول: {new Date().toLocaleDateString('ar-SA')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="h-12 w-12 mx-auto text-[#d4af37] mb-4" />
              <CardTitle className="text-lg">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1e4b3d]">
                {stats.totalIncome.toLocaleString('ar-SA')} ر.س
              </div>
              <p className="text-gray-600 text-sm">الإجمالي</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 mx-auto text-[#1e4b3d] mb-4" />
              <CardTitle className="text-lg">الجهات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1e4b3d]">
                {stats.totalEntities}
              </div>
              <p className="text-gray-600 text-sm">إجمالي الجهات</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto text-[#8b4513] mb-4" />
              <CardTitle className="text-lg">إيرادات الشهر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1e4b3d]">
                {stats.monthlyIncome.toLocaleString('ar-SA')} ر.س
              </div>
              <p className="text-gray-600 text-sm">لهذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 mx-auto text-[#cd853f] mb-4" />
              <CardTitle className="text-lg">المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1e4b3d]">
                {stats.recentTransactions}
              </div>
              <p className="text-gray-600 text-sm">المعاملات الأخيرة</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[#1e4b3d] flex items-center">
              <Plus className="h-6 w-6 ml-2" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/income/add')}
                className="bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
              >
                <DollarSign className="h-4 w-4 ml-2" />
                إضافة إيراد جديد
              </Button>
              
              <Button 
                onClick={() => router.push('/entities/add')}
                className="bg-[#d4af37] hover:bg-[#daa520] text-[#1e4b3d]"
              >
                <Building2 className="h-4 w-4 ml-2" />
                إضافة جهة جديدة
              </Button>
              
              <Button 
                onClick={() => router.push('/reports')}
                className="bg-[#8b4513] hover:bg-[#a0522d] text-white"
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                عرض التقارير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e4b3d]">آخر الإيرادات</CardTitle>
              <CardDescription>أحدث 5 إيرادات مسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">إيراد خدمة</p>
                    <p className="text-sm text-gray-600">15/01/2024</p>
                  </div>
                  <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                    1,500 ر.س
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">راتب موظف</p>
                    <p className="text-sm text-gray-600">14/01/2024</p>
                  </div>
                  <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                    3,000 ر.س
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">إيجار</p>
                    <p className="text-sm text-gray-600">13/01/2024</p>
                  </div>
                  <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                    2,000 ر.س
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e4b3d]">الجهات النشطة</CardTitle>
              <CardDescription>أهم الجهات المسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">شركة الأمل</p>
                    <p className="text-sm text-gray-600">جهة رئيسية</p>
                  </div>
                  <Badge variant="outline">نشط</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">محل التجارة</p>
                    <p className="text-sm text-gray-600">جهة تابعة</p>
                  </div>
                  <Badge variant="outline">نشط</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg">
                  <div>
                    <p className="font-medium">أحمد محمد</p>
                    <p className="text-sm text-gray-600">عامل</p>
                  </div>
                  <Badge variant="outline">نشط</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}