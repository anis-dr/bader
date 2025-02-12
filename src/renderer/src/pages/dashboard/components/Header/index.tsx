import { useAuth } from '@renderer/contexts/auth'
import { useNavigate } from 'react-router-dom'
import './header.css'
import Logo from '@renderer/assets/caisstek.png'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={Logo} alt="CaissTek" className="header-logo" />
        <nav className="header-nav">
          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/orders')}>
            <span className="nav-icon">📝</span>
            <span>Orders</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </button>
        </nav>
      </div>
      
      <div className="header-right">
        <div className="action-buttons">
          <button className="action-button">
            <span className="action-icon">📁</span>
            <span>New Category</span>
          </button>
          <button className="action-button primary">
            <span className="action-icon">➕</span>
            <span>New Product</span>
          </button>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <span className="user-initial">{user?.username.charAt(0).toUpperCase()}</span>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
} 