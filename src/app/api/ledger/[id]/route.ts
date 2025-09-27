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

    const entry = await db.ledgerEntry.findUnique({
      where: {
        id: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        income: {
          select: {
            id: true,
            description: true,
            category: true
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

    if (!entry) {
      return NextResponse.json(
        { error: 'القيد غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });

  } catch (error) {
    console.error('Ledger GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب القيد' },
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
    const { amount, description, date, type, entityId, reference, notes, captcha, password } = await request.json();

    // Validation
    if (!amount || !description || !date || !type) {
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

    if (!['DEBIT', 'CREDIT'].includes(type)) {
      return NextResponse.json(
        { error: 'نوع القيد يجب أن يكون مدين أو دائن' },
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

    // Check if entry exists
    const existingEntry = await db.ledgerEntry.findUnique({
      where: {
        id: id
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'القيد غير موجود' },
        { status: 404 }
      );
    }

    // Update ledger entry
    const entry = await db.ledgerEntry.update({
      where: {
        id: id
      },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
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
        income: {
          select: {
            id: true,
            description: true,
            category: true
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

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'UPDATE_LEDGER_ENTRY',
        description: `تحديث القيد في دفتر الاستاذ: ${description} - ${amount} ر.س (${type === 'DEBIT' ? 'مدين' : 'دائن'})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم تحديث القيد بنجاح',
      entry
    });

  } catch (error) {
    console.error('Ledger PUT error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث القيد' },
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

    // Check if entry exists
    const existingEntry = await db.ledgerEntry.findUnique({
      where: {
        id: id
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'القيد غير موجود' },
        { status: 404 }
      );
    }

    // Delete ledger entry
    await db.ledgerEntry.delete({
      where: {
        id: id
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'DELETE_LEDGER_ENTRY',
        description: `حذف القيد من دفتر الاستاذ: ${existingEntry.description} - ${existingEntry.amount} ر.س (${existingEntry.type === 'DEBIT' ? 'مدين' : 'دائن'})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم حذف القيد بنجاح'
    });

  } catch (error) {
    console.error('Ledger DELETE error:', error);
    return NextResponse.json(
      { error: 'فشل في حذف القيد' },
      { status: 500 }
    );
  }
}