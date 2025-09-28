'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Shield, Loader2, CheckCircle } from 'lucide-react'
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

export default function InstallPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [captcha, setCaptcha] = useState<{ sessionId: string; question: string; expiresAt: string } | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(['', '', ''])
  const [answers, setAnswers] = useState<string[]>(['', '', ''])
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    captchaAnswer: ''
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if installation is needed
    checkInstallation()
    loadCaptcha()
  }, [])

  const checkInstallation = async () => {
    try {
      const response = await fetch('/api/auth/check-install')
      const data = await response.json()
      
      if (!data.needsInstall) {
        router.push('/')
      }
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

  const handleQuestionSelect = (index: number, value: string) => {
    const newQuestions = [...selectedQuestions]
    newQuestions[index] = value
    setSelectedQuestions(newQuestions)
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = () => {
    return formData.username && 
           formData.email && 
           formData.password && 
           formData.fullName && 
           formData.password.length >= 8
  }

  const isStep2Valid = () => {
    return selectedQuestions.filter(q => q).length === 3 && answers.filter(a => a).length === 3
  }

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const adminData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      captchaToken: captcha?.sessionId,
      captchaAnswer: formData.captchaAnswer,
      securityQuestions: selectedQuestions.map((q, i) => ({
        question: q,
        answer: answers[i]
      })).filter(q => q.question && q.answer)
    }

    try {
      const response = await fetch('/api/auth/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'تم التثبيت بنجاح',
          description: 'تم إنشاء حساب مدير النظام بنجاح',
        })
        router.push('/')
      } else {
        toast({
          title: 'خطأ في التثبيت',
          description: data.error,
          variant: 'destructive',
        })
        loadCaptcha()
        setFormData(prev => ({ ...prev, captchaAnswer: '' }))
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gold-accent">تثبيت النظام</h1>
                <p className="text-sm text-muted-foreground">إنشاء حساب مدير النظام</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                    {s === 1 ? 'بيانات المدير' : s === 2 ? 'الأسئلة الأمنية' : 'التثبيت'}
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
              <CardTitle className="text-2xl gold-accent">تثبيت النظام لأول مرة</CardTitle>
              <CardDescription>
                يرجى إنشاء حساب مدير النظام للبدء في استخدام النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInstall} className="space-y-6">
                {/* Step 1: Admin Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        className="text-right"
                        placeholder="أدخل الاسم الكامل"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                      {formData.fullName && formData.fullName.length < 2 && (
                        <p className="text-sm text-red-500">الاسم الكامل يجب أن يكون حرفين على الأقل</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">اسم المستخدم</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="text-right"
                        placeholder="أدخل اسم المستخدم"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                      {formData.username && formData.username.length < 3 && (
                        <p className="text-sm text-red-500">اسم المستخدم يجب أن يكون 3 أحرف على الأقل</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="text-right"
                        placeholder="أدخل البريد الإلكتروني"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <p className="text-sm text-red-500">صيغة البريد الإلكتروني غير صحيحة</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        className="text-right"
                        placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      {formData.password && formData.password.length < 8 && (
                        <p className="text-sm text-red-500">كلمة المرور يجب أن تكون 8 أحرف على الأقل</p>
                      )}
                    </div>

                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid()}
                    >
                      التالي
                    </Button>
                  </div>
                )}

                {/* Step 2: Security Questions */}
                {step === 2 && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription className="text-center">
                        يرجى اختيار 3 أسئلة أمان مختلفة والإجابة عليها. ستستخدم هذه الأسئلة لاسترجاع كلمة المرور.
                      </AlertDescription>
                    </Alert>

                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>السؤال الأمني {index + 1}</Label>
                          <Select 
                            value={selectedQuestions[index]} 
                            onValueChange={(value) => handleQuestionSelect(index, value)}
                          >
                            <SelectTrigger className="text-right">
                              <SelectValue placeholder="اختر سؤالاً أمنياً" />
                            </SelectTrigger>
                            <SelectContent>
                              {securityQuestions
                                .filter(q => !selectedQuestions.includes(q.value) || selectedQuestions[index] === q.value)
                                .map((question) => (
                                  <SelectItem key={question.value} value={question.value}>
                                    {question.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedQuestions[index] && (
                          <div className="space-y-2">
                            <Label>الإجابة</Label>
                            <Input
                              type="text"
                              value={answers[index]}
                              onChange={(e) => handleAnswerChange(index, e.target.value)}
                              className="text-right"
                              placeholder="أدخل الإجابة"
                            />
                          </div>
                        )}
                      </div>
                    ))}

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
                        type="button" 
                        className="flex-1"
                        onClick={() => setStep(3)}
                        disabled={!isStep2Valid()}
                      >
                        التالي
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Final Confirmation */}
                {step === 3 && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription className="text-center">
                        تأكد من صحة جميع البيانات قبل التثبيت. بعد التثبيت، لن تتمكن من الوصول إلى هذه الصفحة مرة أخرى.
                      </AlertDescription>
                    </Alert>

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
                          value={formData.captchaAnswer}
                          onChange={(e) => handleInputChange('captchaAnswer', e.target.value)}
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
                        disabled={isLoading || !formData.captchaAnswer}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري التثبيت...
                          </>
                        ) : (
                          'تثبيت النظام'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}