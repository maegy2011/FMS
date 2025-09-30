import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { entityIds } = await request.json()

    if (!entityIds || !Array.isArray(entityIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Fetch entities with the specified IDs
    const entities = await db.entity.findMany({
      where: {
        id: {
          in: entityIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (entities.length === 0) {
      return NextResponse.json(
        { error: 'No entities found' },
        { status: 404 }
      )
    }

    // Create CSV content
    const headers = [
      'id',
      'name', 
      'type',
      'governorate',
      'description',
      'address',
      'phone',
      'email',
      'website',
      'isArchived',
      'archivedAt',
      'createdAt',
      'updatedAt'
    ]

    const csvRows = entities.map(entity => [
      entity.id,
      entity.name,
      entity.type,
      entity.governorate,
      entity.description || '',
      entity.address || '',
      entity.phone || '',
      entity.email || '',
      entity.website || '',
      entity.isArchived,
      entity.archivedAt || '',
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString()
    ])

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(cell => {
          // Escape commas and quotes in cells
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        }).join(',')
      )
    ].join('\n')

    // Create response with CSV file
    const response = new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="entities_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

    return response

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}