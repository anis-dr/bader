import { publicProcedure, router } from '../trpc'
import { db } from '../db'
import { messages } from '../db/schema'
import { desc } from 'drizzle-orm'

export const messagesRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(messages).orderBy(desc(messages.createdAt))
  })
})
