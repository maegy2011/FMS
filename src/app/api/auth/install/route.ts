import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, captchaToken, captchaAnswer, securityQuestions } = await request.json()

    // Validate required fields
    if (!username || !email || !password || !fullName || !securityQuestions || securityQuestions.length !== 3) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة ويجب اختيار 3 أسئلة أمان' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Validate full name
    if (fullName.length < 2) {
      return NextResponse.json(
        { error: 'الاسم الكامل يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      )
    }

    // Validate security questions
    for (const sq of securityQuestions) {
      if (!sq.question || !sq.answer || sq.answer.length < 2) {
        return NextResponse.json(
          { error: 'جميع الأسئلة الأمنية والإجابات مطلوبة' },
          { status: 400 }
        )
      }
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

    // Verify captcha answer
    if (captchaSession.answer !== captchaAnswer) {
      return NextResponse.json(
        { error: 'إجابة رمز التحقق غير صحيحة' },
        { status: 400 }
      )
    }

    // Mark captcha as used
    await db.captchaSession.updateMany({
      where: { sessionId: captchaToken },
      data: { used: true }
    })

    // Check if this is really the first installation
    const userCount = await db.user.count()
    
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'النظام مثبت بالفعل. لا يمكن إنشاء حساب مدير نظام جديد.' },
        { status: 403 }
      )
    }

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

    // Create system manager account
    const user = await createUser({
      username,
      email,
      password,
      fullName,
      role: UserRole.SYSTEM_MANAGER,
      securityQuestions
    })

    // Log the installation
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'SYSTEM_INSTALL',
        entityType: 'System',
        entityId: '1',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: 'System installation completed'
      }
    })

    // Set system settings
    await db.systemSettings.createMany({
      data: [
        {
          key: 'system_installed',
          value: 'true',
          description: 'System installation completed'
        },
        {
          key: 'install_date',
          value: new Date().toISOString(),
          description: 'System installation date'
        },
        {
          key: 'system_version',
          value: '1.0.0',
          description: 'System version'
        }
      ]
    })

    return NextResponse.json({
      message: 'تم تثبيت النظام بنجاح',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Installation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تثبيت النظام' },
      { status: 500 }
    )
  }
}