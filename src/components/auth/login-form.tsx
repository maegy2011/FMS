'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onSuccess) {
        onSuccess(data.user);
      }

      // Reload page to update auth state
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold arabic-text">
          تسجيل الدخول
        </CardTitle>
        <CardDescription className="arabic-text">
          أدخل بيانات الاعتماد للوصول إلى نظام الإدارة المالية
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="arabic-text">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="arabic-text">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                className="pr-10 text-right arabic-text"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="arabic-text">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pr-10 text-right arabic-text"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground arabic-text text-center">
            للحساب التجريبي: admin@fms.com / demo123
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full arabic-text" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}