import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { permissions } from '../db/schema/permissions'
import { TRPCError } from '@trpc/server'

export const permissionsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Only admin can view permissions
    if (ctx.tokenPayload.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can view permissions'
      })
    }

    return db.select().from(permissions).all()
  })
}) 