import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, type, governorate } = body

    if (!name || !type || !governorate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entity = await db.entity.update({
      where: { id },
      data: {
        name,
        type,
        governorate
      }
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Error updating entity:', error)
    return NextResponse.json(
      { error: 'Failed to update entity' },
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

    // Check if entity has associated revenues
    const entityWithRevenues = await db.entity.findUnique({
      where: { id },
      include: {
        revenues: true
      }
    })

    if (!entityWithRevenues) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    if (entityWithRevenues.revenues.length > 0) {
      // Option 1: Delete associated revenues
      await db.revenue.deleteMany({
        where: { entityId: id }
      })
      
      // Option 2: Or keep revenues but disassociate them
      // await db.revenue.updateMany({
      //   where: { entityId: id },
      //   data: { entityId: null }
      // })
    }

    await db.entity.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Entity and associated revenues deleted successfully',
      deletedRevenuesCount: entityWithRevenues.revenues.length
    })
  } catch (error) {
    console.error('Error deleting entity:', error)
    return NextResponse.json(
      { error: 'Failed to delete entity' },
      { status: 500 }
    )
  }
}