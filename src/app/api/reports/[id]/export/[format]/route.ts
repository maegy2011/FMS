import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; format: string } }
) {
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

    const { id, format } = params

    // Get report
    const report = await db.report.findUnique({
      where: { id },
      include: {
        generatedBy: {
          select: {
            fullName: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'التقرير غير موجود' },
        { status: 404 }
      )
    }

    // Log the export action
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'EXPORT_REPORT',
        entityType: 'Report',
        entityId: report.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Exported report in ${format.toUpperCase()} format`
      }
    })

    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(report)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="report_${id}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // Generate simple text-based PDF content
      const pdfContent = generatePDFContent(report)
      
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="report_${id}.txt"`
        }
      })
    } else {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Export report error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تصدير التقرير' },
      { status: 500 }
    )
  }
}

function generateCSV(report: any): string {
  const lines = [
    'التقرير,القيمة',
    `العنوان,${report.title}`,
    `النوع,${report.type}`,
    `تاريخ الإنشاء,${report.createdAt}`,
    `أنشأ بواسطة,${report.generatedBy.fullName}`,
    '',
    'المحتوى',
    report.content.replace(/\n/g, ' ')
  ]
  
  return lines.join('\n')
}

function generatePDFContent(report: any): string {
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                            تقرير مالي رسمي                                 ║
║                           نظام الإدارة المالية                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

العنوان: ${report.title}
النوع: ${report.type}
تاريخ الإنشاء: ${new Date(report.createdAt).toLocaleDateString('ar-SA')}
أنشأ بواسطة: ${report.generatedBy.fullName}

═══════════════════════════════════════════════════════════════════════════════

محتوى التقرير:
${report.content}

═══════════════════════════════════════════════════════════════════════════════

تم إنشاء هذا التقرير بواسطة نظام الإدارة المالية
╔══════════════════════════════════════════════════════════════════════════════╗
║                        تصميم أندلسي إسلامي                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `.trim()
}