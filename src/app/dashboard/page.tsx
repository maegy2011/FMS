'use client';

import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
  Calculator,
  Star,
  Crown,
  Gem,
  Mosque,
  Scale
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const financialData = {
    totalAssets: 60000,
    monthlyRevenue: 15000,
    monthlyExpenses: 8000,
    netProfit: 7000,
    cashFlow: 5000,
    accountsReceivable: 12000,
    accountsPayable: 5000,
    inventoryValue: 25000,
  };

  const recentTransactions = [
    { id: 1, description: 'إيراد من المبيعات', amount: 5000, type: 'income', date: '2024-01-15', status: 'completed' },
    { id: 2, description: 'إيجار المكتب', amount: 2000, type: 'expense', date: '2024-01-14', status: 'completed' },
    { id: 3, description: 'شراء معدات', amount: 1500, type: 'expense', date: '2024-01-13', status: 'pending' },
    { id: 4, description: 'خدمات استشارية', amount: 3000, type: 'income', date: '2024-01-12', status: 'completed' },
    { id: 5, description: 'رواتب الموظفين', amount: 4000, type: 'expense', date: '2024-01-11', status: 'completed' },
  ];

  const accounts = [
    { name: 'الصندوق', balance: 10000, type: 'asset', change: 5 },
    { name: 'حساب البنك', balance: 50000, type: 'asset', change: 12 },
    { name: 'الإيرادات', balance: 0, type: 'revenue', change: 0 },
    { name: 'المصروفات', balance: 0, type: 'expense', change: 0 },
    { name: 'الذمم المدينة', balance: 12000, type: 'asset', change: -3 },
    { name: 'الذمم الدائنة', balance: 5000, type: 'liability', change: 8 },
  ];

  const metrics = [
    { title: 'معدل النمو الشهري', value: '15%', change: '+3%', icon: TrendingUp, color: 'text-green-600' },
    { title: 'معدل الربحية', value: '47%', change: '+5%', icon: Target, color: 'text-blue-600' },
    { title: 'كفاءة التشغيل', value: '82%', change: '+2%', icon: Activity, color: 'text-purple-600' },
    { title: 'معدل السيولة', value: '2.5', change: '+0.3', icon: Wallet, color: 'text-orange-600' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="لوحة التحكم المالية"
          subtitle="نظرة شاملة على الأداء المالي والتحليلات المتقدمة"
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="islamic-pattern-3 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              {/* Islamic Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold arabic-display mb-2 text-shadow-arabic">
                    مرحباً بك في نظام الإدارة المالية
                  </h1>
                  <p className="text-lg arabic-text opacity-90">
                    إدارة مالية متكاملة بتصميم إسلامي عصري
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Mosque className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="islamic-pattern-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              {/* Islamic Decorative Corner */}
              <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
                <div className="w-full h-full border-2 border-white rounded-full"></div>
              </div>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text opacity-90">
                  إجمالي الأصول
                </CardTitle>
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Gem className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold arabic-display">
                  {financialData.totalAssets.toLocaleString()} ر.س
                </div>
                <p className="text-xs arabic-text opacity-80">
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +20%
                  </span>
                  <span className="mr-2">من الشهر الماضي</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              {/* Islamic Decorative Corner */}
              <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
                <div className="w-full h-full border-2 border-white rounded-full"></div>
              </div>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text opacity-90">
                  الإيرادات الشهرية
                </CardTitle>
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold arabic-display">
                  {financialData.monthlyRevenue.toLocaleString()} ر.س
                </div>
                <p className="text-xs arabic-text opacity-80">
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +15%
                  </span>
                  <span className="mr-2">من الشهر الماضي</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              {/* Islamic Decorative Corner */}
              <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
                <div className="w-full h-full border-2 border-white rounded-full"></div>
              </div>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text opacity-90">
                  المصروفات الشهرية
                </CardTitle>
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold arabic-display">
                  {financialData.monthlyExpenses.toLocaleString()} ر.س
                </div>
                <p className="text-xs arabic-text opacity-80">
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    -5%
                  </span>
                  <span className="mr-2">من الشهر الماضي</span>
                </p>
              </CardContent>
            </Card>
            
            <Card className="islamic-pattern-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              {/* Islamic Decorative Corner */}
              <div className="absolute top-2 right-2 w-6 h-6 opacity-20">
                <div className="w-full h-full border-2 border-white rounded-full"></div>
              </div>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium arabic-text opacity-90">
                  صافي الربح
                </CardTitle>
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Scale className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold arabic-display">
                  {financialData.netProfit.toLocaleString()} ر.س
                </div>
                <p className="text-xs arabic-text opacity-80">
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +25%
                  </span>
                  <span className="mr-2">من الشهر الماضي</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold arabic-text">الوصول السريع</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/revenues">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text text-emerald-700 dark:text-emerald-300">
                      إدارة الإيرادات
                    </CardTitle>
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold arabic-text text-emerald-600 dark:text-emerald-400">
                      {financialData.monthlyRevenue.toLocaleString()} ر.س
                    </div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      الإيرادات الشهرية
                    </p>
                    <Button className="w-full mt-3 arabic-text bg-emerald-500 hover:bg-emerald-600 text-white border-0" size="sm">
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/parties">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text text-blue-700 dark:text-blue-300">
                      إدارة الجهات
                    </CardTitle>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold arabic-text text-blue-600 dark:text-blue-400">
                      6
                    </div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      إجمالي الجهات
                    </p>
                    <Button className="w-full mt-3 arabic-text bg-blue-500 hover:bg-blue-600 text-white border-0" size="sm">
                      عرض الجهات
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/accounts">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text text-purple-700 dark:text-purple-300">
                      الحسابات
                    </CardTitle>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold arabic-text text-purple-600 dark:text-purple-400">
                      {financialData.totalAssets.toLocaleString()} ر.س
                    </div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      إجمالي الأصول
                    </p>
                    <Button className="w-full mt-3 arabic-text bg-purple-500 hover:bg-purple-600 text-white border-0" size="sm">
                      عرض الحسابات
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/transactions">
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text text-orange-700 dark:text-orange-300">
                      المعاملات
                    </CardTitle>
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold arabic-text text-orange-600 dark:text-orange-400">
                      {financialData.cashFlow.toLocaleString()} ر.س
                    </div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      التدفق النقدي
                    </p>
                    <Button className="w-full mt-3 arabic-text bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm">
                      عرض المعاملات
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold arabic-text">مؤشرات الأداء</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                      metric.color === 'text-green-600' ? 'bg-green-100 text-green-600' :
                      metric.color === 'text-blue-600' ? 'bg-blue-100 text-blue-600' :
                      metric.color === 'text-purple-600' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <metric.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold arabic-text">{metric.value}</div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        {metric.change}
                      </span>
                      <span className="mr-2">من الشهر الماضي</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-md">
              <TabsTrigger value="overview" className="arabic-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="transactions" className="arabic-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                المعاملات
              </TabsTrigger>
              <TabsTrigger value="accounts" className="arabic-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                الحسابات
              </TabsTrigger>
              <TabsTrigger value="analytics" className="arabic-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                التحليلات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="arabic-text">تدفق النقدية</CardTitle>
                        <CardDescription className="arabic-text">
                          تحليل تدفق النقدية الشهري
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="arabic-text font-medium">التدفق النقدي الحالي</span>
                        <span className="font-bold text-green-600 arabic-text bg-green-100 px-3 py-1 rounded-full">
                          +{financialData.cashFlow.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={75} className="h-3" />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-30"></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="arabic-text">الهدف الشهري</span>
                        <span className="arabic-text font-medium">75%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="arabic-text">حالة الذمم</CardTitle>
                        <CardDescription className="arabic-text">
                          نظرة عامة على الذمم المدينة والدائنة
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="arabic-text font-medium">الذمم المدينة</span>
                        </div>
                        <span className="font-bold arabic-text text-green-600">
                          {financialData.accountsReceivable.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                          <span className="arabic-text font-medium">الذمم الدائنة</span>
                        </div>
                        <span className="font-bold arabic-text text-red-600">
                          {financialData.accountsPayable.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <span className="arabic-text font-medium">صافي الذمم</span>
                        <span className="font-bold text-emerald-600 arabic-text">
                          +{(financialData.accountsReceivable - financialData.accountsPayable).toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="arabic-text">آخر المعاملات</CardTitle>
                      <CardDescription className="arabic-text">
                        أحدث المعاملات المالية في النظام
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="group/item flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium arabic-text">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground arabic-text">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`font-bold arabic-text ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ر.س
                          </div>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' : 'secondary'
                          } className={
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }>
                            {transaction.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="arabic-text">الحسابات المالية</CardTitle>
                      <CardDescription className="arabic-text">
                        نظرة عامة على جميع الحسابات المالية
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.name} className="group/item flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium arabic-text">{account.name}</p>
                            <p className="text-sm text-muted-foreground arabic-text">
                              {account.type === 'asset' ? 'أصل' : 
                               account.type === 'liability' ? 'التزام' :
                               account.type === 'revenue' ? 'إيراد' : 'مصروف'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold arabic-text">
                            {account.balance.toLocaleString()} ر.س
                          </div>
                          <div className={`text-sm font-medium ${
                            account.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {account.change > 0 ? '+' : ''}{account.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="arabic-text">تحليل الأداء</CardTitle>
                        <CardDescription className="arabic-text">
                          مؤشرات الأداء الرئيسية
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text font-medium">كفاءة الإيرادات</span>
                          <span className="arabic-text font-bold text-emerald-600">85%</span>
                        </div>
                        <div className="relative">
                          <Progress value={85} className="h-2" />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-30"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text font-medium">معدل النمو</span>
                          <span className="arabic-text font-bold text-blue-600">15%</span>
                        </div>
                        <div className="relative">
                          <Progress value={75} className="h-2" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text font-medium">الربحية</span>
                          <span className="arabic-text font-bold text-purple-600">47%</span>
                        </div>
                        <div className="relative">
                          <Progress value={47} className="h-2" />
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-30"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="arabic-text">التوزيع المالي</CardTitle>
                        <CardDescription className="arabic-text">
                          تحليل توزيع الإيرادات والمصروفات
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <span className="arabic-text font-medium">الإيرادات</span>
                        <span className="font-bold arabic-text text-emerald-600">
                          {financialData.monthlyRevenue.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="arabic-text font-medium">المصروفات</span>
                        <span className="font-bold arabic-text text-red-600">
                          {financialData.monthlyExpenses.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="arabic-text font-medium">صافي الربح</span>
                        <span className="font-bold arabic-text text-blue-600">
                          {financialData.netProfit.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="arabic-text font-medium">هامش الربح</span>
                        <span className="font-bold arabic-text text-purple-600">
                          {Math.round((financialData.netProfit / financialData.monthlyRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}