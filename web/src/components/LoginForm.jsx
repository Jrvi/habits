import { useState } from 'react'
import Logo from './Logo'

const LoginForm = ({ handleLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    handleLogin({ email, password })
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-form">
      <div className="login-header">
        <Logo />
      </div>

      <h2>Login</h2>

      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="Email"
            placeholder="you@example.com"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="Password"
            placeholder="••••••••"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default LoginForm
