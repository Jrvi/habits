import { LogOut, User } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { t, getLanguage, setLanguage } from '../i18n/translations.js'

const UserInfo = ({ user, handleLogout }) => {
  const navigate = useNavigate()

  const toggleLang = () => {
    const next = getLanguage() === 'fi' ? 'en' : 'fi'
    setLanguage(next)
  }

  return (
    <div className="user-info-card">
      <div className="user-greeting">
        <h2>
          {t('hi')} <span className="username">{user.username}</span>!
        </h2>
        <p>{t('welcomeBack')}</p>
      </div>

      <div className="user-actions">
        <button className="lang-toggle-btn" type="button" onClick={toggleLang}>
          {getLanguage() === 'fi' ? 'EN' : 'FI'}
        </button>

        <button className="profile-btn" type="button" onClick={() => navigate('/profile')}>
          <User size={16} /> {t('profile')}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default UserInfo;
