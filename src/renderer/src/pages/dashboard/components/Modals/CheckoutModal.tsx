import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@renderer/contexts/auth'
import { useCart } from '@renderer/contexts/CartContext'
import './modal.css'
import toast from 'react-hot-toast'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: number
  total: number
}

export default function CheckoutModal({ isOpen, onClose, clientId, total }: CheckoutModalProps) {
  const [isPaid, setIsPaid] = useState(true)
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [note, setNote] = useState('')
  const queryClient = useQueryClient()
  const { items: cartItems, clearCart } = useCart()
  const { user } = useAuth()
  const createOrder = useMutation({
    mutationFn: () => {
      const orderData = {
        clientId,
        total,
        creatorId: user?.id,
        amountPaid: isPaid ? Number(amountPaid) : 0,
        change: isPaid ? Number(amountPaid) - total : 0,
        status: isPaid ? ('completed' as const) : ('unpaid' as const),
        isUnpaid: !isPaid,
        note: !isPaid ? note : undefined,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }
      return api.orders.create.mutate(orderData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders.getAll'] })
      queryClient.invalidateQueries({ queryKey: ['products.getAll'] })
      clearCart()
      toast.success('Order completed successfully')
      onClose()
      resetForm()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order')
    }
  })

  const resetForm = () => {
    setIsPaid(true)
    setAmountPaid('')
    setNote('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isPaid && (!amountPaid || Number(amountPaid) < total)) {
      toast.error('Amount paid must be equal to or greater than the total')
      return
    }
    
    if (!isPaid && !note.trim()) {
      toast.error('Please provide a note for unpaid order')
      return
    }

    createOrder.mutate()
  }

  if (!isOpen) return null

  const change = isPaid ? Number(amountPaid) - total : 0

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="payment-type-selector">
            <label className="radio-label">
              <input
                type="radio"
                checked={isPaid}
                onChange={() => setIsPaid(true)}
                name="paymentType"
              />
              <span>Paid</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                checked={!isPaid}
                onChange={() => setIsPaid(false)}
                name="paymentType"
              />
              <span>Unpaid</span>
            </label>
          </div>

          <div className="total-display">
            <span>Total:</span>
            <span className="amount">{total.toFixed(2)} DT</span>
          </div>

          {isPaid ? (
            <div className="payment-details">
              <div className="form-group">
                <label htmlFor="amountPaid">Amount Paid</label>
                <input
                  type="number"
                  id="amountPaid"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  min={total}
                  step="0.01"
                  required
                  className="form-input"
                />
              </div>
              {amountPaid && (
                <div className="change-display">
                  <span>Change:</span>
                  <span className="amount">{change.toFixed(2)} DT</span>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="note">Note (required)</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                className="form-input"
                rows={3}
                placeholder="Enter reason for unpaid order..."
              />
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={
                createOrder.isPending || 
                (isPaid && (!amountPaid || Number(amountPaid) < total)) ||
                (!isPaid && !note.trim())
              }
            >
              {createOrder.isPending ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 