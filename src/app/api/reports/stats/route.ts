import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح' },
        { status: 401 }
      )
    }

    // Get basic statistics
    const [
      totalIncomesResult,
      collectedIncomesResult,
      pendingIncomesResult,
      overdueIncomesResult,
      totalEntitiesResult,
      totalReportsResult
    ] = await Promise.all([
      // Total income
      db.income.aggregate({
        _sum: { amount: true }
      }),
      
      // Collected income
      db.income.aggregate({
        where: { status: 'COLLECTED' },
        _sum: { amount: true }
      }),
      
      // Pending income
      db.income.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      }),
      
      // Overdue income
      db.income.aggregate({
        where: { 
          status: 'PENDING',
          dueDate: { lt: new Date() }
        },
        _sum: { amount: true }
      }),
      
      // Total entities
      db.entity.count({
        where: { isActive: true }
      }),
      
      // Total reports
      db.report.count()
    ])

    // Get monthly statistics for the last 6 months
    const monthlyStats = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
      
      const [monthTotal, monthCollected] = await Promise.all([
        db.income.aggregate({
          where: {
            createdAt: {
              gte: month,
              lt: nextMonth
            }
          },
          _sum: { amount: true }
        }),
        
        db.income.aggregate({
          where: {
            createdAt: {
              gte: month,
              lt: nextMonth
            },
            status: 'COLLECTED'
          },
          _sum: { amount: true }
        })
      ])
      
      monthlyStats.push({
        month: month.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' }),
        total: monthTotal._sum.amount || 0,
        collected: monthCollected._sum.amount || 0
      })
    }

    // Get entity type statistics
    const entityStats = await db.entity.findMany({
      where: { isActive: true },
      include: {
        incomes: {
          select: {
            amount: true
          }
        }
      }
    })

    const entityTypeStats = entityStats.reduce((acc, entity) => {
      const totalAmount = entity.incomes.reduce((sum, income) => sum + income.amount, 0)
      
      const existing = acc.find(item => item.type === entity.type)
      if (existing) {
        existing.count += 1
        existing.totalAmount += totalAmount
      } else {
        acc.push({
          type: entity.type,
          count: 1,
          totalAmount
        })
      }
      
      return acc
    }, [] as Array<{ type: string; count: number; totalAmount: number }>)

    // Get income type statistics
    const incomeTypeStats = await db.income.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    })

    const stats = {
      totalIncomes: totalIncomesResult._sum.amount || 0,
      collectedIncomes: collectedIncomesResult._sum.amount || 0,
      pendingIncomes: pendingIncomesResult._sum.amount || 0,
      overdueIncomes: overdueIncomesResult._sum.amount || 0,
      totalEntities: totalEntitiesResult,
      totalReports: totalReportsResult,
      monthlyStats,
      entityTypeStats,
      incomeTypeStats: incomeTypeStats.map(stat => ({
        type: stat.type,
        count: stat._count._all,
        totalAmount: stat._sum.amount || 0
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Reports stats error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل إحصائيات التقارير' },
      { status: 500 }
    )
  }
}