'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('جاري التحميل...')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const pathname = usePathname()

  const getPageSpecificMessage = () => {
    if (pathname === '/') {
      return 'جاري تحميل الجهات...'
    } else if (pathname === '/revenues') {
      return 'جاري تحميل الإيرادات...'
    } else if (pathname === '/monthly-revenue-tracking') {
      return 'جاري تحميل متابعة الإيرادات...'
    }
    return 'جاري التحميل...'
  }

  const getProcedureMessage = () => {
    if (pathname === '/') {
      return 'جاري معالجة بيانات الجهات...'
    } else if (pathname === '/revenues') {
      return 'جاري معالجة بيانات الإيرادات...'
    } else if (pathname === '/monthly-revenue-tracking') {
      return 'جاري معالجة بيانات المتابعة...'
    }
    return 'جاري تنفيذ الإجراء...'
  }

  useEffect(() => {
    // Handle initial app load
    const handleInitialLoad = () => {
      setTimeout(() => {
        setIsInitialLoad(false)
      }, 1000) // Show initial loading for 1 second
    }

    // Show loading when navigation starts
    const handleStart = (url: string) => {
      if (url !== window.location.pathname) {
        setIsLoading(true)
        setMessage(getPageSpecificMessage())
      }
    }

    // Hide loading when navigation ends
    const handleEnd = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 300) // Minimum loading time for better UX
    }

    // Handle procedure loading
    const handleProcedureStart = () => {
      setIsLoading(true)
      setMessage(getProcedureMessage())
    }

    const handleProcedureEnd = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }

    // Initial load
    handleInitialLoad()

    // Listen for route changes
    const originalPush = window.history.pushState
    window.history.pushState = function(...args) {
      handleStart(args[2] as string)
      setTimeout(handleEnd, 500)
      return originalPush.apply(this, args)
    }

    // Listen for browser back/forward
    window.addEventListener('popstate', () => handleStart(window.location.pathname))
    window.addEventListener('popstate', handleEnd)

    // Global event listeners for procedures
    window.addEventListener('procedure-start', handleProcedureStart)
    window.addEventListener('procedure-end', handleProcedureEnd)

    // Custom fetch wrapper to detect API calls
    const originalFetch = window.fetch
    window.fetch = function(...args) {
      const url = args[0] as string
      if (typeof url === 'string' && url.startsWith('/api/')) {
        handleProcedureStart()
        return originalFetch.apply(this, args).finally(() => {
          handleProcedureEnd()
        })
      }
      return originalFetch.apply(this, args)
    }

    return () => {
      window.history.pushState = originalPush
      window.removeEventListener('popstate', handleStart)
      window.removeEventListener('popstate', handleEnd)
      window.removeEventListener('procedure-start', handleProcedureStart)
      window.removeEventListener('procedure-end', handleProcedureEnd)
      window.fetch = originalFetch
    }
  }, [pathname])

  // Don't show loading during initial load if it's too quick
  if (isInitialLoad && !isLoading) return null
  if (!isLoading && !isInitialLoad) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-800 mb-2">{message}</p>
        <div className="flex justify-center space-x-1 space-x-reverse">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}