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

    // Get dashboard statistics
    const [
      totalIncomeResult,
      collectedIncomeResult,
      pendingIncomeResult,
      overdueIncomeResult,
      totalEntitiesResult,
      activeUsersResult
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
      
      // Active users
      db.user.count({
        where: { isActive: true }
      })
    ])

    const stats = {
      totalIncome: totalIncomeResult._sum.amount || 0,
      collectedIncome: collectedIncomeResult._sum.amount || 0,
      pendingIncome: pendingIncomeResult._sum.amount || 0,
      overdueIncome: overdueIncomeResult._sum.amount || 0,
      totalEntities: totalEntitiesResult,
      activeUsers: activeUsersResult
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الإحصائيات' },
      { status: 500 }
    )
  }
}