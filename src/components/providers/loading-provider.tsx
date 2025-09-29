'use client'

import { useState, useEffect } from 'react'
import LoadingPage from '@/components/ui/loading-page'

interface LoadingProviderProps {
  children: React.ReactNode
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('fms-has-visited')
    
    if (hasVisited) {
      // If user has visited before, show loading for shorter duration
      const timer = setTimeout(() => {
        setShowLoading(false)
        setIsLoading(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      // First visit, show full loading experience
      const timer = setTimeout(() => {
        localStorage.setItem('fms-has-visited', 'true')
        setShowLoading(false)
        setIsLoading(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {showLoading && <LoadingPage onComplete={() => setShowLoading(false)} />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        {children}
      </div>
    </>
  )
}