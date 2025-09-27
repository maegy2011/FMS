import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if any system admin exists
    const adminCount = await db.user.count({
      where: {
        role: 'SYSTEM_ADMIN'
      }
    });

    return NextResponse.json({ 
      exists: adminCount > 0 
    });
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return NextResponse.json(
      { error: 'فشل في التحقق من وجود مدير النظام' },
      { status: 500 }
    );
  }
}