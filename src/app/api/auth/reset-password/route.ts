import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, newPassword } = await request.json();

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'فشل في تغيير كلمة المرور' },
      { status: 500 }
    );
  }
}