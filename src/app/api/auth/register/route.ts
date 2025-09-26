import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email,
        name,
        role: role || 'VIEWER',
        active: true,
      },
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الحساب' },
      { status: 500 }
    );
  }
}