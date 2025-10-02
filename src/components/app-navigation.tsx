'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2, DollarSign, BarChart3 } from 'lucide-react'

export function AppNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'الجهات',
      icon: Building2
    },
    {
      href: '/revenues',
      label: 'الإيرادات',
      icon: DollarSign
    },
    {
      href: '/monthly-revenue-tracking',
      label: 'متابعة الإيرادات الشهرية',
      icon: BarChart3
    }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-1 space-x-reverse">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                asChild
                className="flex items-center gap-2"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}