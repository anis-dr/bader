import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import Header from '../dashboard/components/Header'
import dayjs from 'dayjs'
import { DateRangePicker } from './components/DateRangePicker'
import { LineChart } from './components/Charts'
import './styles.css'

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: dayjs().subtract(30, 'day').toDate(),
    to: dayjs().toDate()
  })

  const { data: orders } = useQuery({
    queryKey: ['orders.getAll'],
    queryFn: () => api.orders.getAll.query()
  })

  const { data: products } = useQuery({
    queryKey: ['products.getAll'],
    queryFn: () => api.products.getAll.query()
  })

  const filteredOrders = orders?.filter(order => 
    dayjs(order.createdAt).isAfter(dateRange.from) && 
    dayjs(order.createdAt).isBefore(dayjs(dateRange.to).endOf('day'))
  ) || []

  // Calculate metrics
  const metrics = {
    totalSales: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: filteredOrders.length,
    averageOrderValue: filteredOrders.length ? 
      filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length : 0,
    completedOrders: filteredOrders.filter(o => o.status === 'completed').length,
    unpaidOrders: filteredOrders.filter(o => o.status === 'unpaid').length,
    cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
  }

  // Product metrics
  const productMetrics = products?.map(product => ({
    name: product.name,
    stock: product.stockQuantity,
    totalSold: filteredOrders.reduce((sum, order) => {
      const orderItem = order.items?.find(item => item.product.id === product.id)
      return sum + (orderItem?.quantity || 0)
    }, 0)
  })) || []

  // Daily sales data for chart
  const dailySales = filteredOrders.reduce((acc, order) => {
    const date = dayjs(order.createdAt).format('YYYY-MM-DD')
    acc[date] = (acc[date] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  const salesChartData = Object.entries(dailySales).map(([date, total]) => ({
    date,
    total
  }))

  return (
    <>
      <Header />
      <div className="reports-container">
        <div className="reports-header">
          <h1>Financial Reports</h1>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onUpdate={setDateRange}
          />
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Sales</h3>
            <p className="metric-value">{metrics.totalSales.toFixed(2)} DT</p>
          </div>
          <div className="metric-card">
            <h3>Total Orders</h3>
            <p className="metric-value">{metrics.totalOrders}</p>
          </div>
          <div className="metric-card">
            <h3>Average Order Value</h3>
            <p className="metric-value">{metrics.averageOrderValue.toFixed(2)} DT</p>
          </div>
          <div className="metric-card">
            <h3>Order Status</h3>
            <div className="status-breakdown">
              <div className="status-item completed">
                <span>Completed</span>
                <span>{metrics.completedOrders}</span>
              </div>
              <div className="status-item unpaid">
                <span>Unpaid</span>
                <span>{metrics.unpaidOrders}</span>
              </div>
              <div className="status-item cancelled">
                <span>Cancelled</span>
                <span>{metrics.cancelledOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="chart-section">
          <div className="chart-card">
            <h3>Daily Sales</h3>
            <LineChart data={salesChartData} />
          </div>
        </div>

        {/* Product Performance */}
        <div className="product-section">
          <h2>Product Performance</h2>
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Total Sold</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {productMetrics.map(product => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                    <td>{product.totalSold}</td>
                    <td>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ 
                            width: `${Math.min((product.totalSold / (product.totalSold + product.stock)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
} 