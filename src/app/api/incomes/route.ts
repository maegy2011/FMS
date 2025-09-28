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

    // Get all incomes with entity information
    const incomes = await db.income.findMany({
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

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Incomes error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الإيرادات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { amount, type, description, entityId, dueDate } = await request.json()

    if (!amount || !type || !entityId || !dueDate) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
        { status: 400 }
      )
    }

    // Verify entity exists
    const entity = await db.entity.findUnique({
      where: { id: entityId }
    })

    if (!entity) {
      return NextResponse.json(
        { error: 'الجهة المحددة غير موجودة' },
        { status: 404 }
      )
    }

    // Create income
    const income = await db.income.create({
      data: {
        amount: parseFloat(amount),
        type,
        description,
        entityId,
        dueDate: new Date(dueDate),
        createdById: payload.userId
      },
      include: {
        entity: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'CREATE_INCOME',
        entityType: 'Income',
        entityId: income.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Created income of ${amount} for entity ${entity.name}`
      }
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Create income error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الإيراد' },
      { status: 500 }
    )
  }
}