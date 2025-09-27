"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, HelpCircle, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: username, 2: questions, 3: new password
  const [formData, setFormData] = useState({
    username: "",
    answers: ["", "", "", "", ""],
    newPassword: "",
    confirmPassword: ""
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/forgot-password?username=${formData.username}`);
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
        setStep(2);
      } else {
        setError(data.error || "فشل في العثور على المستخدم");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          answers: formData.answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
      } else {
        setError(data.error || "إجابات غير صحيحة");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("تم تغيير كلمة المرور بنجاح! سيتم نقلك إلى صفحة تسجيل الدخول...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || "فشل في تغيير كلمة المرور");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="andalusian-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-[#1e4b3d]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1e4b3d]">
              استرجاع كلمة المرور
            </CardTitle>
            <CardDescription>
              {step === 1 && "أدخل اسم المستخدم للبدء"}
              {step === 2 && "أجب عن الأسئلة الأمنية"}
              {step === 3 && "أدخل كلمة المرور الجديدة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Username */}
            {step === 1 && (
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-right block">اسم المستخدم أو البريد الإلكتروني</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="text-right"
                    placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
                >
                  {loading ? "جاري التحقق..." : "التالي"}
                </Button>
              </form>
            )}

            {/* Step 2: Security Questions */}
            {step === 2 && (
              <form onSubmit={handleQuestionsSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">أجب عن الأسئلة الأمنية التي حددتها سابقاً</p>
                </div>

                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-right block flex items-center">
                      <HelpCircle className="h-4 w-4 ml-2" />
                      {question.question}
                    </Label>
                    <Input
                      type="text"
                      required
                      value={formData.answers[index]}
                      onChange={(e) => {
                        const newAnswers = [...formData.answers];
                        newAnswers[index] = e.target.value;
                        setFormData({...formData, answers: newAnswers});
                      }}
                      className="text-right"
                      placeholder="أدخل الإجابة"
                    />
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 ml-2" />
                    رجوع
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
                  >
                    {loading ? "جاري التحقق..." : "تحقق"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-right block">كلمة المرور الجديدة</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="text-right"
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-right block">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="text-right"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    كلمة المرور يجب أن تكون 8 أحرف على الأقل
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
                >
                  {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </form>
            )}

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-center space-x-reverse space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-[#1e4b3d] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > stepNumber ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-2 space-x-reverse space-x-4 text-xs text-gray-600">
                <span>اسم المستخدم</span>
                <span>الأسئلة الأمنية</span>
                <span>كلمة المرور</span>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Back to Login */}
            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/login')}
                className="text-[#1e4b3d] hover:text-[#2d5f4f] text-sm"
              >
                رجوع إلى تسجيل الدخول
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}