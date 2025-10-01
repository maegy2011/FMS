'use client'

import { useState, useEffect } from 'react'

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('جاري التحميل...')

  useEffect(() => {
    // Show loading when navigation starts
    const handleStart = () => {
      setIsLoading(true)
      setMessage('جاري التحميل...')
    }

    // Hide loading when navigation ends
    const handleEnd = () => {
      setIsLoading(false)
    }

    // Listen for route changes
    const originalPush = window.history.pushState
    window.history.pushState = function(...args) {
      handleStart()
      setTimeout(handleEnd, 500) // Simulate loading time
      return originalPush.apply(this, args)
    }

    // Listen for browser back/forward
    window.addEventListener('popstate', handleStart)
    window.addEventListener('popstate', () => setTimeout(handleEnd, 500))

    return () => {
      window.history.pushState = originalPush
      window.removeEventListener('popstate', handleStart)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  )
}