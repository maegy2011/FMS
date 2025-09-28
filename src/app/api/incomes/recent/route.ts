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

    // Get recent incomes with entity information
    const recentIncomes = await db.income.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        entity: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json(recentIncomes)
  } catch (error) {
    console.error('Recent incomes error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الإيرادات الأخيرة' },
      { status: 500 }
    )
  }
}