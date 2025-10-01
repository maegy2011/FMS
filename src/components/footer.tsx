'use client'

import { Copyright } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          {/* Left Side - App Info */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-sm font-medium text-gray-700">نظام الإدارة المالية | FMS v1.0.0</span>
          </div>
          
          {/* Center - Developer */}
          <div className="text-sm text-gray-600">
            <span>تم التطوير بواسطة: </span>
            <span className="font-medium">Mohamed adel</span>
          </div>
          
          {/* Right Side - Copyright */}
          <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600">
            <Copyright className="h-4 w-4" />
            <span>2025 جميع الحقوق محفوظة</span>
          </div>
        </div>
      </div>
    </footer>
  )
}