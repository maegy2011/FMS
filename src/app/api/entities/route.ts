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

    // Get all active entities with income count
    const entities = await db.entity.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            incomes: true
          }
        },
        parent: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(entities)
  } catch (error) {
    console.error('Entities error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الجهات' },
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

    const { name, type, address, phone, email, description, parentId } = await request.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: 'اسم الجهة والنوع مطلوبان' },
        { status: 400 }
      )
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentEntity = await db.entity.findUnique({
        where: { id: parentId }
      })

      if (!parentEntity) {
        return NextResponse.json(
          { error: 'الجهة الرئيسية المحددة غير موجودة' },
          { status: 404 }
        )
      }
    }

    // Create entity
    const entity = await db.entity.create({
      data: {
        name,
        type,
        address,
        phone,
        email,
        description,
        parentId,
        createdById: payload.userId
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'CREATE_ENTITY',
        entityType: 'Entity',
        entityId: entity.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Created entity: ${name} (${type})`
      }
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Create entity error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الجهة' },
      { status: 500 }
    )
  }
}