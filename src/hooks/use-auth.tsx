'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasPermission = (requiredRole: string) => {
    const roleHierarchy = {
      'ADMIN': 4,
      'MANAGER': 3,
      'ACCOUNTANT': 2,
      'VIEWER': 1
    };
    
    if (!user) return false;
    return roleHierarchy[user.role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  };

  return {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated: !!user,
  };
}