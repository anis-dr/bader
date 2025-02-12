import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { SpentInput } from 'src/main/routes/spents'

interface CreateSpentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateSpentModal({ isOpen, onClose }: CreateSpentModalProps) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const queryClient = useQueryClient()

  const createSpent = useMutation({
    mutationFn: (values: SpentInput) =>
      api.spents.create.mutate({
        title,
        amount: parseFloat(amount),
        note: note.trim() ? note : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spents.getAll'] })
      toast.success('Spent created successfully')
      onClose()
      resetForm()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create spent')
    }
  })

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setNote('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount')
      return
    }
    createSpent.mutate({
      title,
      amount: parseFloat(amount),
      note: note.trim() ? note : undefined
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Spent</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spent title"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="form-input"
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={createSpent.isPending}>
              {createSpent.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 