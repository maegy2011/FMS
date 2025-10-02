import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Sample entities data
const entities = [
  // Main entities
  { name: 'النقابة العامة للمحامين', type: 'main', governorate: 'القاهرة', description: 'المقر الرئيسي للنقابة العامة' },
  { name: 'نقابة محامي الإسكندرية', type: 'main', governorate: 'الإسكندرية', description: 'نقابة محامي محافظة الإسكندرية' },
  { name: 'نقابة محامي الجيزة', type: 'main', governorate: 'الجيزة', description: 'نقابة محامي محافظة الجيزة' },
  { name: 'نقابة محامي الدقهلية', type: 'main', governorate: 'الدقهلية', description: 'نقابة محامي محافظة الدقهلية' },
  { name: 'نقابة محامي الشرقية', type: 'main', governorate: 'الشرقية', description: 'نقابة محامي محافظة الشرقية' },
  { name: 'نقابة محامي المنوفية', type: 'main', governorate: 'المنوفية', description: 'نقابة محامي محافظة المنوفية' },
  { name: 'نقابة محامي القليوبية', type: 'main', governorate: 'القليوبية', description: 'نقابة محامي محافظة القليوبية' },
  { name: 'نقابة محامي البحيرة', type: 'main', governorate: 'البحيرة', description: 'نقابة محامي محافظة البحيرة' },
  { name: 'نقابة محامي الغربية', type: 'main', governorate: 'الغربية', description: 'نقابة محامي محافظة الغربية' },
  { name: 'نقابة محامي كفر الشيخ', type: 'main', governorate: 'كفر الشيخ', description: 'نقابة محامي محافظة كفر الشيخ' },
  
  // Branch entities
  { name: 'فرع النقابة بمنطقة وسط القاهرة', type: 'branch', governorate: 'القاهرة', description: 'فرع نقابة وسط القاهرة' },
  { name: 'فرع النقابة بمنطقة شرق القاهرة', type: 'branch', governorate: 'القاهرة', description: 'فرع نقابة شرق القاهرة' },
  { name: 'فرع النقابة بمنطقة غرب القاهرة', type: 'branch', governorate: 'القاهرة', description: 'فرع نقابة غرب القاهرة' },
  { name: 'فرع النقابة بمنطقة شمال القاهرة', type: 'branch', governorate: 'القاهرة', description: 'فرع نقابة شمال القاهرة' },
  { name: 'فرع النقابة بمنطقة جنوب القاهرة', type: 'branch', governorate: 'القاهرة', description: 'فرع نقابة جنوب القاهرة' },
  { name: 'فرع النقابة بمنطقة وسط الإسكندرية', type: 'branch', governorate: 'الإسكندرية', description: 'فرع نقابة وسط الإسكندرية' },
  { name: 'فرع النقابة بمنطقة شرق الإسكندرية', type: 'branch', governorate: 'الإسكندرية', description: 'فرع نقابة شرق الإسكندرية' },
  { name: 'فرع النقابة بمنطقة غرب الإسكندرية', type: 'branch', governorate: 'الإسكندرية', description: 'فرع نقابة غرب الإسكندرية' },
  
  // Workers entities
  { name: 'جمعية المحامين العاملين بالقطاع العام', type: 'workers', governorate: 'القاهرة', description: 'جمعية المحامين بالقطاع العام' },
  { name: 'جمعية المحامين العاملين بالقطاع الخاص', type: 'workers', governorate: 'القاهرة', description: 'جمعية المحامين بالقطاع الخاص' },
  { name: 'جمعية المحامين العاملين بالقطاع الحكومي', type: 'workers', governorate: 'القاهرة', description: 'جمعية المحامين بالقطاع الحكومي' },
  { name: 'جمعية المحامين العاملين بالشركات', type: 'workers', governorate: 'الجيزة', description: 'جمعية المحامين بالشركات' },
  { name: 'جمعية المحامين العاملين بالبنوك', type: 'workers', governorate: 'القاهرة', description: 'جمعية المحامين بالبنوك' },
]

// Generate revenue data for a specific period
function generateRevenueData(entityId: number, entityName: string, year: number, month: number) {
  const period = `${year}-${month.toString().padStart(2, '0')}`
  const dueDate = new Date(year, month - 1, 15) // 15th of each month
  
  // Different subscription amounts based on entity type
  const subscriptionAmounts = {
    'main': 5000 + Math.floor(Math.random() * 10000), // 5000-15000
    'branch': 2000 + Math.floor(Math.random() * 5000),  // 2000-7000
    'workers': 1000 + Math.floor(Math.random() * 3000)  // 1000-4000
  }
  
  const entity = entities.find(e => e.name === entityName)
  const amount = subscriptionAmounts[entity?.type as keyof typeof subscriptionAmounts] || 3000
  
  // More realistic status distribution based on time period
  const currentDate = new Date()
  const isCurrentYear = year === currentDate.getFullYear()
  const isCurrentMonth = isCurrentYear && month === currentDate.getMonth() + 1
  const isPast = dueDate < currentDate
  
  let status = 'paid'
  let paymentDate = null
  let notes = ''
  
  if (isPast) {
    // For past dates, 70% paid, 20% late, 10% pending
    const random = Math.random()
    if (random < 0.7) {
      status = 'paid'
      paymentDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Paid within 30 days
      notes = 'تم السداد'
    } else if (random < 0.9) {
      status = 'late'
      notes = 'متأخر عن السداد'
    } else {
      status = 'pending'
      notes = 'في انتظار السداد'
    }
  } else if (isCurrentMonth) {
    // For current month, 30% paid, 10% late, 60% pending
    const random = Math.random()
    if (random < 0.3) {
      status = 'paid'
      paymentDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) // Paid within 10 days
      notes = 'تم السداد'
    } else if (random < 0.4) {
      status = 'late'
      notes = 'متأخر عن السداد'
    } else {
      status = 'pending'
      notes = 'في انتظار السداد'
    }
  } else {
    // For future months, 10% paid, 0% late, 90% pending
    const random = Math.random()
    if (random < 0.1) {
      status = 'paid'
      paymentDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000) // Paid early
      notes = 'تم السداد مسبقاً'
    } else {
      status = 'pending'
      notes = 'في انتظار السداد'
    }
  }
  
  return {
    entityId,
    entityName,
    value: amount,
    dueDate,
    period,
    type: 'subscriptions',
    notes,
    isArchived: false,
    paymentDate
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clear existing data
    await db.revenue.deleteMany()
    await db.entity.deleteMany()
    
    console.log('Deleted existing data')
    
    // Insert entities
    const createdEntities = await Promise.all(
      entities.map(entity => 
        db.entity.create({
          data: {
            name: entity.name,
            type: entity.type,
            governorate: entity.governorate,
            description: entity.description,
            isArchived: false,
          }
        })
      )
    )
    
    console.log(`Created ${createdEntities.length} entities`)
    
    // Generate revenue data for 2024 and 2025 (until September)
    const revenues = []
    
    // 2024 data (all 12 months)
    for (const entity of createdEntities) {
      for (let month = 1; month <= 12; month++) {
        const revenue = generateRevenueData(entity.id, entity.name, 2024, month)
        revenues.push(revenue)
      }
    }
    
    // 2025 data (January to September)
    for (const entity of createdEntities) {
      for (let month = 1; month <= 9; month++) {
        const revenue = generateRevenueData(entity.id, entity.name, 2025, month)
        revenues.push(revenue)
      }
    }
    
    // Insert revenues with serial numbers
    let serial = 1
    for (const revenue of revenues) {
      await db.revenue.create({
        data: {
          ...revenue,
          serial: serial++,
        }
      })
    }
    
    console.log(`Created ${revenues.length} revenue records`)
    
    return NextResponse.json({
      message: 'تم إضافة البيانات التجريبية بنجاح',
      entitiesCount: createdEntities.length,
      revenuesCount: revenues.length,
      entities: createdEntities,
    })
    
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة البيانات التجريبية' },
      { status: 500 }
    )
  }
}