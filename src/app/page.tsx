'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/auth/login-form';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/responsive-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold arabic-text mb-2">
              نظام الإدارة المالية
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground arabic-text">
              نظام متكامل لإدارة الشؤون المالية بتصميم عربي إسلامي حديث
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
        <Header 
          title="مرحباً بك في نظام الإدارة المالية"
          subtitle="إدارة شؤونك المالية بسهولة وفعالية"
        />
        <main className="flex-1 overflow-y-auto">
          <ResponsiveContainer>
            <div className="space-y-6 p-4 lg:p-6">
              {/* Key Metrics */}
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6}>
                <Card className="islamic-pattern">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text">
                      إجمالي الأصول
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold arabic-text">60,000 ر.س</div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      +20% من الشهر الماضي
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="islamic-pattern">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text">
                      الإيرادات الشهرية
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold arabic-text">15,000 ر.س</div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      +15% من الشهر الماضي
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="islamic-pattern">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text">
                      المصروفات الشهرية
                    </CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold arabic-text">8,000 ر.س</div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      -5% من الشهر الماضي
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="islamic-pattern">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium arabic-text">
                      صافي الربح
                    </CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold arabic-text">7,000 ر.س</div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      +25% من الشهر الماضي
                    </p>
                  </CardContent>
                </Card>
              </ResponsiveGrid>

              {/* Recent Transactions and Accounts */}
              <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text">آخر المعاملات</CardTitle>
                    <CardDescription className="arabic-text">
                      أحدث المعاملات المالية في النظام
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto rtl-scroll">
                      {[
                        { id: 1, description: 'إيراد من المبيعات', amount: 5000, type: 'income', date: '2024-01-15' },
                        { id: 2, description: 'إيجار المكتب', amount: 2000, type: 'expense', date: '2024-01-14' },
                        { id: 3, description: 'شراء معدات', amount: 1500, type: 'expense', date: '2024-01-13' },
                        { id: 4, description: 'خدمات استشارية', amount: 3000, type: 'income', date: '2024-01-12' },
                      ].map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
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
                            <div className="min-w-0">
                              <p className="font-medium arabic-text truncate">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground arabic-text">
                                {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold arabic-text flex-shrink-0 ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} ر.س
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text">الحسابات الرئيسية</CardTitle>
                    <CardDescription className="arabic-text">
                      نظرة عامة على الحسابات المالية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto rtl-scroll">
                      {[
                        { name: 'الصندوق', balance: 10000, type: 'asset' },
                        { name: 'حساب البنك', balance: 50000, type: 'asset' },
                        { name: 'الإيرادات', balance: 0, type: 'revenue' },
                        { name: 'المصروفات', balance: 0, type: 'expense' },
                      ].map((account) => (
                        <div key={account.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                              <Wallet className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium arabic-text truncate">{account.name}</p>
                              <p className="text-sm text-muted-foreground arabic-text">
                                {account.type === 'asset' ? 'أصل' : account.type === 'revenue' ? 'إيراد' : 'مصروف'}
                              </p>
                            </div>
                          </div>
                          <div className="font-bold arabic-text flex-shrink-0">
                            {account.balance.toLocaleString()} ر.س
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ResponsiveGrid>

              {/* Quick Actions and System Status */}
              <ResponsiveGrid cols={{ default: 1, lg: 3 }} gap={6}>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="arabic-text">الإجراءات السريعة</CardTitle>
                    <CardDescription className="arabic-text">
                      الوصول السريع إلى الوظائف الشائعة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveGrid cols={{ default: 2, sm: 4 }} gap={4}>
                      <Button className="h-16 sm:h-20 flex-col gap-2 arabic-text" variant="outline">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-xs sm:text-sm">معاملة جديدة</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-2 arabic-text" variant="outline">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-xs sm:text-sm">تقرير جديد</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-2 arabic-text" variant="outline">
                        <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-xs sm:text-sm">حساب جديد</span>
                      </Button>
                      <Button className="h-16 sm:h-20 flex-col gap-2 arabic-text" variant="outline">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-xs sm:text-sm">مستخدم جديد</span>
                      </Button>
                    </ResponsiveGrid>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text">حالة النظام</CardTitle>
                    <CardDescription className="arabic-text">
                      معلومات حول النظام والأداء
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="arabic-text text-sm">حالة الخادم</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          نشط
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="arabic-text text-sm">عدد المستخدمين</span>
                        <span className="font-bold text-sm">4</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="arabic-text text-sm">عدد الحسابات</span>
                        <span className="font-bold text-sm">4</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="arabic-text text-sm">المعاملات اليوم</span>
                        <span className="font-bold text-sm">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            </div>
          </ResponsiveContainer>
        </main>
      </div>
    </div>
  );
}