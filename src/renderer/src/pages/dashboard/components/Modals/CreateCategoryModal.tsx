import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { toast } from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import './modal.css'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: () => api.categories.create.mutate({ name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories.getAll'] })
      toast.success('Category created successfully')
      resetForm()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const resetForm = () => {
    setName('')
    setDescription('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Category name is required')
      return
    }
    createCategory.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Category</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="categoryName">Name *</label>
            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryDescription">Description</label>
            <textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              className="form-input"
              rows={3}
            />
          </div>

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
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 