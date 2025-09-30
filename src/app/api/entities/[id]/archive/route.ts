import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { archive } = body

    if (typeof archive !== 'boolean') {
      return NextResponse.json(
        { error: 'Archive status must be a boolean' },
        { status: 400 }
      )
    }

    const entity = await db.entity.update({
      where: { id },
      data: {
        isArchived: archive,
        archivedAt: archive ? new Date() : null
      }
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Error updating entity archive status:', error)
    return NextResponse.json(
      { error: 'Failed to update entity archive status' },
      { status: 500 }
    )
  }
}