'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2, DollarSign, Home } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">نظام إدارة الجهات والإيرادات</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant={pathname === '/' ? 'default' : 'outline'}
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              وحدة الجهات
            </Link>
          </Button>
          
          <Button
            variant={pathname === '/revenues' ? 'default' : 'outline'}
            asChild
          >
            <Link href="/revenues" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              وحدة الإيرادات
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}