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

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

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
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Verify token
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.redirect(new URL('/', request.url))
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
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/incomes/:path*',
    '/entities/:path*',
    '/reports/:path*',
    '/ledger/:path*',
    '/api/:path*'
  ],
}