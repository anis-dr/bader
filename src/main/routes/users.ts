import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { users } from '../db/schema'
import { permissions, userPermissions } from '../db/schema/permissions'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'

export const usersRouter = router({
  // Get all users
  getAll: protectedProcedure
    .output(z.array(z.object({
      id: z.number(),
      username: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      role: z.string(),
      active: z.number(),
      createdAt: z.string().nullable()
    })))
    .query(async ({ ctx }) => {
      // Only admin can view all users
      if (ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view all users'
        })
      }

      return db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          active: users.active,
          createdAt: users.createdAt
        })
        .from(users)
        .all()
    }),

  // Get user permissions
  getPermissions: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const userPerms = await db
        .select({
          name: permissions.name
        })
        .from(userPermissions)
        .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
        .where(eq(userPermissions.userId, input.userId))
        .all()

      return userPerms.map(p => p.name)
    }),

  // Admin only: Update user permissions
  updateUserPermissions: protectedProcedure
    .input(z.object({
      userId: z.number(),
      permissions: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      return db.transaction(async (tx) => {
        // Delete existing permissions
        await tx
          .delete(userPermissions)
          .where(eq(userPermissions.userId, input.userId))

        // Get permission IDs for the new permissions
        const permissionRecords = await tx
          .select()
          .from(permissions)
          .where(inArray(permissions.name, input.permissions))
          .all()

        // Insert new permissions
        if (permissionRecords.length > 0) {
          await tx.insert(userPermissions).values(
            permissionRecords.map(p => ({
              userId: input.userId,
              permissionId: p.id
            }))
          )
        }

        return true
      })
    }),

  // Admin only: Create user
  create: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.literal('user'),
        permissions: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admin can create users
      if (ctx.tokenPayload.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create users'
        })
      }

      try {
        return db.transaction(async (tx) => {
          // Check if username already exists
          const existing = await tx
            .select()
            .from(users)
            .where(eq(users.username, input.username))
            .get()

          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Username already exists'
            })
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(input.password, 10)

          // Create user
          const newUser = await tx
            .insert(users)
            .values({
              username: input.username,
              password: hashedPassword,
              firstName: input.firstName,
              lastName: input.lastName,
              role: input.role,
              active: 1
            })
            .returning()
            .get()

          // Get permission IDs and create user permissions
          const permissionRecords = await tx
            .select()
            .from(permissions)
            .where(inArray(permissions.name, input.permissions))
            .all()

          if (permissionRecords.length > 0) {
            await tx.insert(userPermissions).values(
              permissionRecords.map(p => ({
                userId: newUser.id,
                permissionId: p.id
              }))
            )
          }

          return newUser
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user'
        })
      }
    })
    
}) 