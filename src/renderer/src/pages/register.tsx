import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'
import { api } from '@renderer/utils/trpc'
import { useMutation } from '@tanstack/react-query'
import { RegisterInput } from 'src/main/routes/auth'
import { TRPCClientError } from '@trpc/client'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterInput) => {
      return api.auth.register.mutate(credentials)
    },
    onSuccess: () => {
      setErrorMessage('')
      navigate('/login')
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
    registerMutation.mutate({
      username,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined
    })
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Create Account</h1>
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
              placeholder="Choose a username"
              minLength={3}
              maxLength={50}
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
              placeholder="Choose a password"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name (optional)"
            />
          </div>
          <button type="submit" className="login-button" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
          </button>
          <div className="auth-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
