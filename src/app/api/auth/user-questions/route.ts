import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, captchaToken, captchaAnswer } = await request.json()

    if (!username || !captchaToken || !captchaAnswer) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
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
      where: { username },
      include: { securityQuestions: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'اسم المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'الحساب غير نشط' },
        { status: 403 }
      )
    }

    // Return the security questions (without answers)
    const questions = user.securityQuestions.map(q => ({
      question: q.question
    }))

    return NextResponse.json({
      message: 'تم العثور على المستخدم',
      questions
    })
  } catch (error) {
    console.error('User questions error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء البحث عن المستخدم' },
      { status: 500 }
    )
  }
}