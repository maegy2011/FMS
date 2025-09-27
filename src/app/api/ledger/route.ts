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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      db.ledgerEntry.findMany({
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
        },
        orderBy: {
          date: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.ledgerEntry.count()
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ledger GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب قيود دفتر الاستاذ' },
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

    // Create ledger entry
    const entry = await db.ledgerEntry.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
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
        action: 'CREATE_LEDGER_ENTRY',
        description: `إنشاء قيد في دفتر الاستاذ: ${description} - ${amount} ر.س (${type === 'DEBIT' ? 'مدين' : 'دائن'})`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء القيد بنجاح',
      entry
    });

  } catch (error) {
    console.error('Ledger POST error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء القيد' },
      { status: 500 }
    );
  }
}