import { ReactNode } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Cart from './components/Cart'
import { ProductGrid } from './components/ProductGrid'
import { CartProvider } from '@renderer/contexts/CartContext'
import '../../styles/dashboard.css'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <CartProvider>
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">{children}</main>
          <Cart />
        </div>
      </div>
    </CartProvider>
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
