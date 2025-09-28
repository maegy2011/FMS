import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
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

    // Check if entity exists
    const entity = await db.entity.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            incomes: true,
            children: true
          }
        }
      }
    })

    if (!entity) {
      return NextResponse.json(
        { error: 'الجهة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if entity has related data
    if (entity._count.incomes > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الجهة لأنها مرتبطة بإيرادات' },
        { status: 400 }
      )
    }

    if (entity._count.children > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الجهة لأنها مرتبطة بجهات تابعة' },
        { status: 400 }
      )
    }

    // Delete entity (soft delete by setting isActive to false)
    const deletedEntity = await db.entity.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'DELETE_ENTITY',
        entityType: 'Entity',
        entityId: entity.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Deleted entity: ${entity.name}`
      }
    })

    return NextResponse.json({ message: 'تم حذف الجهة بنجاح' })
  } catch (error) {
    console.error('Delete entity error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الجهة' },
      { status: 500 }
    )
  }
}