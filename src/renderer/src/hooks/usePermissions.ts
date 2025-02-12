import { useAuth } from '@renderer/contexts/auth'
import { api } from '@renderer/utils/trpc'
import { useQuery } from '@tanstack/react-query'

export function usePermissions() {
  const { user } = useAuth()

  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ['users.getPermissions', user?.id],
    queryFn: () => api.users.getPermissions.query({ userId: user?.id! }),
    enabled: !!user && user.role !== 'admin'
  })

  const hasPermission = (permission: string) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (isLoading) return false
    return userPermissions?.includes(permission) ?? false
  }

  return { hasPermission, isLoading }
} 