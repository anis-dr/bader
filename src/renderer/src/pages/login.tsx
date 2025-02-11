import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual login logic
    console.log('Login attempt with:', { email, password })
    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
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
          <button type="submit" className="login-button">
            Log In
          </button>
          <div className="auth-link">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
