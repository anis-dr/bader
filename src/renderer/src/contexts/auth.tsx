import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthOutput } from 'src/main/routes/auth'
import { api } from '@renderer/utils/trpc'

type User = AuthOutput['user']
type Tokens = AuthOutput['tokens']
interface AuthContextType {
  user: User | null
  tokens: Tokens | null
  login: (user: User, tokens: Tokens) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_USER_KEY = 'auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const refreshAccessToken = useCallback(async (token: string) => {
    try {
      const result = await api.auth.refresh.mutate({ refreshToken: token })
      setAccessToken(result.accessToken)
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken)
      return true
    } catch (error) {
      console.error('Failed to refresh token:', error)
      logout()
      return false
    }
  }, [])

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = localStorage.getItem(AUTH_USER_KEY)

    if (storedRefreshToken && storedUser) {
      setRefreshToken(storedRefreshToken)
      setUser(JSON.parse(storedUser))

      if (storedAccessToken) {
        setAccessToken(storedAccessToken)
      } else {
        refreshAccessToken(storedRefreshToken)
      }
    }
    setIsLoading(false)
  }, [refreshAccessToken])

  const login = (newUser: User, newTokens: Tokens) => {
    setUser(newUser)
    setAccessToken(newTokens.accessToken)
    setRefreshToken(newTokens.refreshToken)
    localStorage.setItem(ACCESS_TOKEN_KEY, newTokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newTokens.refreshToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens: accessToken && refreshToken ? { accessToken, refreshToken } : null,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
