import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Calculate late payments based on last 3 paid revenues for each entity
async function calculateLatePayments(entities: any[], allRevenues: any[]): Promise<number> {
  let totalLateAmount = 0
  
  for (const entity of entities) {
    // Get paid revenues for this entity, sorted by payment date (most recent first)
    const entityPaidRevenues = allRevenues
      .filter(rev => rev.entityId === entity.id && rev.paymentDate)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 3) // Take last 3 paid revenues
    
    // Calculate average of last 3 paid revenues
    if (entityPaidRevenues.length > 0) {
      const averageAmount = entityPaidRevenues.reduce((sum, rev) => sum + rev.value, 0) / entityPaidRevenues.length
      
      // Get unpaid revenues (late payments)
      const unpaidRevenues = allRevenues.filter(rev => 
        rev.entityId === entity.id && 
        !rev.paymentDate && 
        new Date(rev.dueDate) < new Date()
      )
      
      // Calculate late amount based on average
      totalLateAmount += unpaidRevenues.length * averageAmount
    }
  }
  
  return totalLateAmount
}

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
        whereClause.paymentDate = { not: null }
      } else if (status === 'late') {
        whereClause.paymentDate = null
        whereClause.dueDate = { lt: new Date() }
      } else if (status === 'pending') {
        whereClause.paymentDate = null
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

    // Fetch all revenues for late payment calculation
    const allRevenues = await db.revenue.findMany({
      include: {
        entity: true
      }
    })

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
      
      // Determine status based on payment date first, then due date
      if (revenue.paymentDate) {
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
        paymentDate: revenue.paymentDate ? revenue.paymentDate.toISOString().split('T')[0] : null,
        notes: revenue.notes
      }
    })

    // Fetch entities for filtering and late payment calculation
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

    // Calculate late payments based on last 3 paid revenues
    const latePaymentsAmount = await calculateLatePayments(entities, allRevenues)

    // Calculate monthly summary based on filtered data
    const monthlySummary = calculateMonthlySummaryFromTrackingData(trackingData, year)
    
    // Calculate overall statistics from filtered data
    const overallStats = calculateOverallStatsFromTrackingData(trackingData, latePaymentsAmount)

    return NextResponse.json({
      trackingData,
      monthlySummary,
      overallStats,
      entities,
      latePaymentsAmount
    })
  } catch (error) {
    console.error('Error fetching monthly revenue tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly revenue tracking data' },
      { status: 500 }
    )
  }
}

function calculateOverallStatsFromTrackingData(trackingData: any[], latePaymentsAmount: number) {
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

  // Use calculated late payments amount instead of simple late revenue
  lateRevenue = latePaymentsAmount

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