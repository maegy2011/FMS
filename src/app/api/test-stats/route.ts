import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get sample tracking data
    const revenues = await db.revenue.findMany({
      where: {
        type: 'subscriptions',
        period: { startsWith: '2024' }
      },
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

    // Calculate overall stats
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

    const overallStats = calculateOverallStatsFromTrackingData(trackingData)

    return NextResponse.json({
      trackingDataCount: trackingData.length,
      overallStats
    })
  } catch (error) {
    console.error('Error in test stats:', error)
    return NextResponse.json(
      { error: 'Failed to calculate test stats' },
      { status: 500 }
    )
  }
}