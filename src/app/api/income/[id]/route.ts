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

    const income = await db.income.findUnique({
      where: {
        id: id,
        isArchived: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!income) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ income });

  } catch (error) {
    console.error('Income GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإيراد' },
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
    const { amount, description, date, category, entityId, reference, notes, captcha, password } = await request.json();

    // Validation
    if (!amount || !description || !date || !category) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب أن تملأ' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون أكبر من صفر' },
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

    // Check if income exists
    const existingIncome = await db.income.findUnique({
      where: {
        id: id,
        isArchived: false
      }
    });

    if (!existingIncome) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      );
    }

    // Update income
    const income = await db.income.update({
      where: {
        id: id
      },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        category,
        entityId: entityId || null,
        reference: reference || null,
        notes: notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Update corresponding ledger entry
    await db.ledgerEntry.updateMany({
      where: {
        incomeId: id
      },
      data: {
        amount: parseFloat(amount),
        description: `إيراد: ${description}`,
        date: new Date(date),
        reference: reference || null,
        notes: notes || null,
        entityId: entityId || null
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'UPDATE_INCOME',
        description: `تحديث الإيراد: ${description} - ${amount} ر.س`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم تحديث الإيراد بنجاح',
      income
    });

  } catch (error) {
    console.error('Income PUT error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإيراد' },
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

    // Check if income exists
    const existingIncome = await db.income.findUnique({
      where: {
        id: id,
        isArchived: false
      }
    });

    if (!existingIncome) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      );
    }

    // Soft delete income
    await db.income.update({
      where: {
        id: id
      },
      data: {
        isArchived: true
      }
    });

    // Archive corresponding ledger entry
    await db.ledgerEntry.updateMany({
      where: {
        incomeId: id
      },
      data: {
        notes: `أرشيف: ${existingIncome.description}`
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'DELETE_INCOME',
        description: `حذف الإيراد: ${existingIncome.description} - ${existingIncome.amount} ر.س`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم حذف الإيراد بنجاح'
    });

  } catch (error) {
    console.error('Income DELETE error:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإيراد' },
      { status: 500 }
    );
  }
}