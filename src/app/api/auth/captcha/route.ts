import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Generate a simple math captcha
    const num1 = Math.floor(Math.random() * 20) + 1
    const num2 = Math.floor(Math.random() * 20) + 1
    const operations = ['+', '-', '*']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let question, answer
    switch (operation) {
      case '+':
        question = `${num1} + ${num2} = ?`
        answer = (num1 + num2).toString()
        break
      case '-':
        question = `${num1} - ${num2} = ?`
        answer = (num1 - num2).toString()
        break
      case '*':
        question = `${num1} × ${num2} = ?`
        answer = (num1 * num2).toString()
        break
    }

    // Generate a unique session ID
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store captcha session
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    await db.captchaSession.create({
      data: {
        sessionId,
        question,
        answer,
        expiresAt
      }
    })

    return NextResponse.json({
      sessionId,
      question,
      expiresAt
    })
  } catch (error) {
    console.error('Captcha generation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء رمز التحقق' },
      { status: 500 }
    )
  }
}