import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let whereClause = {}
    
    // If date range is provided, filter revenues by date
    if (startDate || endDate) {
      whereClause = {
        revenues: {
          some: {
            ...(startDate && { dueDate: { gte: new Date(startDate) } }),
            ...(endDate && { dueDate: { lte: new Date(endDate) } })
          }
        }
      }
    }
    
    const entities = await db.entity.findMany({
      where: whereClause,
      include: {
        revenues: {
          where: {
            ...(startDate && { dueDate: { gte: new Date(startDate) } }),
            ...(endDate && { dueDate: { lte: new Date(endDate) } })
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })
    
    // Calculate total revenue for each entity based on filtered revenues
    const entitiesWithRevenue = entities.map(entity => ({
      ...entity,
      totalRevenue: entity.revenues.reduce((sum, revenue) => sum + revenue.value, 0),
      revenuesCount: entity.revenues.length,
      // Include overall revenue for comparison
      overallRevenue: startDate || endDate ? null : undefined
    }))
    
    return NextResponse.json(entitiesWithRevenue)
  } catch (error) {
    console.error('Error fetching entities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, governorate } = body

    if (!name || !type || !governorate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entity = await db.entity.create({
      data: {
        name,
        type,
        governorate
      }
    })

    return NextResponse.json(entity, { status: 201 })
  } catch (error) {
    console.error('Error creating entity:', error)
    return NextResponse.json(
      { error: 'Failed to create entity' },
      { status: 500 }
    )
  }
}