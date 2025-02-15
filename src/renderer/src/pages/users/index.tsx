import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Header from '../dashboard/components/Header'
import UserPermissions from '../dashboard/components/UserPermissions'
import './styles.css'
import { useAuth } from '@renderer/contexts/auth'
import { Navigate } from 'react-router-dom'
import CreateUserModal from './components/CreateUserModal'
import { PermissionGuard } from '@renderer/components/PermissionGuard'
import { toast } from 'react-hot-toast'

export function UsersPage() {
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const { data: users, isLoading } = useQuery({
    queryKey: ['users.getAll'],
    queryFn: () => api.users.getAll.query()
  })

  const queryClient = useQueryClient()

  const activateUser = useMutation({
    mutationFn: (id: number) => api.users.activate.mutate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users.getAll'] })
      toast.success('User activated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate user')
    }
  })

  const deactivateUser = useMutation({
    mutationFn: (id: number) => api.users.deactivate.mutate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users.getAll'] })
      toast.success('User deactivated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to deactivate user')
    }
  })

  const filteredUsers = users?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="page-container">
      <Header />
      <div className="content-container">
        <div className="users-header">
          <h1>Users Management</h1>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="create-user-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span className="btn-icon">👤</span>
              <span>New User</span>
            </button>
          </div>
        </div>

        <div className="users-grid">
          <div className="users-list">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  {user.role !== 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers?.map((user) => (
                  <tr key={user.id} className={selectedUserId === user.id ? 'selected' : ''}>
                    <td>{user.username}</td>
                    <td>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`
                        : '-'}
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {user.role !== 'admin' && (
                      <td>
                        <div className="action-buttons">
                          <button
                            className="manage-permissions-btn"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            Manage Permissions
                          </button>
                          <PermissionGuard permission="users.activate">
                            {!user.active && (
                              <button
                                onClick={() => activateUser.mutate(user.id)}
                                className="activate-btn"
                                title="Activate user"
                              >
                                Activate
                              </button>
                            )}
                          </PermissionGuard>
                          <PermissionGuard permission="users.deactivate">
                            {user.active && (
                              <button
                                onClick={() => deactivateUser.mutate(user.id)}
                                className="deactivate-btn"
                                title="Deactivate user"
                              >
                                Deactivate
                              </button>
                            )}
                          </PermissionGuard>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUserId && (
            <div className="permissions-panel">
              <UserPermissions userId={selectedUserId} />
            </div>
          )}
        </div>

        <CreateUserModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  )
} 