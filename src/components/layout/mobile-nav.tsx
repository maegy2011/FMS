'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Calculator,
  TrendingUp,
  FileText,
  Receipt,
  UserCircle,
  Crown,
  Star,
  Power,
  Building2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  color?: string;
}

const navItems: NavItem[] = [
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
    icon: <Users className="h-5 w-5" />,
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

export function MobileNav() {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden hover:bg-gradient-to-r hover:from-emerald-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all duration-300">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col h-full">
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
            {navItems.map((item) => {
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
                  {!isActive && (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium arabic-text text-sm truncate">
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
      </SheetContent>
    </Sheet>
  );
}

// Mobile bottom navigation component
export function MobileBottomNav() {
  const { user, hasPermission } = useAuth();
  const pathname = usePathname();

  // Show only essential items on mobile bottom nav
  const bottomNavItems: NavItem[] = [
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
      name: 'الإيرادات',
      href: '/revenues',
      icon: <TrendingUp className="h-5 w-5" />,
      permission: 'ACCOUNTANT',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'المزيد',
      href: '#',
      icon: <Menu className="h-5 w-5" />,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'text-primary bg-gradient-to-r from-primary/5 to-primary/10'
                  : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent/50'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
              )}
              
              {/* Icon with gradient background for active state */}
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r shadow-md'
                  : 'hover:bg-gray-100'
              }`} style={isActive ? { background: `linear-gradient(to right, ${item.color?.replace('from-', '').replace('to-', ', ')})` } : {}}>
                <div className={`transition-transform duration-300 ${
                  isActive ? 'text-white scale-110' : 'text-gray-600'
                }`}>
                  {item.icon}
                </div>
              </div>
              
              <span className={`text-xs arabic-text transition-all duration-300 ${
                isActive ? 'font-bold text-primary' : 'font-medium'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}