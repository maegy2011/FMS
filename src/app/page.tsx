'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Building2, Users, TrendingUp, FileText, Shield, Key, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [captcha, setCaptcha] = useState<{ sessionId: string; question: string; expiresAt: string } | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if this is first installation
    checkFirstInstallation()
    loadCaptcha()
  }, [])

  const checkFirstInstallation = async () => {
    try {
      const response = await fetch('/api/auth/check-install')
      const data = await response.json()
      setShowInstall(data.needsInstall)
    } catch (error) {
      console.error('Error checking installation:', error)
    }
  }

  const loadCaptcha = async () => {
    try {
      const response = await fetch('/api/auth/captcha')
      const data = await response.json()
      setCaptcha(data)
    } catch (error) {
      console.error('Error loading captcha:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const captchaAnswer = formData.get('captcha') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          captchaToken: captcha?.sessionId,
          captchaAnswer
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'مرحباً بك في نظام الإدارة المالية',
        })
        window.location.href = '/dashboard'
      } else {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: data.error,
          variant: 'destructive',
        })
        loadCaptcha()
      }
    } catch (error) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'يرجى التحقق من اتصال الإنترنت',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen egyptian-pattern">
      {/* Header */}
      <header className="egyptian-header backdrop-blur-sm border-b border-egyptian-gold/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-egyptian-gold to-egyptian-sand rounded-xl flex items-center justify-center egyptian-glow egyptian-border egyptian-motif">
                <Building2 className="w-7 h-7 text-egyptian-stone" />
              </div>
              <div>
                <h1 className="text-2xl font-bold egyptian-gold">نظام الإدارة المالية</h1>
                <p className="text-sm text-muted-foreground font-medium">FMS | الطراز المصري الإسلامي</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="egyptian-border egyptian-gold text-egyptian-gold">
                <Shield className="w-3 h-3 ml-1" />
                نظام آمن
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome */}
          <div className="space-y-6">
            <div className="text-center lg:text-right">
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 egyptian-gold">
                مرحباً بك في نظام الإدارة المالية
              </h2>
              <p className="text-xl text-muted-foreground mb-8 font-medium">
                نظام متكامل لإدارة الإيرادات المالية بالطراز المصري الإسلامي الحديث
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="egyptian-card egyptian-border egyptian-corner">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold egyptian-gold">
                    <div className="w-10 h-10 bg-gradient-to-br from-egyptian-gold/20 to-egyptian-blue/20 rounded-lg flex items-center justify-center egyptian-border">
                      <TrendingUp className="w-6 h-6 text-egyptian-gold" />
                    </div>
                    إدارة الإيرادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    متابعة وتحصيل الإيرادات المالية بكفاءة عالية
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="egyptian-card egyptian-border egyptian-corner">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold egyptian-gold">
                    <div className="w-10 h-10 bg-gradient-to-br from-egyptian-gold/20 to-egyptian-blue/20 rounded-lg flex items-center justify-center egyptian-border">
                      <Users className="w-6 h-6 text-egyptian-gold" />
                    </div>
                    إدارة الجهات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    تنظيم الجهات الرئيسية والتابعة والعاملين
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="egyptian-card egyptian-border egyptian-corner">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold egyptian-gold">
                    <div className="w-10 h-10 bg-gradient-to-br from-egyptian-gold/20 to-egyptian-blue/20 rounded-lg flex items-center justify-center egyptian-border">
                      <FileText className="w-6 h-6 text-egyptian-gold" />
                    </div>
                    التقارير المالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    تقارير متقدمة وتحليلات إحصائية شاملة
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="egyptian-card egyptian-border egyptian-corner">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold egyptian-gold">
                    <div className="w-10 h-10 bg-gradient-to-br from-egyptian-gold/20 to-egyptian-blue/20 rounded-lg flex items-center justify-center egyptian-border">
                      <Key className="w-6 h-6 text-egyptian-gold" />
                    </div>
                    أمان متقدم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base font-medium">
                    حماية متعددة الطبقات مع التحقق المتقدم
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Installation Notice */}
            {showInstall && (
              <Alert className="egyptian-card egyptian-border border-amber-300/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-950/50">
                <AlertDescription className="text-center font-medium">
                  هذا أول تثبيت للنظام. يرجى إنشاء حساب مدير النظام أولاً.
                  <Link href="/install" className="block mt-3">
                    <Button className="w-full egyptian-button" variant="outline">
                      ابدأ التثبيت
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Side - Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="egyptian-card egyptian-border egyptian-corner egyptian-glow p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-bold egyptian-gold mb-3">تسجيل الدخول</CardTitle>
                <CardDescription className="text-lg font-medium">
                  أدخل بيانات الاعتماد للوصول إلى النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-lg font-medium">اسم المستخدم</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="text-right text-lg py-3 egyptian-border"
                      placeholder="أدخل اسم المستخدم"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-lg font-medium">كلمة المرور</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="text-right text-lg py-3 egyptian-border"
                      placeholder="أدخل كلمة المرور"
                    />
                  </div>

                  {captcha && (
                    <div className="space-y-3">
                      <Label htmlFor="captcha" className="text-lg font-medium">رمز التحقق</Label>
                      <div className="bg-muted p-4 rounded-lg text-center font-mono text-xl egyptian-border egyptian-gold font-bold">
                        {captcha.question}
                      </div>
                      <Input
                        id="captcha"
                        name="captcha"
                        type="text"
                        required
                        className="text-right text-lg py-3 egyptian-border"
                        placeholder="أدخل الإجابة"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full egyptian-button text-lg py-4 font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link href="/forgot-password" className="text-lg text-egyptian-gold hover:underline font-medium">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="egyptian-header backdrop-blur-sm border-t border-egyptian-gold/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground font-medium">
              © 2024 نظام الإدارة المالية | FMS. جميع الحقوق محفوظة.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              مصمم بالطراز المصري الإسلامي الحديث
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}