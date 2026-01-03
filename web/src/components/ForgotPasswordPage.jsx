import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import passwordResetService from '../services/passwordReset'
import { t } from '../i18n/translations.js'

const ForgotPasswordPage = ({ setNotification }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await passwordResetService.requestReset(email)
      setNotification({ message: t('resetLinkSent'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
    } catch (err) {
      setNotification({ message: t('resetLinkSent'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-welcome">
          <h1>{t('appName')}</h1>
          <p>{t('forgotPasswordHelp')}</p>
        </div>

        <div className="auth-form">
          <div className="login-header">
            <Logo />
          </div>

          <h2>{t('forgotPassword')}</h2>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? t('sending') : t('sendResetLink')}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 16 }}>
            <button className="link-button" type="button" onClick={() => navigate('/login')}>
              {t('backToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
