'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Key, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const securityQuestions = [
  { value: 'PLACE_OF_BIRTH', label: 'مكان الولادة' },
  { value: 'MOTHER_NAME', label: 'اسم الأم' },
  { value: 'FIRST_SCHOOL', label: 'أول مدرسة درست فيها' },
  { value: 'FAVORITE_COLOR', label: 'لونك المفضل' },
  { value: 'CHILDHOOD_FRIEND', label: 'اسم صديق الطفولة' },
  { value: 'GRADUATION_YEAR', label: 'سنة التخرج' },
  { value: 'FIRST_CAR', label: 'أول سيارة امتلكتها' },
  { value: 'FAVORITE_TEACHER', label: 'اسم معلمك المفضل' },
  { value: 'BIRTH_CITY', label: 'مدينة الولادة' },
  { value: 'GRANDFATHER_NAME', label: 'اسم الجد' }
]

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [captcha, setCaptcha] = useState<{ sessionId: string; question: string; expiresAt: string } | null>(null)
  const [username, setUsername] = useState('')
  const [step, setStep] = useState(1)
  const [userQuestions, setUserQuestions] = useState<Array<{ question: string; answer: string }>>([])
  const [answers, setAnswers] = useState<string[]>(['', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadCaptcha()
  }, [])

  const loadCaptcha = async () => {
    try {
      const response = await fetch('/api/auth/captcha')
      const data = await response.json()
      setCaptcha(data)
    } catch (error) {
      console.error('Error loading captcha:', error)
    }
  }

  const handleCheckUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/user-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          captchaToken: captcha?.sessionId,
          captchaAnswer: new FormData(e.target as HTMLFormElement).get('captcha') as string
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setUserQuestions(data.questions)
        setAnswers(['', '', ''])
        setStep(2)
        toast({
          title: 'تم العثور على المستخدم',
          description: 'يرجى الإجابة على الأسئلة الأمنية',
        })
      } else {
        toast({
          title: 'خطأ',
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

  const handleVerifyAnswers = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          answers: userQuestions.map((q, i) => ({
            question: q.question,
            answer: answers[i]
          })),
          captchaToken: captcha?.sessionId,
          captchaAnswer: new FormData(e.target as HTMLFormElement).get('captcha') as string
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setStep(3)
        toast({
          title: 'تم التحقق بنجاح',
          description: 'يمكنك الآن تعيين كلمة مرور جديدة',
        })
      } else {
        toast({
          title: 'خطأ في التحقق',
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'خطأ',
        description: 'كلمتا المرور غير متطابقتين',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          securityAnswers: userQuestions.map((q, i) => ({
            question: q.question,
            answer: answers[i]
          })),
          newPassword,
          captchaToken: captcha?.sessionId,
          captchaAnswer: new FormData(e.target as HTMLFormElement).get('captcha') as string
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تم إعادة تعيين كلمة المرور',
          description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
        })
        router.push('/')
      } else {
        toast({
          title: 'خطأ',
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
      <header className="bg-white/80 dark:bg/black/80 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-amber-500 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">استرجاع كلمة المرور</h1>
                <p className="text-sm text-muted-foreground">إعادة تعيين كلمة المرور</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {s <= step ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-sm ${
                    s <= step ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {s === 1 ? 'اسم المستخدم' : s === 2 ? 'الأسئلة الأمنية' : 'كلمة المرور'}
                  </span>
                  {s < 3 && (
                    <div className={`w-16 h-1 ${
                      s < step ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="andalusian-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gold-accent">استرجاع كلمة المرور</CardTitle>
              <CardDescription>
                اتبع الخطوات التالية لإعادة تعيين كلمة المرور
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Username */}
              {step === 1 && (
                <form onSubmit={handleCheckUsername} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="text-right"
                      placeholder="أدخل اسم المستخدم"
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
                    disabled={isLoading || !username}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      'التالي'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: Security Questions */}
              {step === 2 && (
                <form onSubmit={handleVerifyAnswers} className="space-y-4">
                  <Alert>
                    <AlertDescription className="text-center">
                      أجب على الأسئلة الأمنية التي قمت بتعيينها عند إنشاء الحساب
                    </AlertDescription>
                  </Alert>

                  {userQuestions.map((q, index) => {
                    const questionLabel = securityQuestions.find(sq => sq.value === q.question)?.label || q.question
                    return (
                      <div key={index} className="space-y-2">
                        <Label>السؤال {index + 1}: {questionLabel}</Label>
                        <Input
                          type="text"
                          value={answers[index]}
                          onChange={(e) => {
                            const newAnswers = [...answers]
                            newAnswers[index] = e.target.value
                            setAnswers(newAnswers)
                          }}
                          className="text-right"
                          placeholder="أدخل الإجابة"
                          required
                        />
                      </div>
                    )
                  })}

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

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      السابق
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isLoading || answers.some(a => !a)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري التحقق...
                        </>
                      ) : (
                        'تحقق'
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="text-right"
                      placeholder="أدخل كلمة المرور الجديدة"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="text-right"
                      placeholder="أعد إدخال كلمة المرور"
                    />
                  </div>

                  {captcha && (
                    <div className="space-y-2">
                      <Label htmlFor="captcha">رمز التحقق النهائي</Label>
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

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      السابق
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ كلمة المرور'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}