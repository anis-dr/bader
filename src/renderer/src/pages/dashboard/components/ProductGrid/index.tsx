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
}

export function ProductGrid() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products.getAll'],
    queryFn: () => api.products.getAll.query()
  })

  const { addToCart } = useCart()

  return (
    <div className="product-grid">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        products?.map((product) => (
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
  )
}
