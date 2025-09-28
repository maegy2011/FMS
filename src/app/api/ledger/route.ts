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

    // Get all ledger entries with related data
    const ledgerEntries = await db.ledger.findMany({
      orderBy: { date: 'desc' },
      include: {
        income: {
          include: {
            entity: {
              select: {
                name: true
              }
            }
          }
        },
        entity: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    // Calculate running balance
    let runningBalance = 0
    const entriesWithBalance = ledgerEntries.map(entry => {
      runningBalance += (entry.debit - entry.credit)
      return {
        ...entry,
        balance: runningBalance
      }
    })

    return NextResponse.json(entriesWithBalance)
  } catch (error) {
    console.error('Ledger error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل دفتر الاستاذ' },
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

    const { description, debit, credit, entityId } = await request.json()

    if (!description) {
      return NextResponse.json(
        { error: 'البيان مطلوب' },
        { status: 400 }
      )
    }

    if (!debit && !credit) {
      return NextResponse.json(
        { error: 'يجب إدخال مبلغ مدين أو دائن على الأقل' },
        { status: 400 }
      )
    }

    if (debit && credit) {
      return NextResponse.json(
        { error: 'لا يمكن إدخال مبلغ مدين ودائن في نفس القيد' },
        { status: 400 }
      )
    }

    // Verify entity exists if provided
    if (entityId) {
      const entity = await db.entity.findUnique({
        where: { id: entityId }
      })

      if (!entity) {
        return NextResponse.json(
          { error: 'الجهة المحددة غير موجودة' },
          { status: 404 }
        )
      }
    }

    // Create ledger entry
    const ledgerEntry = await db.ledger.create({
      data: {
        description,
        debit: debit || 0,
        credit: credit || 0,
        entityId,
        date: new Date()
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
        action: 'CREATE_LEDGER_ENTRY',
        entityType: 'Ledger',
        entityId: ledgerEntry.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Created ledger entry: ${description} - ${debit ? `Debit: ${debit}` : `Credit: ${credit}`}`
      }
    })

    return NextResponse.json(ledgerEntry)
  } catch (error) {
    console.error('Create ledger entry error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء القيد' },
      { status: 500 }
    )
  }
}