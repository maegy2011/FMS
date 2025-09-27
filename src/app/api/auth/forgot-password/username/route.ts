import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, captcha } = await request.json();

    // Basic validation
    if (!username) {
      return NextResponse.json(
        { error: 'اسم المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Simple captcha validation
    if (!captcha || captcha.toLowerCase() !== 'fms') {
      return NextResponse.json(
        { error: 'رمز CAPTCHA غير صحيح' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ],
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'اسم المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Get security questions
    const securityQuestions = await db.securityQuestion.findMany({
      where: {
        userId: user.id
      },
      select: {
        question: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (securityQuestions.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد أسئلة أمان محددة لهذا الحساب' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'تم العثور على المستخدم',
      securityQuestions: securityQuestions.map(sq => sq.question)
    });

  } catch (error) {
    console.error('Forgot password username error:', error);
    return NextResponse.json(
      { error: 'فشل في التحقق من اسم المستخدم' },
      { status: 500 }
    );
  }
}