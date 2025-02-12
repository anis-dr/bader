import { useState } from 'react'
import '../../../../styles/sidebar.css'
import { api } from '@renderer/utils/trpc'
import { useQuery } from '@tanstack/react-query'
import '../Modals/modal.css'

interface Category {
  id: number
  name: string
  icon?: string
}

export default function Sidebar() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  // Use useQuery directly
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories.getAll'],
    queryFn: () => api.categories.getAll.query()
  })

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategory(categoryId)
  }

  if (isLoading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-loading">Loading categories...</div>
      </aside>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Categories</h2>
        <button className="refresh-btn" onClick={() => {}}>
          🔄 Refresh
        </button>
      </div>

      <nav className="category-list">
        <button
          className={`category-item ${activeCategory === null ? 'active' : ''}`}
          onClick={() => handleCategoryClick(null)}
        >
          🏪 All Products
        </button>

        {categories?.map((category) => (
          <button
            key={category.id}
            className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </nav>
    </aside>
  )
}
