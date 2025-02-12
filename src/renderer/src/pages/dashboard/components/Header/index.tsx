import { useAuth } from '@renderer/contexts/auth'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './header.css'
import Logo from '@renderer/assets/caissTek.png'
import { useState } from 'react'
import CreateCategoryModal from '../Modals/CreateCategoryModal'
import CreateProductModal from '../Modals/CreateProductModal'
import CreateSpentModal from '../Modals/CreateSpentModal'
import { PermissionGuard } from '@renderer/components/PermissionGuard'

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false)
  const [isCreateSpentModalOpen, setIsCreateSpentModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <img src={Logo} alt="CaissTek" className="header-logo" />
          <nav className="header-nav">
            <button
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </button>

            <PermissionGuard permission="orders.view">
              <button
                className={`nav-item ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => navigate('/orders')}
              >
                <span className="nav-icon">📝</span>
                <span>Orders</span>
              </button>
            </PermissionGuard>

            <PermissionGuard permission="reports.view">
              <button
                className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
                onClick={() => navigate('/reports')}
              >
                <span className="nav-icon">📈</span>
                <span>Reports</span>
              </button>
            </PermissionGuard>

            <PermissionGuard permission="users.view">
              <button
                className={`nav-item ${isActive('/users') ? 'active' : ''}`}
                onClick={() => navigate('/users')}
              >
                <span className="nav-icon">👥</span>
                <span>Users</span>
              </button>
            </PermissionGuard>

            <PermissionGuard permission="products.view">
              <button
                className={`nav-item ${isActive('/products') ? 'active' : ''}`}
                onClick={() => navigate('/products')}
              >
                <span className="nav-icon">📦</span>
                <span>Products</span>
              </button>
            </PermissionGuard>
          </nav>
        </div>

        <div className="header-right">
          <div className="action-buttons">
            <PermissionGuard permission="categories.create">
              <button className="action-button" onClick={() => setIsCreateCategoryModalOpen(true)}>
                <span className="action-icon">📁</span>
                <span>New Category</span>
              </button>
            </PermissionGuard>

            <PermissionGuard permission="products.create">
              <button
                className="action-button primary"
                onClick={() => setIsCreateProductModalOpen(true)}
              >
                <span className="action-icon">➕</span>
                <span>New Product</span>
              </button>
            </PermissionGuard>

            <PermissionGuard permission="spents.create">
              <button 
                className="action-button warning"
                onClick={() => setIsCreateSpentModalOpen(true)}
              >
                <span className="action-icon">💰</span>
                <span>New Spent</span>
              </button>
            </PermissionGuard>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <span className="user-initial">{user?.username.charAt(0).toUpperCase()}</span>
              <div className="user-details">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
      />

      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
      />

      <CreateSpentModal
        isOpen={isCreateSpentModalOpen}
        onClose={() => setIsCreateSpentModalOpen(false)}
      />
    </>
  )
}
