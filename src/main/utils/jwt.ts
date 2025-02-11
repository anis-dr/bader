import * as jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // In production, always use environment variable

export interface JWTPayload {
  userId: number
  username: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    })
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}
