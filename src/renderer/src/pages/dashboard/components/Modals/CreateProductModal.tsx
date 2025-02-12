import { useState } from 'react'
import { api } from '@renderer/utils/trpc'
import { toast } from 'react-hot-toast'
import './modal.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [stockQuantity, setStockQuantity] = useState('0')
  const [trackStock, setTrackStock] = useState(true)
  const [categoryId, setCategoryId] = useState('')

  const queryClient = useQueryClient()

  // Get categories for the select input
  const { data: categories } = useQuery({
    queryKey: ['categories.getAll'],
    queryFn: () => api.categories.getAll.query()
  })

  const createProduct = useMutation({
    mutationFn: () =>
      api.products.create.mutate({
        name,
        price: parseFloat(price),
        description,
        image,
        stockQuantity: parseInt(stockQuantity),
        trackStock,
        categoryId: parseInt(categoryId)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products.getAll'] })
      resetForm()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const resetForm = () => {
    setName('')
    setPrice('')
    setDescription('')
    setImage('')
    setStockQuantity('0')
    setTrackStock(true)
    setCategoryId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price || !categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    createProduct.mutate({
      name,
      price: parseFloat(price),
      description,
      image,
      stockQuantity: parseInt(stockQuantity),
      trackStock,
      categoryId: parseInt(categoryId)
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Product</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description"
              rows={3}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stockQuantity">Stock Quantity</label>
            <input
              id="stockQuantity"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              disabled={!trackStock}
              className="form-input"
            />
          </div>

          <div className="form-group-inline">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={(e) => setTrackStock(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-label">Track Stock</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={createProduct.isLoading}>
              {createProduct.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
