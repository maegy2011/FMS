"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captcha: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || "فشل تسجيل الدخول");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1412] via-[#1a231e] to-[#2d5f4f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-[#b8941f] bg-[#1a231e] text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#b8941f] p-4 rounded-full">
                <Shield className="h-12 w-12 text-[#0f1412]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-[#fefcf8]">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-[#fefcf8]/80">
              نظام الإدارة المالية | FMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right block text-[#fefcf8]">
                  اسم المستخدم أو البريد الإلكتروني
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-[#0f1412] border-[#b8941f] text-white text-right"
                  placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block text-[#fefcf8]">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-[#0f1412] border-[#b8941f] text-white text-right pr-12"
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b8941f] hover:text-[#fefcf8]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label className="text-right block text-[#fefcf8]">
                  تحقق من الإنسان
                </Label>
                <div className="border border-[#b8941f] rounded-lg p-3 bg-[#0f1412] text-center">
                  <p className="text-[#fefcf8]/80 mb-2 text-sm">اكتب الكلمة التالية:</p>
                  <div className="bg-[#b8941f] text-[#0f1412] p-2 rounded text-lg font-mono mb-2">
                    FMS
                  </div>
                  <Input
                    id="captcha"
                    name="captcha"
                    type="text"
                    required
                    value={formData.captcha}
                    onChange={handleInputChange}
                    className="bg-[#0f1412] border-[#b8941f] text-white text-right w-24 mx-auto"
                    placeholder="FMS"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-500 bg-red-900/20">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b8941f] hover:bg-[#daa520] text-[#0f1412] font-semibold py-3"
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[#b8941f] hover:text-[#fefcf8] text-sm"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="mt-6 text-center text-[#fefcf8]/60 text-sm">
          <p>نظام الإدارة المالية المحمي</p>
          <p>© 2024 FMS - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}