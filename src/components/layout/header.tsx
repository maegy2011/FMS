'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Bell, Search, User, Settings, Crown, Star, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            {title && (
              <h1 className="text-xl font-bold arabic-heading text-shadow-arabic">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground arabic-text">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث..."
                className="pl-10 pr-4 w-64 arabic-text hover:shadow-md transition-shadow duration-300 focus:shadow-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Notifications */}
          <Button 
            variant="outline" 
            size="icon" 
            className="relative hover:bg-gradient-to-r hover:from-emerald-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all duration-300 group"
          >
            <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:shadow-lg transition-all duration-300 group"
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 align-end bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg" align="end">
              <DropdownMenuLabel className="arabic-text">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none arabic-heading">
                    {user?.name || 'مستخدم'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground arabic-text">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="arabic-text hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-700 transition-all duration-300">
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="arabic-text hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300">
                <Settings className="ml-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="arabic-text text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                onClick={logout}
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}