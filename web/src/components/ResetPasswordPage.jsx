import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Logo from './Logo'
import passwordResetService from '../services/passwordReset'
import { t } from '../i18n/translations.js'

const ResetPasswordPage = ({ setNotification }) => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setNotification({ message: t('passwordsDoNotMatch'), type: 'error' })
      setTimeout(() => setNotification(null), 5000)
      return
    }

    setLoading(true)
    try {
      await passwordResetService.resetPassword(token, password)
      setNotification({ message: t('passwordResetSuccess'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
      navigate('/login')
    } catch (err) {
      setNotification({ message: t('passwordResetFailed'), type: 'error' })
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
          <p>{t('resetPasswordHelp')}</p>
        </div>

        <div className="auth-form">
          <div className="login-header">
            <Logo />
          </div>

          <h2>{t('resetPassword')}</h2>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="password">{t('newPassword')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? t('saving') : t('resetPassword')}
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

export default ResetPasswordPage
