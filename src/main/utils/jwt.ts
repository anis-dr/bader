import * as jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // In production, always use environment variable
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key'

export interface JWTPayload {
  userId: number
  username: string
  firstName?: string | null
  lastName?: string | null
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function generateTokens(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired access token'
    })
  }
}

export function verifyRefreshToken(token: string): { userId: number } {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: number }
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired refresh token'
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
