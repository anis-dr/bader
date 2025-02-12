import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'
import { api } from '@renderer/utils/trpc'
import { useMutation } from '@tanstack/react-query'
import { LoginInput } from 'src/main/routes/auth'
import { TRPCClientError } from '@trpc/client'
import { useAuth } from '@renderer/contexts/auth'
import '../styles/login.css'
import Logo from '@renderer/assets/caisstek.png'

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
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loginMutation.isPending}
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loginMutation.isPending || !username || !password}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
