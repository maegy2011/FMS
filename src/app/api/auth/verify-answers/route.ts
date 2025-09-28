import { NextRequest, NextResponse } from 'next/server'
import { verifySecurityQuestions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, answers, captchaToken, captchaAnswer } = await request.json()

    if (!username || !answers || answers.length !== 3 || !captchaToken || !captchaAnswer) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة ويجب الإجابة على 3 أسئلة' },
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

    // Verify captcha answer
    if (captchaSession.answer !== captchaAnswer) {
      return NextResponse.json(
        { error: 'إجابة رمز التحقق غير صحيحة' },
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
    const isVerified = await verifySecurityQuestions(user.id, answers)
    
    if (!isVerified) {
      return NextResponse.json(
        { error: 'إجابات الأسئلة الأمنية غير صحيحة' },
        { status: 401 }
      )
    }

    // Log the verification attempt
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_VERIFY',
        entityType: 'User',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'تم التحقق من الأسئلة الأمنية بنجاح'
    })
  } catch (error) {
    console.error('Verify answers error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من الإجابات' },
      { status: 500 }
    )
  }
}