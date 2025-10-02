import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const governorate = searchParams.get('governorate')
    const status = searchParams.get('status')
    const entityIds = searchParams.get('entityIds')
    const revenueType = searchParams.get('revenueType') || 'subscriptions'

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      )
    }

    // Build where clause for revenues
    let whereClause: any = {
      type: revenueType,
      period: {
        startsWith: year
      }
    }

    // Add month filter if provided
    if (month) {
      whereClause.period = {
        endsWith: `-${month}`
      }
    }

    // Add governorate filter if provided
    if (governorate && governorate !== 'all') {
      whereClause.entity = {
        governorate: governorate
      }
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'paid') {
        whereClause.notes = { contains: 'تم السداد' }
      } else if (status === 'late') {
        whereClause.notes = { not: { contains: 'تم السداد' } }
        whereClause.dueDate = { lt: new Date() }
      } else if (status === 'pending') {
        whereClause.notes = { not: { contains: 'تم السداد' } }
        whereClause.dueDate = { gte: new Date() }
      }
    }

    // Add entity filter if provided
    if (entityIds) {
      const entityIdArray = entityIds.split(',').map(id => parseInt(id))
      whereClause.entityId = {
        in: entityIdArray
      }
    }

    // Fetch tracking data
    const revenues = await db.revenue.findMany({
      where: whereClause,
      include: {
        entity: true
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    // Calculate tracking data with status
    const trackingData = revenues.map(revenue => {
      const currentDate = new Date()
      const dueDate = new Date(revenue.dueDate)
      const daysOverdue = Math.max(0, Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      
      let status: 'paid' | 'late' | 'pending' = 'pending'
      
      // Determine status based on notes first, then due date
      if (revenue.notes && (revenue.notes.includes('تم السداد') || revenue.notes.includes('تم السداد مسبقاً'))) {
        status = 'paid'
      } else if (currentDate > dueDate) {
        status = 'late'
      }

      return {
        id: revenue.id,
        entityName: revenue.entity?.name || revenue.entityName,
        entityGovernorate: revenue.entity?.governorate || 'غير معروف',
        entityType: revenue.entity?.type || 'غير معروف',
        revenueValue: revenue.value,
        dueDate: revenue.dueDate.toISOString().split('T')[0],
        period: revenue.period,
        daysOverdue: status === 'late' ? daysOverdue : 0,
        status,
        paymentDate: status === 'paid' ? revenue.dueDate.toISOString().split('T')[0] : null,
        notes: revenue.notes
      }
    })

    // Fetch entities for filtering
    const entities = await db.entity.findMany({
      where: {
        isArchived: false,
        revenues: {
          some: {
            type: revenueType,
            period: {
              startsWith: year
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Calculate monthly summary based on filtered data
    const monthlySummary = calculateMonthlySummaryFromTrackingData(trackingData, year)
    
    // Calculate overall statistics from filtered data
    const overallStats = calculateOverallStatsFromTrackingData(trackingData)

    return NextResponse.json({
      trackingData,
      monthlySummary,
      overallStats,
      entities
    })
  } catch (error) {
    console.error('Error fetching monthly revenue tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly revenue tracking data' },
      { status: 500 }
    )
  }
}

function calculateOverallStatsFromTrackingData(trackingData: any[]) {
  let totalEntities = 0
  let paidEntities = 0
  let lateEntities = 0
  let pendingEntities = 0
  let totalRevenue = 0
  let paidRevenue = 0
  let lateRevenue = 0
  let pendingRevenue = 0

  // Get unique entities
  const uniqueEntities = new Set(trackingData.map(item => item.entityName))
  totalEntities = uniqueEntities.size

  trackingData.forEach(item => {
    totalRevenue += item.revenueValue
    
    if (item.status === 'paid') {
      paidEntities++
      paidRevenue += item.revenueValue
    } else if (item.status === 'late') {
      lateEntities++
      lateRevenue += item.revenueValue
    } else if (item.status === 'pending') {
      pendingEntities++
      pendingRevenue += item.revenueValue
    }
  })

  const collectionRate = totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(1) : '0'

  return {
    totalEntities,
    paidEntities,
    lateEntities,
    pendingEntities,
    totalRevenue,
    paidRevenue,
    lateRevenue,
    pendingRevenue,
    collectionRate: parseFloat(collectionRate)
  }
}

function calculateMonthlySummaryFromTrackingData(trackingData: any[], year: string) {
  const months = [
    { value: '01', label: 'يناير' },
    { value: '02', label: 'فبراير' },
    { value: '03', label: 'مارس' },
    { value: '04', label: 'أبريل' },
    { value: '05', label: 'مايو' },
    { value: '06', label: 'يونيو' },
    { value: '07', label: 'يوليو' },
    { value: '08', label: 'أغسطس' },
    { value: '09', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' }
  ]

  const summary = []

  for (const month of months) {
    const period = `${year}-${month.value}`
    
    // Filter tracking data for this month
    const monthData = trackingData.filter(item => item.period === period)
    
    // Calculate statistics from filtered data
    const totalEntities = new Set(monthData.map(item => item.entityName)).size
    let paidEntities = 0
    let lateEntities = 0
    let pendingEntities = 0
    let totalRevenue = 0
    let paidRevenue = 0
    let lateRevenue = 0
    let pendingRevenue = 0

    monthData.forEach(item => {
      totalRevenue += item.revenueValue
      
      if (item.status === 'paid') {
        paidEntities++
        paidRevenue += item.revenueValue
      } else if (item.status === 'late') {
        lateEntities++
        lateRevenue += item.revenueValue
      } else if (item.status === 'pending') {
        pendingEntities++
        pendingRevenue += item.revenueValue
      }
    })

    summary.push({
      month: month.value,
      monthName: month.label,
      totalEntities,
      paidEntities,
      lateEntities,
      pendingEntities,
      totalRevenue,
      paidRevenue,
      lateRevenue,
      pendingRevenue
    })
  }

  return summary
}