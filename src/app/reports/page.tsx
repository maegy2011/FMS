'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Target,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  data: any;
}

interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

const reportTypes = {
  'financial': 'تقرير مالي',
  'income': 'تقرير الإيرادات',
  'expense': 'تقرير المصروفات',
  'cashflow': 'تقرير التدفق النقدي',
  'balance': 'تقرير الميزانية',
  'profit_loss': 'تقرير الأرباح والخسائر'
};

const periods = {
  'daily': 'يومي',
  'weekly': 'أسبوعي',
  'monthly': 'شهري',
  'quarterly': 'ربع سنوي',
  'yearly': 'سنوي'
};

export default function ReportsPage() {
  const { user, hasPermission } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('financial');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);

  // Mock financial metrics
  const financialMetrics: FinancialMetric[] = [
    {
      title: 'إجمالي الإيرادات',
      value: '150,000 ر.س',
      change: '+15%',
      trend: 'up',
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      title: 'إجمالي المصروفات',
      value: '96,000 ر.س',
      change: '-8%',
      trend: 'down',
      icon: <TrendingDown className="h-4 w-4 text-red-600" />
    },
    {
      title: 'صافي الربح',
      value: '54,000 ر.س',
      change: '+25%',
      trend: 'up',
      icon: <DollarSign className="h-4 w-4 text-blue-600" />
    },
    {
      title: 'هامش الربح',
      value: '36%',
      change: '+5%',
      trend: 'up',
      icon: <Target className="h-4 w-4 text-purple-600" />
    }
  ];

  // Mock chart data
  const chartData = {
    revenue: [
      { month: 'يناير', value: 12000 },
      { month: 'فبراير', value: 15000 },
      { month: 'مارس', value: 18000 },
      { month: 'أبريل', value: 14000 },
      { month: 'مايو', value: 16000 },
      { month: 'يونيو', value: 20000 },
    ],
    expenses: [
      { month: 'يناير', value: 8000 },
      { month: 'فبراير', value: 9000 },
      { month: 'مارس', value: 11000 },
      { month: 'أبريل', value: 10000 },
      { month: 'مايو', value: 12000 },
      { month: 'يونيو', value: 13000 },
    ],
    profit: [
      { month: 'يناير', value: 4000 },
      { month: 'فبراير', value: 6000 },
      { month: 'مارس', value: 7000 },
      { month: 'أبريل', value: 4000 },
      { month: 'مايو', value: 4000 },
      { month: 'يونيو', value: 7000 },
    ]
  };

  // Mock category breakdown
  const categoryBreakdown = [
    { name: 'المبيعات', value: 45000, percentage: 30, color: 'bg-blue-500' },
    { name: 'الخدمات', value: 37500, percentage: 25, color: 'bg-green-500' },
    { name: 'الاستثمارات', value: 30000, percentage: 20, color: 'bg-purple-500' },
    { name: 'إيرادات أخرى', value: 22500, percentage: 15, color: 'bg-orange-500' },
    { name: 'عمولات', value: 15000, percentage: 10, color: 'bg-red-500' },
  ];

  const expenseBreakdown = [
    { name: 'الرواتب', value: 36000, percentage: 37.5, color: 'bg-red-500' },
    { name: 'الإيجار', value: 24000, percentage: 25, color: 'bg-blue-500' },
    { name: 'المستلزمات', value: 18000, percentage: 18.75, color: 'bg-green-500' },
    { name: 'التسويق', value: 12000, percentage: 12.5, color: 'bg-purple-500' },
    { name: 'أخرى', value: 6000, percentage: 6.25, color: 'bg-orange-500' },
  ];

  useEffect(() => {
    // Mock reports data
    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'التقرير المالي الشهري',
        type: 'financial',
        period: 'monthly',
        generatedAt: '2024-01-31',
        data: { totalRevenue: 15000, totalExpenses: 8000, netProfit: 7000 }
      },
      {
        id: '2',
        title: 'تقرير الإيرادات الربع سنوي',
        type: 'income',
        period: 'quarterly',
        generatedAt: '2024-03-31',
        data: { totalRevenue: 45000, growth: 15 }
      },
      {
        id: '3',
        title: 'تقرير المصروفات الشهري',
        type: 'expense',
        period: 'monthly',
        generatedAt: '2024-01-31',
        data: { totalExpenses: 8000, categories: ['رواتب', 'إيجار', 'مستلزمات'] }
      }
    ];

    setReports(mockReports);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: ReportData = {
      id: Date.now().toString(),
      title: `${reportTypes[selectedReport as keyof typeof reportTypes]} - ${periods[selectedPeriod as keyof typeof periods]}`,
      type: selectedReport,
      period: selectedPeriod,
      generatedAt: new Date().toISOString().split('T')[0],
      data: { generated: true }
    };

    setReports([newReport, ...reports]);
    setLoading(false);
  };

  const downloadReport = (reportId: string) => {
    // Simulate download
    alert('جاري تحميل التقرير...');
  };

  if (!hasPermission('MANAGER')) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="arabic-text text-center">غير مصرح بالوصول</CardTitle>
              <CardDescription className="arabic-text text-center">
                ليس لديك صلاحية للوصول إلى صفحة التقارير والإحصائيات
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
          title="التقارير والإحصائيات"
          subtitle="تحليل الأداء المالي وإنشاء التقارير"
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {financialMetrics.map((metric, index) => (
              <Card key={index} className="islamic-pattern">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium arabic-text">
                    {metric.title}
                  </CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold arabic-text">{metric.value}</div>
                  <p className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change} من الفترة السابقة
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="arabic-text">إنشاء تقرير جديد</CardTitle>
              <CardDescription className="arabic-text">
                قم بإنشاء تقارير مالية مخصصة حسب احتياجاتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium arabic-text mb-2 block">نوع التقرير</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reportTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium arabic-text mb-2 block">الفترة</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(periods).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={generateReport} 
                  disabled={loading}
                  className="arabic-text"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <FileText className="ml-2 h-4 w-4" />
                      إنشاء تقرير
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="arabic-text">نظرة عامة</TabsTrigger>
              <TabsTrigger value="revenue" className="arabic-text">الإيرادات</TabsTrigger>
              <TabsTrigger value="expenses" className="arabic-text">المصروفات</TabsTrigger>
              <TabsTrigger value="reports" className="arabic-text">التقارير</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text">تحليل الأداء</CardTitle>
                    <CardDescription className="arabic-text">
                      مقارنة الإيرادات والمصروفات والأرباح
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text">كفاءة الإيرادات</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text">التحكم في التكاليف</span>
                          <span className="font-bold">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text">إدارة النقدية</span>
                          <span className="font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="arabic-text">معدل النمو</span>
                          <span className="font-bold">15%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text">توزيع الإيرادات</CardTitle>
                    <CardDescription className="arabic-text">
                      تحليل مصادر الإيرادات المختلفة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryBreakdown.map((category, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="arabic-text">{category.name}</span>
                            <span className="font-bold">{category.percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${category.color}`}
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground arabic-text">
                              {category.value.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">تحليل الإيرادات</CardTitle>
                  <CardDescription className="arabic-text">
                    نظرة مفصلة على الإيرادات الشهرية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">150,000</div>
                        <div className="text-sm text-muted-foreground arabic-text">إجمالي الإيرادات</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">25,000</div>
                        <div className="text-sm text-muted-foreground arabic-text">متوسط شهري</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">+15%</div>
                        <div className="text-sm text-muted-foreground arabic-text">معدل النمو</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium arabic-text">الإيرادات الشهرية</h4>
                      {chartData.revenue.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="arabic-text">{item.month}</span>
                          <span className="font-bold text-green-600">{item.value.toLocaleString()} ر.س</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">تحليل المصروفات</CardTitle>
                  <CardDescription className="arabic-text">
                    تفصيل المصروفات حسب الفئات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">96,000</div>
                        <div className="text-sm text-muted-foreground arabic-text">إجمالي المصروفات</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">16,000</div>
                        <div className="text-sm text-muted-foreground arabic-text">متوسط شهري</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">-8%</div>
                        <div className="text-sm text-muted-foreground arabic-text">تغير عن السنة</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium arabic-text">توزيع المصروفات</h4>
                      {expenseBreakdown.map((expense, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="arabic-text">{expense.name}</span>
                            <span className="font-bold">{expense.percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${expense.color}`}
                                style={{ width: `${expense.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground arabic-text">
                              {expense.value.toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">التقارير المولدة</CardTitle>
                  <CardDescription className="arabic-text">
                    قائمة بجميع التقارير التي تم إنشاؤها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium arabic-text">{report.title}</p>
                            <p className="text-sm text-muted-foreground arabic-text">
                              {periods[report.period as keyof typeof periods]} • 
                              تم الإنشاء: {new Date(report.generatedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id)}
                          >
                            <Download className="ml-2 h-4 w-4" />
                            تحميل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض
                          </Button>
                        </div>
                      </div>
                    ))}
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