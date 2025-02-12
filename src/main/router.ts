import { router } from './trpc'
import { greetingRouter } from './routes/greeting'
import { categoriesRouter } from './routes/categories'
import { authRouter } from './routes/auth'
import { productsRouter } from './routes/products'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

export const appRouter = router({
  greeting: greetingRouter,
  auth: authRouter,
  categories: categoriesRouter,
  products: productsRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
