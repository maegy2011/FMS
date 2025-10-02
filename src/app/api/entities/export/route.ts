import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatCurrency, convertToArabicNumerals } from '@/lib/utils'

export async function GET() {
  try {
    // Fetch all entities
    const entities = await db.entity.findMany({
      include: {
        revenues: true
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

    // Create CSV content with Arabic headers
    const headers = [
      'المعرف',
      'اسم الجهة', 
      'النوع',
      'المحافظة',
      'الوصف',
      'العنوان',
      'الهاتف',
      'البريد الإلكتروني',
      'الموقع الإلكتروني',
      'الحالة',
      'تاريخ الأرشفة',
      'إجمالي الإيرادات',
      'عدد الإيرادات',
      'تاريخ الإنشاء',
      'تاريخ التحديث'
    ]

    const csvRows = entities.map(entity => {
      const totalRevenue = entity.revenues.reduce((sum, rev) => sum + rev.value, 0)
      const revenuesCount = entity.revenues.length
      
      return [
        entity.id,
        entity.name,
        entity.type === 'main' ? 'رئيسية' : entity.type === 'branch' ? 'فرعية' : 'عاملين',
        entity.governorate,
        entity.description || '',
        entity.address || '',
        entity.phone || '',
        entity.email || '',
        entity.website || '',
        entity.isArchived ? 'مؤرشف' : 'نشط',
        entity.archivedAt ? new Date(entity.archivedAt).toLocaleDateString('ar-EG') : '',
        formatCurrency(totalRevenue),
        convertToArabicNumerals(revenuesCount.toString()),
        new Date(entity.createdAt).toLocaleDateString('ar-EG'),
        new Date(entity.updatedAt).toLocaleDateString('ar-EG')
      ]
    })

    // Convert to CSV string with proper UTF-8 BOM for Arabic support
    const BOM = '\uFEFF' // Byte Order Mark for UTF-8
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
    const response = new NextResponse(BOM + csvContent, {
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