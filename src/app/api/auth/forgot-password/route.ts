import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'اسم المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Get security questions
    const securityQuestions = await db.securityQuestion.findMany({
      where: {
        userId: user.id
      },
      select: {
        question: true,
        id: true
      }
    });

    if (securityQuestions.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد أسئلة أمان محددة لهذا المستخدم' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      questions: securityQuestions
    });

  } catch (error) {
    console.error('Forgot password GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الأسئلة الأمنية' },
      { status: 500 }
    );
  }
}