import { useAuth } from '@renderer/contexts/auth'
import '../styles/home.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '@renderer/utils/trpc'

export function HomePage() {
  const { user, logout } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['greeting', 'personalGreeting'],
    queryFn: () => api.greeting.personalGreeting.query()
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Welcome, {user?.firstName || user?.username}!</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>
      <main className="main-content">
        <p>{data}</p>
      </main>
    </div>
  )
}
