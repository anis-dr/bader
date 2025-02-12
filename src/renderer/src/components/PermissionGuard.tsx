import { ReactNode } from 'react'
import { usePermissions } from '@renderer/hooks/usePermissions'

interface PermissionGuardProps {
  permission: string
  children: ReactNode
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return null
  }

  return <>{children}</>
} 