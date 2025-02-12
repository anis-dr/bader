import { useCart } from '@renderer/contexts/CartContext'
import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import CreateClientModal from '../Modals/CreateClientModal'
import './styles.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CheckoutModal from '../Modals/CheckoutModal'
import { PermissionGuard } from '@renderer/components/PermissionGuard'
import { toast } from 'react-hot-toast'
import { useAuth } from '@renderer/contexts/auth'

interface UnpaidOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { note: string; clientId: number }) => void
}

function UnpaidOrderModal({ isOpen, onClose, onSubmit }: UnpaidOrderModalProps) {
  const [note, setNote] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<number>()
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false)

  const { data: clients } = useQuery({
    queryKey: ['clients.getAll'],
    queryFn: () => api.clients.getAll.query()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClientId) {
      toast.error('Please select a client')
      return
    }
    onSubmit({ note, clientId: selectedClientId })
    setNote('')
    setSelectedClientId(undefined)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Note for Unpaid Order</h3>
          <button onClick={onClose} className="close-btn" title="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="client-selection">
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
              className="client-select"
              required
            >
              <option value="">Select a client</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <PermissionGuard permission="clients.create">
              <button
                type="button"
                onClick={() => setIsCreateClientModalOpen(true)}
                className="create-client-btn"
                title="Add new client"
              >
                +
              </button>
            </PermissionGuard>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note for the unpaid order..."
            className="note-input"
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Order
            </button>
          </div>
        </form>

        <CreateClientModal
          isOpen={isCreateClientModalOpen}
          onClose={() => setIsCreateClientModalOpen(false)}
        />
      </div>
    </div>
  )
}

export default function Cart() {
  const { items: cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isUnpaidModalOpen, setIsUnpaidModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Query to get the default "Passager" client
  const { data: defaultClient } = useQuery({
    queryKey: ['clients.getPassager'],
    queryFn: () => api.clients.getPassager.query()
  })

  const { data: clients } = useQuery({
    queryKey: ['clients.getAll'],
    queryFn: () => api.clients.getAll.query()
  })

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const createOrder = useMutation({
    mutationFn: (data: { status: 'completed' | 'unpaid'; note?: string; clientId?: number }) =>
      api.orders.create.mutate({
        clientId: data.status === 'unpaid' ? data.clientId! : defaultClient?.id || 1,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        status: data.status,
        note: data.note,
        creatorId: user.id,
        total: total,
        amountPaid: data.status === 'completed' ? total : 0
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders.getAll'] })
      clearCart()
      toast.success('Order created successfully')
      setIsUnpaidModalOpen(false)
    },
    onError: (error) => {
      toast.error('Failed to create order. Please try again.')
      console.error('Order creation error:', error)
    }
  })

  const handlePaidOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty')
      return
    }
    createOrder.mutate({ status: 'completed' })
  }

  const handleUnpaidOrder = (data: { note: string; clientId: number }) => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty')
      return
    }
    createOrder.mutate({ status: 'unpaid', note: data.note, clientId: data.clientId })
  }

  return (
    <>
      <div className="cart-container">
        <div className="cart-header">
          <h2>Cart</h2>
          <span className="item-count">{cartItems.length} items</span>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <div className="quantity-controls">
                  <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
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
                  <span className="item-price">{(item.price * item.quantity).toFixed(2)} DT</span>

                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">
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
          <div className="cart-actions">
            <button
              className="order-btn paid"
              onClick={handlePaidOrder}
              disabled={cartItems.length === 0}
            >
              Create Paid Order
            </button>
            <button
              className="order-btn unpaid"
              onClick={() => setIsUnpaidModalOpen(true)}
              disabled={cartItems.length === 0}
            >
              Create Unpaid Order
            </button>
          </div>
        </div>
      </div>

      <UnpaidOrderModal
        isOpen={isUnpaidModalOpen}
        onClose={() => setIsUnpaidModalOpen(false)}
        onSubmit={handleUnpaidOrder}
      />
    </>
  )
}
