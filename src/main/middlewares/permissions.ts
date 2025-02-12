import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../trpc'
import { db } from '../db'
import { permissions, userPermissions } from '../db/schema/permissions'
import { and, eq } from 'drizzle-orm'

export const hasPermission = (requiredPermission: string) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.tokenPayload?.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated'
      })
    }

    // Admin bypass - they have all permissions
    if (ctx.tokenPayload.role === 'admin') {
      return next()
    }

    // Check if user has the required permission
    const hasPermission = db
      .select()
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
      .where(
        and(
          eq(userPermissions.userId, ctx.tokenPayload.userId),
          eq(permissions.name, requiredPermission)
        )
      )
      .get()

    if (!hasPermission) {
      // TODO: Log the user out 
      // TODO: Redirect to the login page
      // TODO: Show a toast notification
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action'
      })
    }

    return next()
  }) 