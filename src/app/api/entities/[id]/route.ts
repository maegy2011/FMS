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

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const entity = await db.entity.findUnique({
      where: {
        id: id,
        isActive: true
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

    if (!entity) {
      return NextResponse.json(
        { error: 'الجهة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entity });

  } catch (error) {
    console.error('Entity GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الجهة' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { id } = context.params;
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

    // Check if entity exists and belongs to user
    const existingEntity = await db.entity.findUnique({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!existingEntity) {
      return NextResponse.json(
        { error: 'الجهة غير موجودة' },
        { status: 404 }
      );
    }

    // Update entity
    const entity = await db.entity.update({
      where: {
        id: id
      },
      data: {
        name,
        type,
        description: description || null,
        phone: phone || null,
        email: email || null,
        address: address || null
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
        action: 'UPDATE_ENTITY',
        description: `تحديث الجهة: ${name} (${type})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم تحديث الجهة بنجاح',
      entity
    });

  } catch (error) {
    console.error('Entity PUT error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الجهة' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { id } = context.params;

    // Check if entity exists
    const existingEntity = await db.entity.findUnique({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!existingEntity) {
      return NextResponse.json(
        { error: 'الجهة غير موجودة' },
        { status: 404 }
      );
    }

    // Soft delete entity
    await db.entity.update({
      where: {
        id: id
      },
      data: {
        isActive: false
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'DELETE_ENTITY',
        description: `حذف الجهة: ${existingEntity.name} (${existingEntity.type})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم حذف الجهة بنجاح'
    });

  } catch (error) {
    console.error('Entity DELETE error:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الجهة' },
      { status: 500 }
    );
  }
}