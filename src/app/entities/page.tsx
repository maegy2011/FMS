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
  Building2, 
  Plus, 
  Search, 
  Phone,
  Mail,
  MapPin,
  User,
  Edit,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Entity {
  id: string;
  name: string;
  type: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    captcha: "",
    password: ""
  });

  useEffect(() => {
    checkAuth();
    fetchEntities();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
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
      } else {
        setError('فشل في جلب الجهات');
      }
    } catch (error) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setEntities([data.entity, ...entities]);
        setShowAddForm(false);
        setFormData({
          name: "",
          type: "",
          description: "",
          phone: "",
          email: "",
          address: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في إنشاء الجهة");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleEdit = async (entityId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/entities/${entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setEntities(entities.map(entity => 
          entity.id === entityId ? data.entity : entity
        ));
        setShowAddForm(false);
        setFormData({
          name: "",
          type: "",
          description: "",
          phone: "",
          email: "",
          address: "",
          captcha: "",
          password: ""
        });
      } else {
        setError(data.error || "فشل في تحديث الجهة");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجهة؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/entities/${entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEntities(entities.filter(entity => entity.id !== entityId));
      } else {
        const data = await response.json();
        setError(data.error || "فشل في حذف الجهة");
      }
    } catch (error) {
      setError("فشل الاتصال بالخادم");
    }
  };

  const startEdit = (entity: Entity) => {
    setFormData({
      name: entity.name,
      type: entity.type,
      description: entity.description || "",
      phone: entity.phone || "",
      email: entity.email || "",
      address: entity.address || "",
      captcha: "",
      password: ""
    });
    setShowAddForm(true);
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entity.description && entity.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEntityTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'MAIN': 'رئيسية',
      'SUBSIDIARY': 'تابعة',
      'WORKER': 'عامل'
    };
    return typeMap[type] || type;
  };

  const getEntityTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'MAIN': 'bg-[#1e4b3d]',
      'SUBSIDIARY': 'bg-[#d4af37]',
      'WORKER': 'bg-[#8b4513]'
    };
    return colorMap[type] || 'bg-gray-500';
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
                <Building2 className="h-6 w-6 text-[#1e4b3d]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إدارة الجهات</h1>
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
                placeholder="بحث في الجهات..."
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
            إضافة جهة جديدة
          </Button>
        </div>

        {/* Add Entity Form */}
        {showAddForm && (
          <Card className="mb-8 andalusian-border">
            <CardHeader>
              <CardTitle className="text-[#1e4b3d]">إضافة جهة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-right block">اسم الجهة</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type" className="text-right block">نوع الجهة</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAIN">رئيسية</SelectItem>
                        <SelectItem value="SUBSIDIARY">تابعة</SelectItem>
                        <SelectItem value="WORKER">عامل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-right block">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-right block">رقم الهاتف (اختياري)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-right block">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-right block">العنوان (اختياري)</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button type="submit" className="bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white">
                    حفظ الجهة
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: "",
                      type: "",
                      description: "",
                      phone: "",
                      email: "",
                      address: "",
                      captcha: "",
                      password: ""
                    });
                  }}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Entities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity) => (
            <Card key={entity.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#1e4b3d]" />
                    <h3 className="text-lg font-semibold text-[#1e4b3d]">{entity.name}</h3>
                  </div>
                  <Badge className={`${getEntityTypeColor(entity.type)} text-white`}>
                    {getEntityTypeDisplayName(entity.type)}
                  </Badge>
                </div>

                {entity.description && (
                  <p className="text-gray-600 text-sm mb-4">{entity.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {entity.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 ml-2" />
                      {entity.phone}
                    </div>
                  )}
                  {entity.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 ml-2" />
                      {entity.email}
                    </div>
                  )}
                  {entity.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 ml-2" />
                      {entity.address}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 ml-1" />
                    {entity.user.name}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(entity)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(entity.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntities.length === 0 && (
          <Card className="text-center">
            <CardContent className="p-8">
              <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد جهات لعرضها</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-[#1e4b3d] hover:bg-[#2d5f4f] text-white"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول جهة
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}