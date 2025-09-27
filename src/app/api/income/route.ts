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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const [incomes, total] = await Promise.all([
      db.income.findMany({
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
        },
        where: {
          isArchived: false
        },
        orderBy: {
          date: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.income.count({
        where: {
          isArchived: false
        }
      })
    ]);

    return NextResponse.json({
      incomes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Income GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإيرادات' },
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

    // Create income
    const income = await db.income.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        category,
        entityId: entityId || null,
        reference: reference || null,
        notes: notes || null,
        userId: (decoded as any).userId
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

    // Create ledger entry
    await db.ledgerEntry.create({
      data: {
        amount: parseFloat(amount),
        description: `إيراد: ${description}`,
        date: new Date(date),
        type: 'CREDIT',
        reference: reference || null,
        notes: notes || null,
        userId: (decoded as any).userId,
        incomeId: income.id,
        entityId: entityId || null
      }
    });

    // Log user activity
    await db.userActivityLog.create({
      data: {
        userId: (decoded as any).userId,
        action: 'CREATE_INCOME',
        description: `إنشاء إيراد جديد: ${description} - ${amount} ر.س`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء الإيراد بنجاح',
      income
    });

  } catch (error) {
    console.error('Income POST error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الإيراد' },
      { status: 500 }
    );
  }
}