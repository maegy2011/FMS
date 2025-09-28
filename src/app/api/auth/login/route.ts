import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, password, captchaToken } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Verify captcha
    const captchaSession = await db.captchaSession.findFirst({
      where: { sessionId: captchaToken }
    })

    if (!captchaSession || captchaSession.used || captchaSession.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Mark captcha as used
    await db.captchaSession.updateMany({
      where: { sessionId: captchaToken },
      data: { used: true }
    })

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Log the login attempt
    await db.auditLog.create({
      data: {
        userId: user.userId,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    const token = generateToken(user)

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.userId,
        username: user.username,
        role: user.role,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}