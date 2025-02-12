import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { api } from '@renderer/utils/trpc'
import { toast } from 'react-hot-toast'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number
    name: string
    price: number
    description?: string
    stockQuantity: number
    trackStock: boolean
    categoryId: number
  }
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(product.price.toString())
  const [description, setDescription] = useState(product.description || '')
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity.toString())
  const [trackStock, setTrackStock] = useState(product.trackStock)
  const [categoryId, setCategoryId] = useState(product.categoryId.toString())

  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories.getAll'],
    queryFn: () => api.categories.getAll.query()
  })

  useEffect(() => {
    setName(product.name)
    setPrice(product.price.toString())
    setDescription(product.description || '')
    setStockQuantity(product.stockQuantity.toString())
    setTrackStock(product.trackStock)
    setCategoryId(product.categoryId.toString())
  }, [product])

  const updateProduct = useMutation({
    mutationFn: () => api.products.update.mutate({
      id: product.id,
      name,
      price: parseFloat(price),
      description,
      stockQuantity: parseInt(stockQuantity),
      trackStock,
      categoryId: parseInt(categoryId)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products.getAll'] })
      toast.success('Product updated successfully')
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProduct.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input textarea-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="form-input select-input"
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
            <label htmlFor="stockQuantity">Stock Quantity</label>
            <input
              type="number"
              id="stockQuantity"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              min="0"
              required
              className="form-input"
              disabled={!trackStock}
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
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 