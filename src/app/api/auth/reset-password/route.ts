import { NextRequest, NextResponse } from 'next/server'
import { verifySecurityQuestions, resetPassword } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, securityAnswers, newPassword, captchaToken } = await request.json()

    if (!username || !securityAnswers || securityAnswers.length !== 3 || !newPassword) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة ويجب الإجابة على 3 أسئلة أمان' },
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

    // Find user by username
    const user = await db.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'اسم المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Verify security questions
    const isVerified = await verifySecurityQuestions(user.id, securityAnswers)
    
    if (!isVerified) {
      return NextResponse.json(
        { error: 'إجابات الأسئلة الأمنية غير صحيحة' },
        { status: 401 }
      )
    }

    // Reset password
    await resetPassword(user.id, newPassword)

    // Log the password reset
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'تم إعادة تعيين كلمة المرور بنجاح'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' },
      { status: 500 }
    )
  }
}