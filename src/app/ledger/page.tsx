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
  FileText, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

interface LedgerEntry {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  reference?: string;
  notes?: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
  income?: {
    id: string;
    description: string;
    category: string;
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

export default function LedgerPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "",
    entityId: "",
    reference: "",
    notes: "",
    captcha: "",
    password: ""
  });

  useEffect(() => {
    checkAuth();
    fetchEntries();
    fetchEntities();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  };

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/ledger', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
      } else {
        setError('فشل في جلب قيود دفتر الاستاذ');
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
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setEntries([data.entry, ...entries]);
        setShowAddForm(false);
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          type: "",
          entityId: "",
          reference: "",
          notes: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في إنشاء القيد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleEdit = async (entryId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/ledger/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setEntries(entries.map(entry => 
          entry.id === entryId ? data.entry : entry
        ));
        setShowAddForm(false);
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          type: "",
          entityId: "",
          reference: "",
          notes: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في تحديث القيد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/ledger/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId));
      } else {
        const data = await response.json();
        setError(data.error || "فشل في حذف القيد");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const startEdit = (entry: LedgerEntry) => {
    setFormData({
      amount: entry.amount.toString(),
      description: entry.description,
      date: entry.date.split('T')[0],
      type: entry.type,
      entityId: entry.entity?.id || "",
      reference: entry.reference || "",
      notes: entry.notes || "",
      captcha: "",
      password: ""
    });
    setShowAddForm(true);
  };

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.entity && entry.entity.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeDisplayName = (type: string) => {
    return type === 'DEBIT' ? 'مدين' : 'دائن';
  };

  const getTypeIcon = (type: string) => {
    return type === 'DEBIT' ? TrendingDown : TrendingUp;
  };

  const getTypeColor = (type: string) => {
    return type === 'DEBIT' ? 'bg-red-500' : 'bg-green-500';
  };

  const getEntityTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'MAIN': 'رئيسية',
      'SUBSIDIARY': 'تابعة',
      'WORKER': 'عامل'
    };
    return typeMap[type] || type;
  };

  // Calculate totals
  const totals = filteredEntries.reduce((acc, entry) => {
    if (entry.type === 'DEBIT') {
      acc.debit += entry.amount;
    } else {
      acc.credit += entry.amount;
    }
    return acc;
  }, { debit: 0, credit: 0 });

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
                <FileText className="h-6 w-6 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">دفتر الاستاذ</h1>
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
        {/* Totals Card */}
        <Card className="mb-8 andalusian-border">
          <CardHeader>
            <CardTitle className="text-[#1e4b3d]">ملخص الحسابات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {totals.debit.toLocaleString('ar-SA')} ر.س
                </div>
                <p className="text-gray-600">إجمالي المدين</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {totals.credit.toLocaleString('ar-SA')} ر.س
                </div>
                <p className="text-gray-600">إجمالي الدائن</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-8 w-8 text-[#d4af37]" />
                </div>
                <div className="text-2xl font-bold text-[#1e4b3d]">
                  {Math.abs(totals.credit - totals.debit).toLocaleString('ar-SA')} ر.س
                </div>
                <p className="text-gray-600">الرصيد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث في القيود..."
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
            إضافة قيد جديد
          </Button>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <Card className="mb-8 andalusian-border">
            <CardHeader>
              <CardTitle className="text-[#1e4b3d]">إضافة قيد جديد</CardTitle>
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
                    <Label htmlFor="type" className="text-right block">نوع القيد</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEBIT">مدين</SelectItem>
                        <SelectItem value="CREDIT">دائن</SelectItem>
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
                    حفظ القيد
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ledger Entries */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const TypeIcon = getTypeIcon(entry.type);
            return (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5" />
                          <h3 className="text-lg font-semibold text-[#1e4b3d]">{entry.description}</h3>
                        </div>
                        <Badge className={`${getTypeColor(entry.type)} text-white`}>
                          {getTypeDisplayName(entry.type)}
                        </Badge>
                        <Badge className="bg-[#d4af37] text-[#1e4b3d]">
                          {entry.amount.toLocaleString('ar-SA')} ر.س
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1" />
                          {new Date(entry.date).toLocaleDateString('ar-SA')}
                        </div>
                        {entry.entity && (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 ml-1" />
                            {entry.entity.name}
                          </div>
                        )}
                        <div className="flex items-center">
                          <User className="h-4 w-4 ml-1" />
                          {entry.user.name}
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <p className="mt-2 text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <Card className="text-center">
            <CardContent className="p-8">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد قيود لعرضها</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول قيد
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}