import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@renderer/utils/trpc'
import Header from '../dashboard/components/Header'
import { toast } from 'react-hot-toast'
import './styles.css'
import EditProductModal from './components/EditProductModal'

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const queryClient = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<null | any>(null)

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products.getAll'],
    queryFn: () => api.products.getAll.query()
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories.getAll'],
    queryFn: () => api.categories.getAll.query()
  })

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.products.delete.mutate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products.getAll'] })
      toast.success('Product deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product')
    }
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.categories.delete.mutate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories.getAll'] })
      toast.success('Category deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category')
    }
  })

  return (
    <>
      <Header />
      <div className="products-page">
        <div className="page-header">
          <h1>Products Management</h1>
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
              data-tab="products"
            >
              Products
            </button>
            <button
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
              data-tab="categories"
            >
              Categories
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="product-section">
            <div className="table-container">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.price.toFixed(2)} DT</td>
                      <td>
                        <span
                          className={`stock ${
                            product.trackStock && product.stockQuantity < 10 ? 'low' : ''
                          }`}
                        >
                          {product.trackStock ? product.stockQuantity : 'N/A'}
                        </span>
                      </td>
                      <td>{product.category?.name || 'No Category'}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => setEditingProduct(product)}
                          title="Edit product"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              deleteProduct.mutate(product.id)
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="categories-section">
            <div className="table-container">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Products Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{products?.filter((p) => p.categoryId === category.id).length || 0}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            /* TODO: Implement edit */
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category?')) {
                              deleteCategory.mutate(category.id)
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
        />
      )}
    </>
  )
}
