import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if any users exist in the database
    const userCount = await db.user.count()
    
    return NextResponse.json({
      needsInstall: userCount === 0
    })
  } catch (error) {
    console.error('Error checking installation:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من التثبيت' },
      { status: 500 }
    )
  }
}