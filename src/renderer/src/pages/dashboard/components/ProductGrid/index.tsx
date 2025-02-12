import { useState } from 'react'
import './styles.css'
import { api } from '@renderer/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '@renderer/contexts/CartContext'

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  categoryId: number
}

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories.getAll'],
    queryFn: () => api.categories.getAll.query()
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products.getAll'],
    queryFn: () => api.products.getAll.query()
  })

  const { addToCart } = useCart()

  const filteredProducts = activeCategory
    ? products?.filter(product => product.categoryId === activeCategory)
    : products

  return (
    <div className="product-grid-container">
      <div className="categories-filter">
        <button
          className={`category-filter-btn ${activeCategory === null ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All Products
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            className={`category-filter-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {(productsLoading || categoriesLoading) ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          filteredProducts?.map((product) => (
            <div key={product.id} className="product-card">
              {product.image && (
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
              )}
              <div className="product-info" onClick={() => addToCart(product)}>
                <h3>{product.name}</h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
