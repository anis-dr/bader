import { useState, useEffect } from 'react'
import { api } from '@renderer/utils/trpc'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { log } from 'console'

interface Permission {
  id: number
  name: string
  label: string
  description: string | null
  defaultEnabled: number
  category: string
}

export default function UserPermissions({ userId }: { userId: number }) {
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Fetch all available permissions
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions.getAll'],
    queryFn: () => api.permissions.getAll.query()
  })
  // Fetch user's current permissions
  const { data } = useQuery({
    queryKey: ['users.getPermissions', userId],
    queryFn: () => api.users.getPermissions.query({ userId }),
    enabled: !!userId
  })
  console.log({data})

  useEffect(() => {
    if (data) {
      setSelectedPermissions(data)
    }
  }, [data])

  const updatePermissions = useMutation({
    mutationFn: (permissions: string[]) =>
      api.users.updateUserPermissions.mutate({
        userId,
        permissions
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users.getPermissions'] })
      toast.success('Permissions updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update permissions')
    }
  })

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked 
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePermissions.mutate(selectedPermissions)
  }

  if (isLoadingPermissions) {
    return <div>Loading permissions...</div>
  }

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>) || {}

  return (
    <form onSubmit={handleSubmit} className="permissions-form">
      <div className="permissions-grid">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="permission-category">
            <h3>{category}</h3>
            <div className="permissions-list">
              {categoryPermissions.map((permission) => (
                <div key={permission.name} className="permission-item">
                  <label className="permission-label">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.name)}
                      onChange={(e) => handlePermissionChange(permission.name, e.target.checked)}
                    />
                    <span className="permission-name">{permission.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="update-button"
          disabled={updatePermissions.isPending}
        >
          {updatePermissions.isPending ? 'Updating...' : 'Update Permissions'}
        </button>
      </div>
    </form>
  )
} 