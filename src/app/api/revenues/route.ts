import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const revenues = await db.revenue.findMany({
      include: {
        entity: true
      },
      orderBy: {
        id: 'desc'
      }
    })
    
    return NextResponse.json(revenues)
  } catch (error) {
    console.error('Error fetching revenues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityName, value, dueDate, period, type, notes, entityId } = body

    if (!entityName || !value || !dueDate || !period || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate entity name if entityId is provided
    if (entityId) {
      const entity = await db.entity.findUnique({
        where: { id: parseInt(entityId) }
      })
      
      if (!entity) {
        return NextResponse.json(
          { error: 'Entity not found' },
          { status: 404 }
        )
      }
      
      if (entity.name !== entityName) {
        return NextResponse.json(
          { error: 'Entity name does not match the selected entity' },
          { status: 400 }
        )
      }
    }

    // Get the next serial number
    const lastRevenue = await db.revenue.findFirst({
      orderBy: {
        serial: 'desc'
      }
    })

    const nextSerial = lastRevenue ? lastRevenue.serial + 1 : 1

    const revenue = await db.revenue.create({
      data: {
        serial: nextSerial,
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

    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Error creating revenue:', error)
    return NextResponse.json(
      { error: 'Failed to create revenue' },
      { status: 500 }
    )
  }
}