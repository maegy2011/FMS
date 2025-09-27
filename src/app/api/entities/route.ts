import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const entities = await db.entity.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ entities });

  } catch (error) {
    console.error('Entities GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الجهات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { name, type, description, phone, email, address, captcha, password } = await request.json();

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'الاسم والنوع مطلوبان' },
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

    // Create entity
    const entity = await db.entity.create({
      data: {
        name,
        type,
        description: description || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        userId: (decoded as any).userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'CREATE_ENTITY',
        description: `إنشاء جهة جديدة: ${name} (${type})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء الجهة بنجاح',
      entity
    });

  } catch (error) {
    console.error('Entity POST error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الجهة' },
      { status: 500 }
    );
  }
}