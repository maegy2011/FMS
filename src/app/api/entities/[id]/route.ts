import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, type, governorate, subtype, description, address, phone, email, website } = body

    if (!name || !type || !governorate || (type === 'main' && !subtype)) {
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
        governorate,
        subtype: type === 'main' ? subtype : null,
        description: description || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null
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
      // Archive the entity instead of deleting it
      const archivedEntity = await db.entity.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        }
      })

      return NextResponse.json({ 
        message: 'Entity archived successfully due to associated revenues',
        archivedEntity,
        revenuesCount: entityWithRevenues.revenues.length
      })
    }

    // If no revenues, delete the entity
    await db.entity.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Entity deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting entity:', error)
    return NextResponse.json(
      { error: 'Failed to delete entity' },
      { status: 500 }
    )
  }
}