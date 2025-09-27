"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  FileText,
  Building2,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  reference?: string;
  notes?: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
  entity?: {
    id: string;
    name: string;
    type: string;
  };
}

interface Entity {
  id: string;
  name: string;
  type: string;
}

export default function IncomePage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    entityId: "",
    reference: "",
    notes: "",
    captcha: "",
    password: ""
  });

  useEffect(() => {
    checkAuth();
    fetchIncomes();
    fetchEntities();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  };

  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/income', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIncomes(data.incomes);
      } else {
        setError('فشل في جلب الإيرادات');
      }
    } catch (error) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/entities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setIncomes([data.income, ...incomes]);
        setShowAddForm(false);
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          category: "",
          entityId: "",
          reference: "",
          notes: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في إنشاء الإيراد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleEdit = async (incomeId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/income/${incomeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setIncomes(incomes.map(income => 
          income.id === incomeId ? data.income : income
        ));
        setShowAddForm(false);
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          category: "",
          entityId: "",
          reference: "",
          notes: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في تحديث الإيراد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleDelete = async (incomeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإيراد؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/income/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIncomes(incomes.filter(income => income.id !== incomeId));
      } else {
        const data = await response.json();
        setError(data.error || "فشل في حذف الإيراد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const startEdit = (income: Income) => {
    setFormData({
      amount: income.amount.toString(),
      description: income.description,
      date: income.date.split('T')[0],
      category: income.category,
      entityId: income.entity?.id || "",
      reference: income.reference || "",
      notes: income.notes || "",
      captcha: "",
      password: ""
    });
    setShowAddForm(true);
  };

  const filteredIncomes = incomes.filter(income =>
    income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (income.entity && income.entity.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'SALARY': 'راتب',
      'RENT': 'إيجار',
      'INVESTMENT': 'استثمار',
      'SERVICE': 'خدمة',
      'OTHER': 'أخرى'
    };
    return categoryMap[category] || category;
  };

  const getEntityTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'MAIN': 'رئيسية',
      'SUBSIDIARY': 'تابعة',
      'WORKER': 'عامل'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b3d] mx-auto"></div>
          <p className="mt-4 text-[#1e4b3d]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcf8] via-[#f5f5f0] to-[#e8dcc6] islamic-pattern">
      {/* Header */}
      <header className="bg-[#1e4b3d] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="bg-[#d4af37] p-2 rounded-full">
                <DollarSign className="h-6 w-6 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إدارة الإيرادات</h1>
                <p className="text-[#fefcf8]/80 text-sm">نظام الإدارة المالية</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="text-white hover:text-[#d4af37]"
              >
                رجوع
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Add */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث في الإيرادات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة إيراد جديد
          </Button>
        </div>

        {/* Add Income Form */}
        {showAddForm && (
          <Card className="mb-8 andalusian-border">
            <CardHeader>
              <CardTitle className="text-[#1e4b3d]">إضافة إيراد جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-right block">المبلغ (ر.س)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date" className="text-right block">التاريخ</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-right block">الوصف</Label>
                  <Input
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-right block">الفئة</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALARY">راتب</SelectItem>
                        <SelectItem value="RENT">إيجار</SelectItem>
                        <SelectItem value="INVESTMENT">استثمار</SelectItem>
                        <SelectItem value="SERVICE">خدمة</SelectItem>
                        <SelectItem value="OTHER">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="entityId" className="text-right block">الجهة (اختياري)</Label>
                    <Select value={formData.entityId} onValueChange={(value) => setFormData({...formData, entityId: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name} ({getEntityTypeDisplayName(entity.type)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reference" className="text-right block">المرجع (اختياري)</Label>
                    <Input
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="captcha" className="text-right block">رمز التحقق</Label>
                    <Input
                      id="captcha"
                      name="captcha"
                      required
                      value={formData.captcha}
                      onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                      className="text-right"
                      placeholder="اكتب FMS"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-right block">ملاحظات (اختياري)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="text-right"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button type="submit" className="bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white">
                    حفظ الإيراد
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Incomes List */}
        <div className="space-y-4">
          {filteredIncomes.map((income) => (
            <Card key={income.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-[#1e4b3d]">{income.description}</h3>
                      <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                        {income.amount.toLocaleString('ar-SA')} ر.س
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-1" />
                        {new Date(income.date).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 ml-1" />
                        {getCategoryDisplayName(income.category)}
                      </div>
                      {income.entity && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 ml-1" />
                          {income.entity.name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <User className="h-4 w-4 ml-1" />
                        {income.user.name}
                      </div>
                    </div>
                    
                    {income.notes && (
                      <p className="mt-2 text-sm text-gray-600">{income.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(income)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(income.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIncomes.length === 0 && (
          <Card className="text-center">
            <CardContent className="p-8">
              <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد إيرادات لعرضها</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول إيراد
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}