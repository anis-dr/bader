import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'
import { api } from '@renderer/utils/trpc'
import { useMutation } from '@tanstack/react-query'
import { LoginInput } from 'src/main/routes/auth'
import { TRPCClientError } from '@trpc/client'
import { useAuth } from '@renderer/contexts/auth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginInput) => {
      return api.auth.login.mutate(credentials)
    },
    onSuccess: (data) => {
      setErrorMessage('')
      login(data.user, data.tokens)
      navigate('/dashboard')
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    }
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    loginMutation.mutate({ username, password })
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {errorMessage && (
            <div className="error-message" role="alert">
              {errorMessage}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Log In'}
          </button>
          <div className="auth-link">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
