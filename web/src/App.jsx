import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
} from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// 🔹 Aktivointisivu
function ActivatePage() {
  const { token } = useParams()
  const [status, setStatus] = useState('Aktivoidaan...')

  useEffect(() => {
    if (token) {
      axios
        .put(`${API_URL}/v1/users/activate/` + token )
        .then(() => setStatus('Tili aktivoitu onnistuneesti!'))
        .catch(() =>
          setStatus('Aktivointi epäonnistui. Linkki voi olla vanhentunut.')
        )
    } else {
      setStatus('Aktivointitunnusta ei löytynyt.')
    }
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Aktivointi</h2>
        <p>{status}</p>
        <div className="mt-4">
          <Link to="/" className="text-blue-600 hover:underline">
            {status.includes('onnistuneesti')
              ? 'Siirry kirjautumaan'
              : 'Palaa etusivulle'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// 🔹 Login / Rekisteröinti + Feed
function AuthWrapper() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('habitsUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        // Rekisteröinti
        await axios.post(`${API_URL}/v1/authentication/user`, {
          email,
          username,
          password,
        })
        // Tässä EI kirjata sisään suoraan, koska tili pitää aktivoida sähköpostista
        setIsRegister(false)
        setError('Rekisteröinti onnistui! Tarkista sähköpostisi aktivointilinkki.')
        return
      }
      // Kirjautuminen
      const response = await axios.post(`${API_URL}/v1/authentication/token`, {
        email,
        password,
      })
      const userData = { email, token: response.data.data }
      setUser(userData)
      localStorage.setItem('habitsUser', JSON.stringify(userData))
      setEmail('')
      setUsername('')
      setPassword('')
    } catch (err) {
      setError(
        isRegister
          ? 'Rekisteröinti epäonnistui'
          : 'Väärä sähköposti tai salasana'
      )
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('habitsUser')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-md w-96">
          <h2 className="text-xl font-bold mb-4 text-center">
            {isRegister ? 'Rekisteröidy' : 'Kirjaudu sisään'}
          </h2>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Sähköposti"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border rounded-md"
              required
            />
            {isRegister && (
              <input
                type="text"
                placeholder="Käyttäjätunnus"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded-md"
                required
              />
            )}
            <input
              type="password"
              placeholder="Salasana"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              {isRegister ? 'Rekisteröidy' : 'Kirjaudu'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
          <p className="mt-4 text-sm text-center">
            {isRegister ? 'Onko sinulla jo tili?' : 'Eikö sinulla ole vielä tiliä?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline"
            >
              {isRegister ? 'Kirjaudu sisään' : 'Rekisteröidy'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tervetuloa, {user.email}!</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Kirjaudu ulos
        </button>
      </div>
      <Feed token={user.token} />
    </div>
  )
}

// 🔹 Feed (habittien hallinta)
function Feed({ token }) {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [impact, setImpact] = useState('neutral')
  const [editing, setEditing] = useState(null)

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/users/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPosts(Array.isArray(response.data.data) ? response.data.data : [])
    } catch (err) {
      setError('Feedin haku epäonnistui')
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [token])

  const handlePost = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await axios.patch(
          `${API_URL}/v1/habits/${editing}`,
          { name, impact },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setEditing(null)
      } else {
        await axios.post(
          `${API_URL}/v1/habits`,
          { name, impact },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setName('')
      setImpact('neutral')
      await fetchFeed()
    } catch (err) {
      setError('Toiminto epäonnistui')
    }
  }

  const handleEdit = (habit) => {
    setName(habit.name)
    setImpact(habit.impact)
    setEditing(habit.id)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/v1/habits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchFeed()
    } catch (err) {
      setError('Poistaminen epäonnistui')
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Habitit</h3>
      <form onSubmit={handlePost} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Habitin nimi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 border rounded-md"
        />
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          className="flex-1 p-2 border rounded-md"
        >
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
          <option value="positive">Positive</option>
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          {editing ? 'Päivitä' : 'Lisää'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{post.name}</p>
              <p className="text-sm text-gray-600">Impact: {post.impact}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(post)}
                className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500"
              >
                Muokkaa
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              >
                Poista
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🔹 Router App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthWrapper />} />
        <Route path="/confirm/:token" element={<ActivatePage />} />
      </Routes>
    </Router>
  )
}

export default App

