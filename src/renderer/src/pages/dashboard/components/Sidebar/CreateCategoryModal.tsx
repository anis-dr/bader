import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@renderer/utils/trpc'
import '../../../../styles/modal.css'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: () => api.categories.create.mutate({ name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories.getAll'] })
      onClose()
      setName('')
      setDescription('')
    }
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Category</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Category Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          {createMutation.isError && (
            <div className="error-message">
              {createMutation.error.message || 'Failed to create category'}
            </div>
          )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 