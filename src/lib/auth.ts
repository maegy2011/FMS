import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { UserRole, SecurityQuestion } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SALT_ROUNDS = 12

export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<JWTPayload | null> {
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: { securityQuestions: true }
    })

    if (!user || !user.isActive) {
      return null
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account locked. Please try again later.')
    }

    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid) {
      // Increment failed attempts
      await db.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: user.failedAttempts + 1,
          lockedUntil: user.failedAttempts + 1 >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes
        }
      })
      return null
    }

    // Reset failed attempts on successful login
    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    })

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  fullName: string
  role: UserRole
  securityQuestions: Array<{ question: string; answer: string }>
}) {
  const hashedPassword = await hashPassword(userData.password)
  
  const user = await db.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      securityQuestions: {
        create: userData.securityQuestions.map(q => ({
          question: q.question as SecurityQuestion,
          answer: q.answer
        }))
      }
    },
    include: { securityQuestions: true }
  })

  return user
}

export async function verifySecurityQuestions(userId: string, answers: Array<{ question: string; answer: string }>): Promise<boolean> {
  const userQuestions = await db.userSecurityQuestion.findMany({
    where: { userId }
  })

  if (userQuestions.length !== 3) {
    return false
  }

  for (const answer of answers) {
    const userQuestion = userQuestions.find(q => q.question === answer.question)
    if (!userQuestion || userQuestion.answer !== answer.answer) {
      return false
    }
  }

  return true
}

export async function resetPassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword)
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export function requireRole(requiredRole: UserRole) {
  return (userRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.SYSTEM_MANAGER]: 6,
      [UserRole.EXPERT]: 5,
      [UserRole.ACCOUNT_HEAD]: 4,
      [UserRole.REVIEWER]: 3,
      [UserRole.ACCOUNTANT]: 2,
      [UserRole.ADVISOR]: 1
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }
}