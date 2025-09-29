import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { applySecurityMiddleware } from './security-middleware'

export async function middleware(request: NextRequest) {
  // Apply security middleware to all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const securityResult = await applySecurityMiddleware(request)
    if (securityResult.status !== 200) {
      return securityResult
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/incomes',
    '/entities',
    '/ledger',
    '/reports'
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // For API routes, check Authorization header
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify token
      const payload = verifyToken(token)
      
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)
      requestHeaders.set('x-user-username', payload.username)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } else {
      // For page routes, the client-side will handle authentication
      // Let the request pass through and let the client-side handle the redirect
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/protected/:path*',
    '/api/:path*'
  ],
}