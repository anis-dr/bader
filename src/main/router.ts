import { router } from './trpc'
import { greetingRouter } from './routes/greeting'
import { categoriesRouter } from './routes/categories'
import { authRouter } from './routes/auth'
import { productsRouter } from './routes/products'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { clientsRouter } from './routes/clients'

export const appRouter = router({
  greeting: greetingRouter,
  auth: authRouter,
  categories: categoriesRouter,
  products: productsRouter,
  clients: clientsRouter
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
