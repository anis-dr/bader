import { publicProcedure, router } from '../trpc'

export const messagesRouter = router({
  getAll: publicProcedure.query(async () => {
    return []
  })
})
