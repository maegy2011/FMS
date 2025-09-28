import { NextRequest } from 'next/server'
import { db } from './db'

// Rate limiting configuration
const RATE_LIMITS = {
  login: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  register: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  captcha: { requests: 10, windowMs: 5 * 60 * 1000 }, // 10 requests per 5 minutes
  api: { requests: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
}

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Input validation patterns
export const validationPatterns = {
  username: /^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^(\+966|0)?5\d{8}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  arabicText: /^[\u0600-\u06FF\s\p{P}]+$/u,
  entityId: /^[a-zA-Z0-9-]{20,}$/
}

// Rate limiting middleware
export async function rateLimit(request: NextRequest, type: keyof typeof RATE_LIMITS): Promise<{ success: boolean; remaining: number }> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const key = `${type}:${ip}`
  const now = Date.now()
  const limit = RATE_LIMITS[type]

  let record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + limit.windowMs
    }
    rateLimitStore.set(key, record)
    return { success: true, remaining: limit.requests - 1 }
  }

  if (record.count >= limit.requests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit.requests - record.count }
}

// Input validation
export function validateInput(input: string, pattern: keyof typeof validationPatterns): boolean {
  return validationPatterns[pattern].test(input)
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// SQL injection prevention
export function preventSQLInjection(input: string): string {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|TRUNCATE)\b)|(''|''|;|--|\/\*|\*\/|@@)/gi
  return input.replace(sqlPattern, '')
}

// Check for suspicious activity
export async function checkSuspiciousActivity(request: NextRequest, userId?: string): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Check for too many failed attempts
  const recentFailures = await db.auditLog.count({
    where: {
      ipAddress: ip,
      action: {
        in: ['LOGIN_FAILED', 'INVALID_TOKEN', 'ACCESS_DENIED']
      },
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    }
  })

  if (recentFailures > 10) {
    return true
  }

  // Check for suspicious user agents
  const suspiciousAgents = [
    /bot/i, /crawler/i, /spider/i, /scanner/i, /test/i
  ]
  
  if (suspiciousAgents.some(agent => agent.test(userAgent))) {
    return true
  }

  return false
}

// Log security events
export async function logSecurityEvent(
  request: NextRequest,
  event: string,
  details: string,
  userId?: string
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || '',
        action: event,
        entityType: 'Security',
        entityId: 'system',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details
      }
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// Session security
export const sessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/'
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
  } else {
    score += 1
  }

  if (!/[@$!%*?&]/.test(password)) {
    feedback.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
  } else {
    score += 1
  }

  return { score, feedback }
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم' }
  }

  return { valid: true }
}

// Clean up expired rate limit records
export function cleanupRateLimits(): void {
  const now = Date.now()
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 60 * 60 * 1000)
}