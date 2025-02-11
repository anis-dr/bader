import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@renderer/contexts/auth'

export function AuthGuard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    // You might want to replace this with a proper loading component
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function GuestGuard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
