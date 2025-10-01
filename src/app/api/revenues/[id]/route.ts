import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { entityName, value, dueDate, period, type, notes, entityId } = body

    if (!entityName || !value || !dueDate || !period || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const revenue = await db.revenue.update({
      where: { id },
      data: {
        entityName,
        value: parseFloat(value),
        dueDate: new Date(dueDate),
        period,
        type,
        notes,
        entityId: entityId ? parseInt(entityId) : null
      },
      include: {
        entity: true
      }
    })

    return NextResponse.json(revenue)
  } catch (error) {
    console.error('Error updating revenue:', error)
    return NextResponse.json(
      { error: 'Failed to update revenue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await db.revenue.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Revenue deleted successfully' })
  } catch (error) {
    console.error('Error deleting revenue:', error)
    return NextResponse.json(
      { error: 'Failed to delete revenue' },
      { status: 500 }
    )
  }
}