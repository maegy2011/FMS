"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  DollarSign,
  Shield,
  Calculator,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isAdminExists, setIsAdminExists] = useState(false);

  useEffect(() => {
    // Check if admin exists
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/auth/admin-exists');
      const data = await response.json();
      setIsAdminExists(data.exists);
    } catch (error) {
      console.error('Error checking admin:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern">
      {/* Header */}
      <header className="bg-[#1e4b3d] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="bg-[#d4af37] p-3 rounded-full">
                <Calculator className="h-8 w-8 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">نظام الإدارة المالية</h1>
                <p className="text-[#fefcf8]/80">FMS | Financial Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <Badge variant="secondary" className="bg-[#d4af37] text-[#1e4b3d]">
                نسخة 1.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1e4b3d] mb-4">
            مرحباً بك في نظام الإدارة المالية
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نظام متكامل لإدارة الشؤون المالية مع تصميم إسلامي أندلسي حديث
          </p>
        </div>

        {/* Action Cards */}
        {!isAdminExists ? (
          <div className="max-w-md mx-auto mb-8">
            <Card className="andalusian-border">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto text-[#1e4b3d] mb-4" />
                <CardTitle className="text-2xl text-[#1e4b3d]">تثبيت النظام</CardTitle>
                <CardDescription>
                  يبدو أن النظام لم يتم تثبيته بعد. يرجى إنشاء حساب مدير النظام للبدء.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/install">
                  <Button className="w-full bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white">
                    ابدأ التثبيت
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-8">
            <Card className="andalusian-border">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto text-[#1e4b3d] mb-4" />
                <CardTitle className="text-2xl text-[#1e4b3d]">تسجيل الدخول</CardTitle>
                <CardDescription>
                  يرجى تسجيل الدخول للوصول إلى النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button className="w-full bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white">
                    تسجيل الدخول
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 mx-auto text-[#1e4b3d] mb-4" />
              <CardTitle className="text-lg">إدارة الجهات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                إدارة الجهات الرئيسية والتابعة والعاملين
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="h-12 w-12 mx-auto text-[#d4af37] mb-4" />
              <CardTitle className="text-lg">إدارة الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                تتبع وإدارة جميع الإيرادات المالية
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 mx-auto text-[#8b4513] mb-4" />
              <CardTitle className="text-lg">دفتر الاستاذ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                تسجيل جميع الحركات المالية والقيود المحاسبية
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-[#cd853f] mb-4" />
              <CardTitle className="text-lg">التقارير</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                تقارير مالية مفصلة وتحليلات متقدمة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="bg-[#f5f5f0] border-[#d4af37]">
          <CardHeader>
            <CardTitle className="text-[#1e4b3d] flex items-center">
              <Users className="h-6 w-6 ml-2" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1e4b3d]">4</div>
                <div className="text-gray-600">أدوار المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#d4af37]">3</div>
                <div className="text-gray-600">أنواع الجهات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8b4513]">5</div>
                <div className="text-gray-600">فئات الإيرادات</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="text-center text-gray-600">
              <p>نظام آمن ومحمي بتقنيات حديثة للحفاظ على سرية البيانات المالية</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#1e4b3d] text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#fefcf8]/80">
            © 2024 نظام الإدارة المالية | FMS. جميع الحقوق محفوظة.
          </p>
          <p className="text-[#fefcf8]/60 mt-2">
            مصمم بتصميم إسلامي أندلسي حديث
          </p>
        </div>
      </footer>
    </div>
  );
}