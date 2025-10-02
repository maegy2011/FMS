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

    const revenue = await db.revenue.update({
      where: { id },
      data: {
        isArchived: archive,
        archivedAt: archive ? new Date() : null
      },
      include: {
        entity: true
      }
    })

    return NextResponse.json(revenue)
  } catch (error) {
    console.error('Error archiving revenue:', error)
    return NextResponse.json(
      { error: 'Failed to archive revenue' },
      { status: 500 }
    )
  }
}