import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'الحالة مطلوبة' },
        { status: 400 }
      )
    }

    // Find the income
    const income = await db.income.findUnique({
      where: { id: params.id },
      include: {
        entity: true
      }
    })

    if (!income) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      )
    }

    // Update income status
    const updateData: any = { status }
    
    if (status === 'COLLECTED') {
      updateData.collectedAt = new Date()
    }

    const updatedIncome = await db.income.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'UPDATE_INCOME_STATUS',
        entityType: 'Income',
        entityId: income.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Updated income status from ${income.status} to ${status}`
      }
    })

    return NextResponse.json(updatedIncome)
  } catch (error) {
    console.error('Update income status error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث حالة الإيراد' },
      { status: 500 }
    )
  }
}