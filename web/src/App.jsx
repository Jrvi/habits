import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import ActivationPage from './components/ActivationPage.jsx'
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx'
import ResetPasswordPage from './components/ResetPasswordPage.jsx'
import Notification from './components/Notification.jsx'
import UserInfo from './components/UserInfo'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList.jsx'
import GoalList from './components/GoalList'
import Footer from './components/Footer.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import loginService from './services/login'
import habitsService from './services/habits'
import registerService from './services/register.js'
import feedService from './services/feed'
import goalsService from './services/goals'
import completionsService from './services/completions'
import profileService from './services/profile'
import './App.css'
import Togglable from './components/Togglable.jsx'
import { onLanguageChange, getLanguage, t } from './i18n/translations.js'

const App = () => {
  const [habits, setHabits] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  // Pakota re-render kun kieli vaihtuu
  const [, forceRerender] = useState(0)
  useEffect(() => {
    // init (varmistaa että currentLang on luettu localStoragesta)
    getLanguage()
    return onLanguageChange(() => forceRerender((n) => n + 1))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedHabitAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      habitsService.setToken(user.token)
      feedService.setToken(user.token)
      goalsService.setToken(user.token)
      completionsService.setToken(user.token)
      profileService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    if (user) {
      feedService.getFeed()
        .then(initialHabits => {
          if (Array.isArray(initialHabits)) {
            setHabits(initialHabits)
          } else {
            console.error("Feed is not an array:", initialHabits)
          }
        })
        .catch(err => {
          console.error("Failed to fetch feed:", err)
        })
    } else {
      setHabits([])
    }
  }, [user])

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedHabitAppUser', JSON.stringify(user))
      setUser(user)
      habitsService.setToken(user.token)
      feedService.setToken(user.token)
      goalsService.setToken(user.token)
      completionsService.setToken(user.token)
      profileService.setToken(user.token)
      setNotification({ message: t('loginSuccessful'), type: 'success' })
      setTimeout(() => setNotification(null), 5000)
      navigate('/')
    } catch (exception) {
      setNotification({ message: t('wrongCredentials'), type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleRegister = async (newUser) => {
    try {
      await registerService.register(newUser)
      setNotification({
        message: t('accountCreated'),
        type: 'success'
      })
      setTimeout(() => setNotification(null), 5000)
      navigate('/login')
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || t('registrationFailed'),
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedHabitAppUser')
    setUser(null)
    setHabits([])
    navigate('/login')
  }

  if (user === null) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <div className="auth-container">
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>
              <div className="auth-content">
                <div className="auth-welcome">
                  <h1>{t('appName')}</h1>
                  <p>{t('welcomeMessage')}</p>
                </div>
                <LoginForm handleLogin={handleLogin} />
                <div className="auth-footer">
                  <span>{t('dontHaveAccount')}</span>
                  <button
                    className="link-button"
                    onClick={() => navigate('/register')}
                  >
                    {t('registerHere')}
                  </button>
                </div>
              </div>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="auth-container">
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>
              <div className="auth-content">
                <div className="auth-welcome">
                  <h1>{t('joinTitle')}</h1>
                  <p>{t('joinMessage')}</p>
                </div>
                <RegisterForm handleRegister={handleRegister} />
                <div className="auth-footer">
                  <span>{t('alreadyHaveAccount')}</span>
                  <button
                    className="link-button"
                    onClick={() => navigate('/login')}
                  >
                    {t('loginHere')}
                  </button>
                </div>
              </div>
            </div>
          }
        />

        {/* Aktivointi polkuparametrilla */}
        <Route path="/activate/:token" element={<ActivationPage />} />

        <Route
          path="/forgot-password"
          element={
            <>
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>
              <ForgotPasswordPage setNotification={setNotification} />
            </>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <>
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>
              <ResetPasswordPage setNotification={setNotification} />
            </>
          }
        />

        {/* oletus ohjaa login-sivulle */}
        <Route path="*" element={
          <div className="container">
            <div className="notification-overlay">
              <Notification notification={notification} />
            </div>
            <LoginForm handleLogin={handleLogin} />
          </div>
        } />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app-shell">
            <div className="container">
              <UserInfo user={user} handleLogout={handleLogout} />
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>

              <div className="main-layout">
                <div className="sidebar-left">
                  <GoalList habits={habits} />
                </div>

                <div className="sidebar-right">
                  <HabitList
                    habits={habits}
                    setHabits={setHabits}
                    user={user}
                    setNotification={setNotification}
                  />
                </div>
              </div>
            </div>
            <Footer />
          </div>
        }
      />

      <Route
        path="/profile"
        element={
          <div className="app-shell">
            <div className="container">
              <UserInfo user={user} handleLogout={handleLogout} />
              <div className="notification-overlay">
                <Notification notification={notification} />
              </div>

              <ProfilePage
                user={user}
                setUser={setUser}
                setNotification={setNotification}
              />
            </div>
            <Footer />
          </div>
        }
      />

      {/* Aktivointi myös kirjautuneelle, varmuuden vuoksi */}
      <Route path="/activate/:token" element={<ActivationPage />} />
    </Routes>
  )
}

export default App
