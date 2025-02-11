import { createHash } from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // In production, use environment variable

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
})

export const registerSchema = loginSchema.extend({
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
