import { NextRequest, NextResponse } from 'next/server'
import { securityHeaders, rateLimit, checkSuspiciousActivity, logSecurityEvent } from './security'

export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Apply security headers
    const response = NextResponse.next()
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Check for suspicious activity
    const isSuspicious = await checkSuspiciousActivity(request)
    if (isSuspicious) {
      await logSecurityEvent(request, 'SUSPICIOUS_ACTIVITY', 'Suspicious activity detected')
      
      // Return 403 for suspicious requests
      return new NextResponse(
        JSON.stringify({ error: 'تم حظر الطلب بسبب نشاط مشبوه' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Rate limiting for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      let rateLimitType = 'api'
      
      if (request.nextUrl.pathname.includes('/auth/login')) {
        rateLimitType = 'login'
      } else if (request.nextUrl.pathname.includes('/auth/register')) {
        rateLimitType = 'register'
      } else if (request.nextUrl.pathname.includes('/auth/captcha')) {
        rateLimitType = 'captcha'
      }

      const rateLimitResult = await rateLimit(request, rateLimitType)
      
      if (!rateLimitResult.success) {
        await logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', `Rate limit exceeded for ${rateLimitType}`)
        
        return new NextResponse(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات المسموح به' }),
          { 
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': '900'
            }
          }
        )
      }

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    }

    // Validate request method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    const method = request.method.toUpperCase()
    
    if (!allowedMethods.includes(method)) {
      await logSecurityEvent(request, 'INVALID_METHOD', `Invalid HTTP method: ${method}`)
      
      return new NextResponse(
        JSON.stringify({ error: 'طريقة الطلب غير صالحة' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Check content type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')
      
      if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        await logSecurityEvent(request, 'INVALID_CONTENT_TYPE', `Invalid content type: ${contentType}`)
        
        return new NextResponse(
          JSON.stringify({ error: 'نوع المحتوى غير صالح' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Validate request size
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (size > maxSize) {
        await logSecurityEvent(request, 'REQUEST_TOO_LARGE', `Request size too large: ${size} bytes`)
        
        return new NextResponse(
          JSON.stringify({ error: 'حجم الطلب كبير جداً' }),
          { 
            status: 413,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Check for missing required headers
    const requiredHeaders = ['host', 'user-agent']
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        await logSecurityEvent(request, 'MISSING_HEADER', `Missing required header: ${header}`)
        
        return new NextResponse(
          JSON.stringify({ error: 'رؤوس الطلبات غير مكتملة' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return null // No security issues found
  } catch (error) {
    console.error('Security middleware error:', error)
    
    await logSecurityEvent(request, 'SECURITY_ERROR', `Security middleware error: ${error}`)
    
    return new NextResponse(
      JSON.stringify({ error: 'خطأ أمني داخلي' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Apply security middleware to API routes
export async function applySecurityMiddleware(request: NextRequest): Promise<NextResponse> {
  const securityResult = await securityMiddleware(request)
  
  if (securityResult) {
    return securityResult
  }

  // If no security issues, continue with the request
  return NextResponse.next()
}