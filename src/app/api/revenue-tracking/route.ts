import { NextRequest, NextResponse } from 'next/server'

interface RevenueTracking {
  id: number
  entityName: string
  entityGovernorate: string
  entityType: string
  revenueValue: number
  dueDate: string
  period: string
  daysOverdue: number
  status: 'paid' | 'late' | 'pending'
  paymentDate?: string
  notes?: string
}

interface MonthlySummary {
  month: string
  totalRevenues: number
  paidRevenues: number
  lateRevenues: number
  pendingRevenues: number
  totalAmount: number
  paidAmount: number
  lateAmount: number
  pendingAmount: number
}

// Mock data - in a real app, this would come from a database
const mockTrackingData: RevenueTracking[] = [
  {
    id: 1,
    entityName: 'الديوان العام',
    entityGovernorate: 'القاهرة',
    entityType: 'main',
    revenueValue: 5000,
    dueDate: '2025-01-15',
    period: '2025-01',
    daysOverdue: 0,
    status: 'paid',
    paymentDate: '2025-01-14'
  },
  {
    id: 2,
    entityName: 'الشهر العقاري',
    entityGovernorate: 'الجيزة',
    entityType: 'main',
    revenueValue: 3000,
    dueDate: '2025-01-20',
    period: '2025-01',
    daysOverdue: 5,
    status: 'late'
  },
  {
    id: 3,
    entityName: 'محكمة شمال القاهرة',
    entityGovernorate: 'القاهرة',
    entityType: 'main',
    revenueValue: 4500,
    dueDate: '2025-01-25',
    period: '2025-01',
    daysOverdue: 0,
    status: 'pending'
  },
  {
    id: 4,
    entityName: 'النيابة العامة',
    entityGovernorate: 'الإسكندرية',
    entityType: 'main',
    revenueValue: 6000,
    dueDate: '2025-02-01',
    period: '2025-02',
    daysOverdue: 0,
    status: 'pending'
  },
  {
    id: 5,
    entityName: 'محكمة جنوب القاهرة',
    entityGovernorate: 'القاهرة',
    entityType: 'main',
    revenueValue: 4000,
    dueDate: '2025-02-05',
    period: '2025-02',
    daysOverdue: 0,
    status: 'pending'
  },
  {
    id: 6,
    entityName: 'الشهر العقاري',
    entityGovernorate: 'الإسكندرية',
    entityType: 'main',
    revenueValue: 3500,
    dueDate: '2025-02-10',
    period: '2025-02',
    daysOverdue: 0,
    status: 'pending'
  }
]

const mockMonthlySummary: MonthlySummary[] = [
  {
    month: '2025-01',
    totalRevenues: 3,
    paidRevenues: 1,
    lateRevenues: 1,
    pendingRevenues: 1,
    totalAmount: 12500,
    paidAmount: 5000,
    lateAmount: 3000,
    pendingAmount: 4500
  },
  {
    month: '2025-02',
    totalRevenues: 3,
    paidRevenues: 0,
    lateRevenues: 0,
    pendingRevenues: 3,
    totalAmount: 13500,
    paidAmount: 0,
    lateAmount: 0,
    pendingAmount: 13500
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const governorate = searchParams.get('governorate')
    const status = searchParams.get('status')

    // Filter data based on parameters
    let filteredData = mockTrackingData

    if (year) {
      filteredData = filteredData.filter(item => item.period.startsWith(year))
    }

    if (month) {
      filteredData = filteredData.filter(item => item.period.endsWith(month))
    }

    if (governorate && governorate !== 'all') {
      filteredData = filteredData.filter(item => item.entityGovernorate === governorate)
    }

    if (status && status !== 'all') {
      filteredData = filteredData.filter(item => item.status === status)
    }

    // Calculate summary for the filtered period
    const summary = mockMonthlySummary.filter(summary => {
      if (year && !summary.month.startsWith(year)) return false
      if (month && !summary.month.endsWith(month)) return false
      return true
    })

    return NextResponse.json({
      trackingData: filteredData,
      monthlySummary: summary,
      filters: {
        year,
        month,
        governorate,
        status
      }
    })
  } catch (error) {
    console.error('Error fetching revenue tracking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue tracking data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real app, this would create/update revenue tracking records
    console.log('Creating/updating revenue tracking:', body)
    
    return NextResponse.json({
      message: 'Revenue tracking record created/updated successfully',
      data: body
    })
  } catch (error) {
    console.error('Error creating/updating revenue tracking:', error)
    return NextResponse.json(
      { error: 'Failed to create/update revenue tracking record' },
      { status: 500 }
    )
  }
}