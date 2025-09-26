'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MobileNav, MobileBottomNav } from '@/components/layout/mobile-nav';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Users as UsersIcon,
  Settings, 
  LogOut,
  Menu,
  Home,
  Calculator,
  BarChart3,
  CreditCard,
  Receipt,
  UserCircle,
  Building2,
  Star,
  Crown,
  Gem,
  Mosque,
  Scale,
  Shield,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Database,
  FileBarChart,
  DollarSign,
  Coins,
  Building,
  Users,
  FileSpreadsheet,
  FileCheck,
  Calculator as CalculatorIcon,
  Cog,
  Power
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  color?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'الرئيسية',
    href: '/',
    icon: <Home className="h-5 w-5" />,
    color: 'from-emerald-500 to-blue-500'
  },
  {
    name: 'لوحة التحكم',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    color: 'from-blue-500 to-purple-500'
  },
  {
    name: 'الحسابات',
    href: '/accounts',
    icon: <Wallet className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'المعاملات',
    href: '/transactions',
    icon: <CreditCard className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'الإيرادات',
    href: '/revenues',
    icon: <TrendingUp className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'الجهات',
    href: '/parties',
    icon: <Building2 className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'التقارير',
    href: '/reports',
    icon: <BarChart3 className="h-5 w-5" />,
    permission: 'MANAGER',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    name: 'الإحصائيات',
    href: '/analytics',
    icon: <TrendingUp className="h-5 w-5" />,
    permission: 'MANAGER',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: 'المستخدمون',
    href: '/users',
    icon: <UsersIcon className="h-5 w-5" />,
    permission: 'ADMIN',
    color: 'from-red-500 to-orange-500'
  },
  {
    name: 'الفواتير',
    href: '/invoices',
    icon: <Receipt className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'المحاسبة',
    href: '/accounting',
    icon: <Calculator className="h-5 w-5" />,
    permission: 'ACCOUNTANT',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    name: 'الإعدادات',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    permission: 'ADMIN',
    color: 'from-gray-500 to-slate-500'
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();

  const getRoleLabel = (role: string) => {
    const labels = {
      'ADMIN': 'مدير النظام',
      'MANAGER': 'مدير',
      'ACCOUNTANT': 'محاسب',
      'VIEWER': 'مراقب',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'ACCOUNTANT': 'bg-green-100 text-green-800',
      'VIEWER': 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold arabic-text">FMS</h1>
            <p className="text-sm opacity-90 arabic-text">
              نظام الإدارة المالية
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 arabic-text font-medium ${
                isActive
                  ? 'bg-gradient-to-r shadow-lg text-white border-0'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md border border-transparent hover:border-border/50'
              }`}
              style={isActive ? { background: `linear-gradient(to right, ${item.color?.replace('from-', '').replace('to-', ', ')})` } : {}}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-muted group-hover:bg-accent'
              }`}>
                {item.icon}
              </div>
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold">
              {user?.name?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium arabic-text text-sm">
              {user?.name || user?.email}
            </p>
            <Badge variant="secondary" className={`text-xs mt-1 ${getRoleColor(user?.role || '')}`}>
              {getRoleLabel(user?.role || '')}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full arabic-text hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 group"
          onClick={logout}
        >
          <Power className="ml-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-72 border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg ${className}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Navigation */}
      <MobileNav />
      <MobileBottomNav />
    </>
  );
}