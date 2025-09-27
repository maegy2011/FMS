"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Mail, Lock, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InstallPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    securityQuestions: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityQuestionChange = (index: number, field: "question" | "answer", value: string) => {
    const newSecurityQuestions = [...formData.securityQuestions];
    newSecurityQuestions[index][field] = value;
    setFormData({
      ...formData,
      securityQuestions: newSecurityQuestions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      setLoading(false);
      return;
    }

    // Validate security questions
    for (let i = 0; i < formData.securityQuestions.length; i++) {
      const sq = formData.securityQuestions[i];
      if (!sq.question.trim() || !sq.answer.trim()) {
        setError(`جميع الأسئلة والأجوبة مطلوبة (السؤال ${i + 1})`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/auth/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          securityQuestions: formData.securityQuestions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("تم إنشاء حساب مدير النظام بنجاح! سيتم نقلك إلى صفحة تسجيل الدخول...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || "فشل إنشاء حساب مدير النظام");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="andalusian-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-[#1e4b3d]" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#1e4b3d]">
              تثبيت نظام الإدارة المالية
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              إنشاء حساب مدير النظام الأول
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1e4b3d] flex items-center">
                  <User className="h-5 w-5 ml-2" />
                  المعلومات الأساسية
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-right block">الاسم الكامل</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username" className="text-right block">اسم المستخدم</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="text-right"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1e4b3d] flex items-center">
                  <Lock className="h-5 w-5 ml-2" />
                  كلمة المرور
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-right block">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Security Questions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1e4b3d] flex items-center">
                  <HelpCircle className="h-5 w-5 ml-2" />
                  أسئلة الأمان (مطلوبة لاسترجاع كلمة المرور)
                </h3>
                
                <div className="space-y-4">
                  {formData.securityQuestions.map((sq, index) => (
                    <div key={index} className="border border-[#d4af37] rounded-lg p-4 bg-[#f5f5f0]">
                      <h4 className="font-medium text-[#1e4b3d] mb-3">السؤال {index + 1}</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-right block">السؤال</Label>
                          <Input
                            type="text"
                            value={sq.question}
                            onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                            className="text-right"
                            placeholder="اكتب السؤال الأمني"
                          />
                        </div>
                        <div>
                          <Label className="text-right block">الإجابة</Label>
                          <Input
                            type="text"
                            value={sq.answer}
                            onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                            className="text-right"
                            placeholder="اكتب الإجابة الصحيحة"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1e4b3d">تحقق من الإنسان</h3>
                <div className="border border-[#d4af37] rounded-lg p-4 bg-[#f5f5f0] text-center">
                  <p className="mb-2">اكتب الكلمة التالية للتأكد من أنك إنسان:</p>
                  <div className="bg-[#1e4b3d] text-white p-3 rounded text-xl font-mono mb-2">
                    FMS
                  </div>
                  <Input
                    type="text"
                    placeholder="اكتب الكلمة التي تراها"
                    className="text-right w-32 mx-auto"
                    required
                  />
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white font-semibold py-3"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء حساب مدير النظام"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}