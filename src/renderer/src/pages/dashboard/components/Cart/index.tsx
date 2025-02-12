import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import './cart.css'
import { useQuery } from '@tanstack/react-query'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Client {
  id: number
  name: string
}

export default function Cart() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  
  // Fetch clients using trpc
  const { data: clients } = useQuery({
    queryKey: ['clients.getAll'],
    queryFn: () => api.clients.getAll.query()
  })

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    )
  }

  const handleRemoveItem = (itemId: number) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
  }

  const handleProcessPayment = () => {
    if (!selectedClient) {
      alert('Please select a client')
      return
    }
    // Process payment logic here
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Cart</h2>
        <div className="client-selector">
          <select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(Number(e.target.value) || null)}
            className="client-select"
          >
            <option value="">Select Client</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <button className="new-client-btn">New Client</button>
        </div>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <span>🛒</span>
            <p>Cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price.toFixed(2)} DT</p>
              </div>
              <div className="item-actions">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total:</span>
          <span className="total-amount">{total.toFixed(2)} DT</span>
        </div>
        <button
          className="process-payment-btn"
          disabled={cartItems.length === 0 || !selectedClient}
          onClick={handleProcessPayment}
        >
          💳 Process Payment
        </button>
      </div>
    </div>
  )
} 