import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { 
      username, 
      email, 
      password, 
      fullName, 
      role,
      securityQuestions,
      captchaToken 
    } = await request.json()

    if (!username || !email || !password || !fullName || !securityQuestions || securityQuestions.length !== 3) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة ويجب اختيار 3 أسئلة أمان' },
        { status: 400 }
      )
    }

    // Verify captcha
    const captchaSession = await db.captchaSession.findUnique({
      where: { sessionId: captchaToken }
    })

    if (!captchaSession || captchaSession.used || captchaSession.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // Mark captcha as used
    await db.captchaSession.update({
      where: { id: captchaSession.id },
      data: { used: true }
    })

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل' },
        { status: 409 }
      )
    }

    // Check if this is the first user (system manager)
    const userCount = await db.user.count()
    const userRole = userCount === 0 ? UserRole.SYSTEM_MANAGER : (role || UserRole.ACCOUNTANT)

    const user = await createUser({
      username,
      email,
      password,
      fullName,
      role: userRole,
      securityQuestions
    })

    // Log the registration
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}