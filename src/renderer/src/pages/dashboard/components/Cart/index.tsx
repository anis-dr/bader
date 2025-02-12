import { useCart } from '@renderer/contexts/CartContext'
import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import CreateClientModal from '../Modals/CreateClientModal'
import './styles.css'
import { useQuery } from '@tanstack/react-query'
import CheckoutModal from '../Modals/CheckoutModal'

export default function Cart() {
  const { items: cartItems, removeFromCart, updateQuantity } = useCart()
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)

  const { data: clients } = useQuery({
    queryKey: ['clients.getAll'],
    queryFn: () => api.clients.getAll.query()
  })
  
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Cart</h2>
        <span className="item-count">{cartItems.length} items</span>
      </div>

      <div className="client-selection">
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
          className="client-select"
        >
          <option value="">Select a client</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsCreateClientModalOpen(true)}
          className="create-client-btn"
          title="Add new client"
        >
          +
        </button>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-details">
                <h3>{item.name}</h3>
                <span className="item-price">{item.price.toFixed(2)} DT</span>
              </div>
              <div className="item-actions">
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  ×
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
          className="checkout-btn"
          disabled={cartItems.length === 0 || !selectedClientId}
          onClick={() => setIsCheckoutModalOpen(true)}
        >
          Checkout
        </button>
      </div>

      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
      />

      {selectedClientId && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          clientId={selectedClientId}
          total={total}
        />
      )}
    </div>
  )
} 