import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import './modal.css'
import { ClientInput } from 'src/main/routes/clients'

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const queryClient = useQueryClient()

  const createClient = useMutation({
    mutationFn: (client: ClientInput) => api.clients.create.mutate(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients.getAll'] })
      onClose()
      resetForm()
    }
  })

  const resetForm = () => {
    setName('')
    setPhone('')
    setAddress('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createClient.mutate({
      name,
      phone,
      address
    })
  }
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Client</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="form-input"
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={createClient.isPending}>
              {createClient.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
