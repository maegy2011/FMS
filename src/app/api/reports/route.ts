import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get all reports
    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        generatedBy: {
          select: {
            fullName: true
          }
        }
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل التقارير' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { type, incomeIds } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'نوع التقرير مطلوب' },
        { status: 400 }
      )
    }

    // Generate report content based on type
    let content = ''
    let title = ''

    switch (type) {
      case 'MONTHLY_INCOME':
        title = 'تقرير شهري للإيرادات'
        content = await generateMonthlyIncomeReport()
        break
      case 'ENTITY_SUMMARY':
        title = 'ملخص الجهات'
        content = await generateEntitySummaryReport()
        break
      case 'OVERDUE_REPORT':
        title = 'تقرير الإيرادات المتأخرة'
        content = await generateOverdueReport()
        break
      case 'COLLECTION_REPORT':
        title = 'تقرير التحصيل'
        content = await generateCollectionReport()
        break
      case 'ANALYSIS_REPORT':
        title = 'تحليل مالي'
        content = await generateAnalysisReport()
        break
      default:
        return NextResponse.json(
          { error: 'نوع التقرير غير صالح' },
          { status: 400 }
        )
    }

    // Create report
    const report = await db.report.create({
      data: {
        title,
        type,
        content,
        incomeIds: incomeIds || [],
        generatedById: payload.userId
      },
      include: {
        generatedBy: {
          select: {
            fullName: true
          }
        }
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'GENERATE_REPORT',
        entityType: 'Report',
        entityId: report.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: `Generated report: ${title}`
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التقرير' },
      { status: 500 }
    )
  }
}

async function generateMonthlyIncomeReport() {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const incomes = await db.income.findMany({
    where: {
      createdAt: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1)
      }
    },
    include: {
      entity: true
    }
  })

  const total = incomes.reduce((sum, income) => sum + income.amount, 0)
  const collected = incomes
    .filter(income => income.status === 'COLLECTED')
    .reduce((sum, income) => sum + income.amount, 0)

  return `
تقرير شهري للإيرادات - ${currentMonth + 1}/${currentYear}

الملخص:
- إجمالي الإيرادات: ${total.toFixed(2)} ر.س
- الإيرادات المحصلة: ${collected.toFixed(2)} ر.س
- نسبة التحصيل: ${total > 0 ? ((collected / total) * 100).toFixed(1) : 0}%

التفاصيل:
${incomes.map(income => `
- ${income.entity.name}: ${income.amount.toFixed(2)} ر.س (${income.status})
`).join('')}
  `.trim()
}

async function generateEntitySummaryReport() {
  const entities = await db.entity.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          incomes: true
        }
      },
      incomes: {
        select: {
          amount: true,
          status: true
        }
      }
    }
  })

  return `
ملخص الجهات

${entities.map(entity => {
  const totalAmount = entity.incomes.reduce((sum, income) => sum + income.amount, 0)
  const collectedAmount = entity.incomes
    .filter(income => income.status === 'COLLECTED')
    .reduce((sum, income) => sum + income.amount, 0)
  
  return `
${entity.name} (${entity.type}):
- عدد الإيرادات: ${entity._count.incomes}
- إجمالي المبلغ: ${totalAmount.toFixed(2)} ر.س
- المحصل: ${collectedAmount.toFixed(2)} ر.س
- نسبة التحصيل: ${totalAmount > 0 ? ((collectedAmount / totalAmount) * 100).toFixed(1) : 0}%
`
}).join('')}
  `.trim()
}

async function generateOverdueReport() {
  const overdueIncomes = await db.income.findMany({
    where: {
      status: 'PENDING',
      dueDate: {
        lt: new Date()
      }
    },
    include: {
      entity: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  const totalOverdue = overdueIncomes.reduce((sum, income) => sum + income.amount, 0)

  return `
تقرير الإيرادات المتأخرة

الملخص:
- عدد الإيرادات المتأخرة: ${overdueIncomes.length}
- إجمالي المبلغ المتأخر: ${totalOverdue.toFixed(2)} ر.س

التفاصيل:
${overdueIncomes.map(income => `
- ${income.entity.name}: ${income.amount.toFixed(2)} ر.س (تاريخ الاستحقاق: ${income.dueDate.toISOString().split('T')[0]})
`).join('')}
  `.trim()
}

async function generateCollectionReport() {
  const collectedIncomes = await db.income.findMany({
    where: {
      status: 'COLLECTED'
    },
    include: {
      entity: true
    },
    orderBy: {
      collectedAt: 'desc'
    }
  })

  const totalCollected = collectedIncomes.reduce((sum, income) => sum + income.amount, 0)

  return `
تقرير التحصيل

الملخص:
- عدد الإيرادات المحصلة: ${collectedIncomes.length}
- إجمالي المبلغ المحصل: ${totalCollected.toFixed(2)} ر.س

التفاصيل:
${collectedIncomes.map(income => `
- ${income.entity.name}: ${income.amount.toFixed(2)} ر.س (تاريخ التحصيل: ${income.collectedAt?.toISOString().split('T')[0]})
`).join('')}
  `.trim()
}

async function generateAnalysisReport() {
  const [incomes, entities] = await Promise.all([
    db.income.findMany({
      include: {
        entity: true
      }
    }),
    db.entity.findMany({
      where: { isActive: true }
    })
  ])

  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0)
  const collectedIncomes = incomes.filter(income => income.status === 'COLLECTED')
  const totalCollected = collectedIncomes.reduce((sum, income) => sum + income.amount, 0)

  const typeStats = incomes.reduce((acc, income) => {
    acc[income.type] = (acc[income.type] || 0) + income.amount
    return acc
  }, {} as Record<string, number>)

  const entityStats = incomes.reduce((acc, income) => {
    acc[income.entity.name] = (acc[income.entity.name] || 0) + income.amount
    return acc
  }, {} as Record<string, number>)

  return `
تحليل مالي

الملخص العام:
- إجمالي الإيرادات: ${totalIncomes.toFixed(2)} ر.س
- الإيرادات المحصلة: ${totalCollected.toFixed(2)} ر.س
- نسبة التحصيل العامة: ${totalIncomes > 0 ? ((totalCollected / totalIncomes) * 100).toFixed(1) : 0}%
- عدد الجهات: ${entities.length}

تحليل حسب النوع:
${Object.entries(typeStats).map(([type, amount]) => `
- ${type}: ${amount.toFixed(2)} ر.س (${totalIncomes > 0 ? ((amount / totalIncomes) * 100).toFixed(1) : 0}%)
`).join('')}

تحليل حسب الجهة:
${Object.entries(entityStats).map(([entity, amount]) => `
- ${entity}: ${amount.toFixed(2)} ر.س (${totalIncomes > 0 ? ((amount / totalIncomes) * 100).toFixed(1) : 0}%)
`).join('')}
  `.trim()
}