import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, securityAnswers } = await request.json();

    // Basic validation
    if (!username || !securityAnswers || !Array.isArray(securityAnswers)) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
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

    // Get security questions with answers
    const securityQuestions = await db.securityQuestion.findMany({
      where: {
        userId: user.id
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

    // Verify answers
    let correctAnswers = 0;
    for (let i = 0; i < securityQuestions.length; i++) {
      if (i < securityAnswers.length && 
          securityAnswers[i].trim().toLowerCase() === securityQuestions[i].answer.trim().toLowerCase()) {
        correctAnswers++;
      }
    }

    // Require at least 3 correct answers out of 5
    if (correctAnswers < 3) {
      return NextResponse.json(
        { error: `إجابات غير صحيحة. لقد أجبت بشكل صحيح على ${correctAnswers} من ${securityQuestions.length} أسئلة` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'تم التحقق من الهوية بنجاح',
      correctAnswers,
      totalQuestions: securityQuestions.length
    });

  } catch (error) {
    console.error('Security questions verification error:', error);
    return NextResponse.json(
      { error: 'فشل في التحقق من الأسئلة الأمنية' },
      { status: 500 }
    );
  }
}