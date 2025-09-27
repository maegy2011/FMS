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
    const reportType = searchParams.get('type');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!reportType) {
      return NextResponse.json(
        { error: 'نوع التقرير مطلوب' },
        { status: 400 }
      );
    }

    let reportData = {};

    switch (reportType) {
      case 'monthly':
        // Monthly income report
        const monthlyData = await db.income.groupBy({
          by: ['date'],
          _sum: {
            amount: true
          },
          _count: {
            _all: true
          },
          where: {
            date: {
              gte: new Date(year, 0, 1),
              lte: new Date(year, 11, 31)
            },
            isArchived: false
          },
          orderBy: {
            date: 'asc'
          }
        });

        // Group by month
        const monthlyReport = Array.from({ length: 12 }, (_, i) => {
          const monthData = monthlyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === i;
          });
          
          const total = monthData.reduce((sum, item) => sum + (item._sum.amount || 0), 0);
          const count = monthData.reduce((sum, item) => sum + item._count._all, 0);
          
          return {
            month: i + 1,
            monthName: new Date(year, i).toLocaleDateString('ar-SA', { month: 'long' }),
            totalIncome: total,
            transactionCount: count
          };
        });

        reportData = {
          type: 'monthly',
          year,
          data: monthlyReport,
          summary: {
            totalIncome: monthlyReport.reduce((sum, month) => sum + month.totalIncome, 0),
            totalTransactions: monthlyReport.reduce((sum, month) => sum + month.transactionCount, 0),
            averageMonthlyIncome: monthlyReport.reduce((sum, month) => sum + month.totalIncome, 0) / 12
          }
        };
        break;

      case 'category':
        // Income by category report
        const categoryData = await db.income.groupBy({
          by: ['category'],
          _sum: {
            amount: true
          },
          _count: {
            _all: true
          },
          where: {
            date: {
              gte: new Date(year, 0, 1),
              lte: new Date(year, 11, 31)
            },
            isArchived: false
          }
        });

        const categoryMap: { [key: string]: string } = {
          'SALARY': 'راتب',
          'RENT': 'إيجار',
          'INVESTMENT': 'استثمار',
          'SERVICE': 'خدمة',
          'OTHER': 'أخرى'
        };

        reportData = {
          type: 'category',
          year,
          data: categoryData.map(item => ({
            category: item.category,
            categoryName: categoryMap[item.category] || item.category,
            totalIncome: item._sum.amount || 0,
            transactionCount: item._count._all
          })),
          summary: {
            totalIncome: categoryData.reduce((sum, item) => sum + (item._sum.amount || 0), 0),
            totalTransactions: categoryData.reduce((sum, item) => sum + item._count._all, 0),
            categoryCount: categoryData.length
          }
        };
        break;

      case 'entity':
        // Income by entity report
        const entityData = await db.income.groupBy({
          by: ['entityId'],
          _sum: {
            amount: true
          },
          _count: {
            _all: true
          },
          where: {
            date: {
              gte: new Date(year, 0, 1),
              lte: new Date(year, 11, 31)
            },
            isArchived: false,
            entityId: {
              not: null
            }
          }
        });

        // Get entity details
        const entityIds = entityData.map(item => item.entityId).filter(Boolean);
        const entities = await db.entity.findMany({
          where: {
            id: {
              in: entityIds as string[]
            }
          }
        });

        const entityMap: { [key: string]: any } = {};
        entities.forEach(entity => {
          entityMap[entity.id] = entity;
        });

        const entityTypeMap: { [key: string]: string } = {
          'MAIN': 'رئيسية',
          'SUBSIDIARY': 'تابعة',
          'WORKER': 'عامل'
        };

        reportData = {
          type: 'entity',
          year,
          data: entityData.map(item => {
            const entity = entityMap[item.entityId || ''];
            return {
              entityId: item.entityId,
              entityName: entity?.name || 'غير معروف',
              entityType: entity?.type || 'UNKNOWN',
              entityTypeName: entityTypeMap[entity?.type || 'UNKNOWN'] || 'غير معروف',
              totalIncome: item._sum.amount || 0,
              transactionCount: item._count._all
            };
          }),
          summary: {
            totalIncome: entityData.reduce((sum, item) => sum + (item._sum.amount || 0), 0),
            totalTransactions: entityData.reduce((sum, item) => sum + item._count._all, 0),
            entityCount: entityData.length
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'نوع التقرير غير معروف' },
          { status: 400 }
        );
    }

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب التقرير' },
      { status: 500 }
    );
  }
}