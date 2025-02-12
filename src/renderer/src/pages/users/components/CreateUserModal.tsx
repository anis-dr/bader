import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Permission {
  id: number
  name: string
  label: string
  description: string | null
  defaultEnabled: number
  category: string
  createdAt: string | null
}

export default function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const queryClient = useQueryClient()

  // Fetch permissions from the database
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions.getAll'],
    queryFn: () => api.permissions.getAll.query()
  })

  const createUser = useMutation({
    mutationFn: () =>
      api.users.create.mutate({
        username,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: 'user',
        permissions: selectedPermissions
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users.getAll'] })
      toast.success('User created successfully')
      resetForm()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user')
    }
  })

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setSelectedPermissions(
      permissions?.filter((p) => p.defaultEnabled === 1).map((p) => p.name) || []
    )
  }

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permissionName] : prev.filter(p => p !== permissionName)
    )
  }

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>) || {}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Username and password are required')
      return
    }
    createUser.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New User</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="form-input"
              />
            </div>
          </div>

          <div className="permissions-section">
            <h3>User Permissions</h3>
            {isLoadingPermissions ? (
              <div className="loading-permissions">Loading permissions...</div>
            ) : (
              <div className="permissions-categories">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="permission-category">
                    <h4>{category}</h4>
                    <div className="permissions-grid">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.name} className="permission-item">
                          <label className="permission-label">
                            
                            <div className="permission-info">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.name)}
                              onChange={(e) =>
                                handlePermissionChange(permission.name, e.target.checked)
                              }
                            />
                              <span className="permission-name">{permission.label}</span>
                              
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 