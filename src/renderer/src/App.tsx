import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { AuthProvider } from './contexts/auth'
import { AuthGuard, GuestGuard } from './components/auth-guard'
import { DashboardPage } from './pages/dashboard'
import { OrdersPage } from './pages/orders'
import { Toaster } from 'react-hot-toast'
import { ReportsPage } from './pages/reports'
import { ProductsPage } from './pages/products'

const queryClient = new QueryClient()

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AuthProvider>
            <Routes>
              {/* Protected Routes */}
              <Route element={<AuthGuard />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/products" element={<ProductsPage />} />
              </Route>

              {/* Guest Routes */}
              <Route element={<GuestGuard />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </HashRouter>
      </QueryClientProvider>
    </>
  )
}
