import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, answers } = await request.json();

    if (!username || !answers || !Array.isArray(answers) || answers.length !== 5) {
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
      orderBy: {
        id: 'asc'
      }
    });

    if (securityQuestions.length !== 5) {
      return NextResponse.json(
        { error: 'يجب أن يكون هناك 5 أسئلة أمان' },
        { status: 400 }
      );
    }

    // Verify answers
    let correctAnswers = 0;
    for (let i = 0; i < securityQuestions.length; i++) {
      if (securityQuestions[i].answer === answers[i]) {
        correctAnswers++;
      }
    }

    // Require at least 4 correct answers
    if (correctAnswers < 4) {
      return NextResponse.json(
        { error: `إجابات غير صحيحة (${correctAnswers}/5 صحيحة)` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'تم التحقق من الإجابات بنجاح',
      correctAnswers
    });

  } catch (error) {
    console.error('Verify answers error:', error);
    return NextResponse.json(
      { error: 'فشل في التحقق من الإجابات' },
      { status: 500 }
    );
  }
}