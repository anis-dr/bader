import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useAuth } from '@renderer/contexts/auth'
import { useQuery } from '@tanstack/react-query'
import Header from '../dashboard/components/Header'
import dayjs from 'dayjs'
import './styles.css'

export function OrdersPage() {
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'unpaid' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // You can adjust this number
  const [filters, setFilters] = useState({
    page: 1,
    status: 'all'
  })

  const icons = {
    search: '🔍',
    filter: '🔧',
    invoice: '📄',
    money: '💰'
  }

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setFilters(prev => ({
      ...prev,
      page: 1,
      limit: newSize
    }));
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders.getAll'],
    queryFn: () => api.orders.getAll.query()
  })

  if (isLoading) return <div>Loading...</div>
  if (!orders) return <div>No orders found</div>

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = orders.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredOrders = orders?.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.note?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTotalAmount = () => {
    return filteredOrders?.reduce((sum, order) => sum + order.total, 0) || 0
  }

  if (isLoading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading orders...</p>
    </div>
  }

  return (
    <>
      <Header />
      <div className="orders-container">
        <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            {icons.invoice}
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p>{filteredOrders?.length || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            {icons.money}
          </div>
          <div className="stat-content">
            <h3>Total Amount</h3>
            <p>{getTotalAmount().toFixed(2)} DT</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <span className="search-icon">{icons.search}</span>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <span className="filter-icon">{icons.filter}</span>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
            className="status-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="unpaid">Unpaid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead className="table-header">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              {user?.role === 'admin' && (
                <th>Created By</th>
              )}
              <th>Client</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.id} className="table-row">
                <td className="table-cell">
                  <span className="order-id">#{order.id}</span>
                </td>
                <td className="table-cell">
                  <div className="date-cell">
                    <span className="date">{dayjs(order.createdAt).format('DD/MM/YYYY')}</span>
                    <span className="time">{dayjs(order.createdAt).format('HH:mm')}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${
                    order.status === 'completed' ? 'status-completed' :
                    order.status === 'unpaid' ? 'status-unpaid' :
                    'status-cancelled'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="amount">{order.total.toFixed(2)} DT</span>
                </td>
                {user?.role === 'admin' && (
                  <td className="table-cell">
                    <span className="creator-name">{order.creator?.name}</span>
                  </td>
                )}
                <td className="table-cell">
                  <span className="client-name">{order.client?.name}</span>
                </td>
                <td className="table-cell">
                  {order.note && (
                    <span className="note" title={order.note}>{order.note}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders?.length === 0 && (
          <div className="no-results">
            <p>No orders found</p>
          </div>
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
    </>
  )
} 