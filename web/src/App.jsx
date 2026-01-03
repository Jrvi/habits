import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import ActivationPage from './components/ActivationPage.jsx'
import Notification from './components/Notification.jsx'
import UserInfo from './components/UserInfo'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import GoalList from './components/GoalList'
import loginService from './services/login'
import habitsService from './services/habits'
import registerService from './services/register.js'
import feedService from './services/feed'
import goalsService from './services/goals'
import completionsService from './services/completions'
import './App.css'
import Togglable from './components/Togglable.jsx'

const App = () => {
  const [habits, setHabits] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedHabitAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      habitsService.setToken(user.token)
      feedService.setToken(user.token)
      goalsService.setToken(user.token)
      completionsService.setToken(user.token)
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
      setNotification({ message: 'Login successful', type: 'success' })
      setTimeout(() => setNotification(null), 5000)
      navigate('/')
    } catch (exception) {
      setNotification({ message: 'Wrong username or password', type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleRegister = async (newUser) => {
    try {
      await registerService.register(newUser)
      setNotification({
        message: 'Account created! Please check your email to activate.',
        type: 'success'
      })
      setTimeout(() => setNotification(null), 5000)
      navigate('/login')
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || 'Registration failed',
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
            <div className="container">
              <Notification notification={notification} />
              <LoginForm handleLogin={handleLogin} />
              <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>
                Don’t have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => navigate('/register')}
                >
                  Register here
                </button>
              </p>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="container">
              <Notification notification={notification} />
              <RegisterForm handleRegister={handleRegister} />
              <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>
                Already have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => navigate('/login')}
                >
                  Login here
                </button>
              </p>
            </div>
          }
        />

        {/* Aktivointi polkuparametrilla */}
        <Route path="/activate/:token" element={<ActivationPage />} />

        {/* oletus ohjaa login-sivulle */}
        <Route path="*" element={
          <div className="container">
            <Notification notification={notification} />
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
          <div className="container">
            <UserInfo user={user} handleLogout={handleLogout} />
            <Notification notification={notification} />
            
            <GoalList />
            
            <HabitList
              habits={habits}
              setHabits={setHabits}
              user={user}
              setNotification={setNotification}
            />
            <Togglable buttonLabel="New Habit">
              {(onCancel) => (
                <HabitForm
                  user={user}
                  habits={habits}
                  setHabits={setHabits}
                  setNotification={setNotification}
                  onCancel={onCancel}
                />
              )}
            </Togglable>
          </div>
        }
      />

      {/* Aktivointi myös kirjautuneelle, varmuuden vuoksi */}
      <Route path="/activate/:token" element={<ActivationPage />} />
    </Routes>
  )
}

export default App
