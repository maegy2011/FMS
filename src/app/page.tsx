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
    <div className="min-h-screen andalusian-pattern">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">نظام الإدارة المالية</h1>
                <p className="text-sm text-muted-foreground">FMS | الإصدار 1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="islamic-border">
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
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 gold-accent">
                مرحباً بك في نظام الإدارة المالية
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                نظام متكامل لإدارة الإيرادات المالية مع تصميم أندلسي إسلامي حديث
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="islamic-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    إدارة الإيرادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    متابعة وتحصيل الإيرادات المالية بكفاءة عالية
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="islamic-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    إدارة الجهات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    تنظيم الجهات الرئيسية والتابعة والعاملين
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="islamic-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    التقارير المالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    تقارير متقدمة وتحليلات إحصائية شاملة
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="islamic-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="w-5 h-5 text-primary" />
                    أمان متقدم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    حماية متعددة الطبقات مع التحقق المتقدم
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Installation Notice */}
            {showInstall && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <AlertDescription className="text-center">
                  هذا أول تثبيت للنظام. يرجى إنشاء حساب مدير النظام أولاً.
                  <Link href="/install" className="block mt-2">
                    <Button className="w-full" variant="outline">
                      ابدأ التثبيت
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Side - Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="andalusian-glow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl gold-accent">تسجيل الدخول</CardTitle>
                <CardDescription>
                  أدخل بيانات الاعتماد للوصول إلى النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="text-right"
                      placeholder="أدخل اسم المستخدم"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="text-right"
                      placeholder="أدخل كلمة المرور"
                    />
                  </div>

                  {captcha && (
                    <div className="space-y-2">
                      <Label htmlFor="captcha">رمز التحقق</Label>
                      <div className="bg-muted p-3 rounded-lg text-center font-mono text-lg">
                        {captcha.question}
                      </div>
                      <Input
                        id="captcha"
                        name="captcha"
                        type="text"
                        required
                        className="text-right"
                        placeholder="أدخل الإجابة"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
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
      <footer className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-primary/20 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 نظام الإدارة المالية | FMS. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              مصمم بتصميم أندلسي إسلامي حديث
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}