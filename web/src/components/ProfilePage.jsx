import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import profileService from '../services/profile'
import { t } from '../i18n/translations.js'

const ProfilePage = ({ user, setUser, setNotification }) => {
  const [email, setEmail] = useState(user?.email || '')
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const navigate = useNavigate()

  const saveUserToStorage = (nextUser) => {
    const existing = window.localStorage.getItem('loggedHabitAppUser')
    if (!existing) return
    const parsed = JSON.parse(existing)
    const merged = { ...parsed, ...nextUser }
    window.localStorage.setItem('loggedHabitAppUser', JSON.stringify(merged))
  }

  const onUpdateEmail = async (e) => {
    e.preventDefault()
    try {
      const updated = await profileService.updateEmail(email, currentPasswordForEmail)
      setUser((prev) => ({ ...prev, ...updated }))
      saveUserToStorage(updated)
      setNotification({ message: t('emailUpdated'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
      setCurrentPasswordForEmail('')
    } catch (err) {
      const msg = err.response?.data?.error || t('errorUpdatingEmail')
      setNotification({ message: msg, type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const onUpdatePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmNewPassword) {
      setNotification({ message: t('passwordsDoNotMatch'), type: 'error' })
      setTimeout(() => setNotification(null), 5000)
      return
    }

    try {
      await profileService.updatePassword(currentPassword, newPassword)
      setNotification({ message: t('passwordUpdated'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      const msg = err.response?.data?.error || t('errorUpdatingPassword')
      setNotification({ message: msg, type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  return (
    <div>
      <div className="goal-header" style={{ marginBottom: 20 }}>
        <h2>{t('profile')}</h2>
        <button className="link-button" type="button" onClick={() => navigate('/')}
        >
          {t('back')}
        </button>
      </div>

      <div className="habit-form">
        <h3 style={{ marginTop: 0 }}>{t('updateEmail')}</h3>
        <form onSubmit={onUpdateEmail}>
          <div className="form-group">
            <label htmlFor="newEmail">{t('newEmail')}</label>
            <input
              id="newEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentPasswordForEmail">{t('currentPassword')}</label>
            <input
              id="currentPasswordForEmail"
              type="password"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">{t('save')}</button>
        </form>
      </div>

      <div className="habit-form">
        <h3 style={{ marginTop: 0 }}>{t('updatePassword')}</h3>
        <form onSubmit={onUpdatePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">{t('currentPassword')}</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">{t('newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword">{t('confirmNewPassword')}</label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">{t('save')}</button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
