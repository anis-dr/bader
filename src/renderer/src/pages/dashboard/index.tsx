import { ReactNode } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Cart from './components/Cart'
import { ProductGrid } from './components/ProductGrid'
import '../../styles/dashboard.css'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="products-container">
        <ProductGrid />
      </div>
    </DashboardLayout>
  )
} 