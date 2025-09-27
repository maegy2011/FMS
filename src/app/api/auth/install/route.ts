import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, name, securityQuestions } = await request.json();

    // Check if admin already exists
    const adminCount = await db.user.count({
      where: {
        role: 'SYSTEM_ADMIN'
      }
    });

    if (adminCount > 0) {
      return NextResponse.json(
        { error: 'تم إنشاء حساب مدير النظام بالفعل. لا يمكن إنشاء حساب آخر' },
        { status: 403 }
      );
    }

    // Basic validation
    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Validate security questions
    if (!securityQuestions || !Array.isArray(securityQuestions) || securityQuestions.length !== 5) {
      return NextResponse.json(
        { error: 'يجب توفير 5 أسئلة أمان' },
        { status: 400 }
      );
    }

    for (const sq of securityQuestions) {
      if (!sq.question || !sq.answer) {
        return NextResponse.json(
          { error: 'جميع الأسئلة والأجوبة مطلوبة' },
          { status: 400 }
        );
      }
    }

    // Check if username or email already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role: 'SYSTEM_ADMIN'
      }
    });

    // Create security questions
    for (const sq of securityQuestions) {
      await db.securityQuestion.create({
        data: {
          userId: user.id,
          question: sq.question,
          answer: sq.answer
        }
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'SYSTEM_INSTALL',
        description: 'إنشاء حساب مدير النظام الأول',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء حساب مدير النظام بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Install error:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء حساب مدير النظام. يرجى المحاولة مرة أخرى' },
      { status: 500 }
    );
  }
}