import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const savedUser = localStorage.getItem('habitsUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post('http://localhost:8081/v1/authentication/token', {
        email: username,
        password,
      })
      const userData = { email: username, token: response.data.data }
      setUser(userData)
      localStorage.setItem('habitsUser', JSON.stringify(userData))
      setUsername('')
      setPassword('')
    } catch (err) {
      setError('Väärä käyttäjätunnus tai salasana')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('habitsUser')
  }

  if (!user) {
    return (
      <div>
        <h2>Kirjaudu sisään</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Käyttäjänimi"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Salasana"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Kirjaudu</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <h2>Tervetuloa, {user.email}!</h2>
      <button onClick={handleLogout}>Kirjaudu ulos</button>
      <Feed token={user.token} />
    </div>
  )
}

function Feed({ token }) {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [impact, setImpact] = useState('')

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get('http://localhost:8081/v1/users/feed', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setPosts(Array.isArray(response.data.data) ? response.data.data : [])
      } catch (err) {
        setError('Feedin haku epäonnistui')
      }
    }
    fetchFeed()
  }, [token])

  const handlePost = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(
        'http://localhost:8081/v1/habits',
        { name, impact },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setName('')
      setImpact('')
      // Päivitä feedi postauksen jälkeen
      const response = await axios.get('http://localhost:8081/v1/users/feed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPosts(Array.isArray(response.data.data) ? response.data.data : [])
    } catch (err) {
      setError('Habbin lisääminen epäonnistui')
    }
  }

  return (
    <div>
      <h3>Feed</h3>
      <form onSubmit={handlePost}>
        <input
          type="text"
          placeholder="Habbin nimi"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vaikutus"
          value={impact}
          onChange={e => setImpact(e.target.value)}
        />
        <button type="submit">Lisää habit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.name} {post.impact}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
