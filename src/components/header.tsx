'use client'

import { Building2, DollarSign } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">نظام الإدارة المالية</h1>
              <p className="text-sm text-gray-600">FMS v1.0.0</p>
            </div>
          </div>

          {/* Simple User Info */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">م</span>
            </div>
            <span className="text-sm text-gray-700 hidden md:inline">المسؤول</span>
          </div>
        </div>
      </div>
    </header>
  )
}