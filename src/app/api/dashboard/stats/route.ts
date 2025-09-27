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

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch stats in parallel
    const [totalIncome, totalEntities, monthlyIncome, recentTransactions] = await Promise.all([
      // Total income
      db.income.aggregate({
        where: {
          isArchived: false
        },
        _sum: {
          amount: true
        }
      }),

      // Total entities
      db.entity.count({
        where: {
          isActive: true
        }
      }),

      // Monthly income
      db.income.aggregate({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          },
          isArchived: false
        },
        _sum: {
          amount: true
        }
      }),

      // Recent transactions (last 7 days)
      db.income.count({
        where: {
          date: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          },
          isArchived: false
        }
      })
    ]);

    const stats = {
      totalIncome: totalIncome._sum.amount || 0,
      totalEntities,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      recentTransactions
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}