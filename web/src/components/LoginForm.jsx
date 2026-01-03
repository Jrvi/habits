import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { t } from '../i18n/translations.js'

const LoginForm = ({ handleLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

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

      <h2>{t('login')}</h2>

      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            type="email"
            name="Email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            name="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
        </div>

        <button type="submit">{t('login')}</button>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          <button
            className="link-button"
            type="button"
            onClick={() => navigate('/forgot-password')}
          >
            {t('forgotPassword')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
