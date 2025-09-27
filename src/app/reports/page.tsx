"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportData {
  type: string;
  year: number;
  data: any[];
  summary: {
    totalIncome: number;
    totalTransactions: number;
    [key: string]: any;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportType, setReportType] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    checkAuth();
    fetchReport();
  }, [reportType, selectedYear]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/reports?type=${reportType}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('فشل في جلب التقرير');
      }
    } catch (error) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const csvContent = generateCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_${reportType}_${selectedYear}.csv`;
    link.click();
  };

  const generateCSV = (data: ReportData) => {
    let csv = '';
    
    if (data.type === 'monthly') {
      csv = 'الشهر,إجمالي الإيرادات,عدد المعاملات\n';
      data.data.forEach((item: any) => {
        csv += `${item.monthName},${item.totalIncome},${item.transactionCount}\n`;
      });
    } else if (data.type === 'category') {
      csv = 'الفئة,إجمالي الإيرادات,عدد المعاملات\n';
      data.data.forEach((item: any) => {
        csv += `${item.categoryName},${item.totalIncome},${item.transactionCount}\n`;
      });
    } else if (data.type === 'entity') {
      csv = 'الجهة,النوع,إجمالي الإيرادات,عدد المعاملات\n';
      data.data.forEach((item: any) => {
        csv += `${item.entityName},${item.entityTypeName},${item.totalIncome},${item.transactionCount}\n`;
      });
    } else if (data.type === 'yearly') {
      csv = 'السنة,إجمالي الإيرادات,عدد المعاملات\n';
      data.data.forEach((item: any) => {
        csv += `${item.year},${item.totalIncome},${item.transactionCount}\n`;
      });
    } else if (data.type === 'comparison') {
      csv = 'الشهر,السنة الحالية,السنة السابقة,الفرق,نسبة التغيير\n';
      data.data.forEach((item: any) => {
        csv += `${item.monthName},${item.currentYear},${item.previousYear},${item.difference},${item.changePercentage}%\n`;
      });
    }
    
    // Add summary
    csv += '\n,الملخص,\n';
    csv += `إجمالي الإيرادات,${data.summary.totalIncome}\n`;
    csv += `إجمالي المعاملات,${data.summary.totalTransactions}\n`;
    
    return csv;
  };

  const renderReportChart = () => {
    if (!reportData) return null;

    const maxValue = Math.max(...reportData.data.map((item: any) => item.totalIncome));
    
    return (
      <div className="space-y-4">
        {reportData.data.map((item: any, index: number) => {
          const percentage = (item.totalIncome / maxValue) * 100;
          const barColor = index % 2 === 0 ? 'bg-[#1e4b3d]' : 'bg-[#d4af37]';
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {reportData.type === 'monthly' ? item.monthName :
                   reportData.type === 'category' ? item.categoryName :
                   item.entityName}
                </span>
                <span className="text-sm text-gray-600">
                  {item.totalIncome.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${barColor} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>عدد المعاملات: {item.transactionCount}</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getReportTitle = () => {
    const titles: { [key: string]: string } = {
      'monthly': 'تقرير الإيرادات الشهري',
      'category': 'تقرير الإيرادات حسب الفئة',
      'entity': 'تقرير الإيرادات حسب الجهة',
      'yearly': 'تقرير الإيرادات السنوي',
      'comparison': 'تقرير المقارنة الشهرية'
    };
    return titles[reportType] || 'تقرير';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern">
      {/* Header */}
      <header className="bg-[#1e4b3d] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="bg-[#d4af37] p-2 rounded-full">
                <BarChart3 className="h-6 w-6 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">التقارير والإحصائيات</h1>
                <p className="text-[#fefcf8]/80 text-sm">نظام الإدارة المالية</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="text-white hover:text-[#d4af37]"
              >
                رجوع
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Report Controls */}
        <Card className="mb-8 andalusian-border">
          <CardHeader>
            <CardTitle className="text-[#1e4b3d]">إعدادات التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  نوع التقرير
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">تقرير شهري</SelectItem>
                    <SelectItem value="category">حسب الفئة</SelectItem>
                    <SelectItem value="entity">حسب الجهة</SelectItem>
                    <SelectItem value="yearly">تقرير سنوي</SelectItem>
                    <SelectItem value="comparison">مقارنة شهرية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  السنة
                </label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={fetchReport}
                  disabled={loading}
                  className="bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
                >
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
                {reportData && (
                  <Button 
                    onClick={exportReport}
                    variant="outline"
                    className="border-[#d4af37] text-[#1e4b3d]"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تصدير
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-500 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Report Content */}
        {reportData && (
          <div className="space-y-8">
            {/* Report Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e4b3d] flex items-center">
                  <Calendar className="h-6 w-6 ml-2" />
                  {getReportTitle()} - {selectedYear}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <DollarSign className="h-12 w-12 mx-auto text-[#d4af37] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1e4b3d]">إجمالي الإيرادات</h3>
                  <p className="text-2xl font-bold text-[#1e4b3d]">
                    {reportData.summary.totalIncome.toLocaleString('ar-SA')} ر.س
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <FileText className="h-12 w-12 mx-auto text-[#1e4b3d] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1e4b3d]">إجمالي المعاملات</h3>
                  <p className="text-2xl font-bold text-[#1e4b3d]">
                    {reportData.summary.totalTransactions}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 mx-auto text-[#8b4513] mb-4" />
                  <h3 className="text-lg font-semibold text-[#1e4b3d]">متوسط الإيرادات</h3>
                  <p className="text-2xl font-bold text-[#1e4b3d]">
                    {Math.round(reportData.summary.totalIncome / reportData.summary.totalTransactions).toLocaleString('ar-SA')} ر.س
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e4b3d] flex items-center">
                  <BarChart3 className="h-6 w-6 ml-2" />
                  عرض بياني
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderReportChart()}
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1e4b3d] flex items-center">
                  {reportData.type === 'monthly' ? <Calendar className="h-6 w-6 ml-2" /> :
                   reportData.type === 'category' ? <PieChart className="h-6 w-6 ml-2" /> :
                   <Building2 className="h-6 w-6 ml-2" />}
                  التفاصيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 font-semibold">
                          {reportData.type === 'monthly' ? 'الشهر' :
                           reportData.type === 'category' ? 'الفئة' :
                           'الجهة'}
                        </th>
                        <th className="p-3 font-semibold">إجمالي الإيرادات</th>
                        <th className="p-3 font-semibold">عدد المعاملات</th>
                        <th className="p-3 font-semibold">النسبة المئوية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((item: any, index: number) => {
                        const percentage = reportData.summary.totalIncome > 0 
                          ? (item.totalIncome / reportData.summary.totalIncome) * 100 
                          : 0;
                        
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              {reportData.type === 'monthly' ? item.monthName :
                               reportData.type === 'category' ? item.categoryName :
                               `${item.entityName} (${item.entityTypeName})`}
                            </td>
                            <td className="p-3">
                              <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                                {item.totalIncome.toLocaleString('ar-SA')} ر.س
                              </Badge>
                            </td>
                            <td className="p-3">{item.transactionCount}</td>
                            <td className="p-3">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}