import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
} from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log("URL: " + API_URL);

// Aktivointisivu
function ActivatePage() {
  const { token } = useParams();
  const [status, setStatus] = useState("Aktivoidaan...");

  useEffect(() => {
    if (token) {
      axios
        .put(`${API_URL}/v1/users/activate/` + token )
        .then(() => setStatus("Tili aktivoitu onnistuneesti!"))
        .catch(() =>
          setStatus("Aktivointi epäonnistui. Linkki voi olla vanhentunut.")
        );
    } else {
      setStatus("Aktivointitunnusta ei löytynyt.");
    }
  }, [token]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4 text-center" style={{ maxWidth: "24rem" }}>
        <h2 className="mb-3">Aktivointi</h2>
        <p>{status}</p>
        <div className="mt-4">
          <Link to="/" className="btn btn-primary">
            {status.includes("onnistuneesti")
              ? "Siirry kirjautumaan"
              : "Palaa etusivulle"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Login / Rekisteröinti + Feed
function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("habitsUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/v1/authentication/user`, {
          email,
          username,
          password,
        });
        setIsRegister(false);
        setError("Rekisteröinti onnistui! Tarkista sähköpostisi aktivointilinkki.");
        return;
      }
      const response = await axios.post(`${API_URL}/v1/authentication/token`, {
        email,
        password,
      });
      const userData = { email, token: response.data.data };
      setUser(userData);
      localStorage.setItem("habitsUser", JSON.stringify(userData));
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(
        isRegister ? "Rekisteröinti epäonnistui" : "Väärä sähköposti tai salasana"
      );
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("habitsUser");
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient">
        <div className="card shadow-lg p-4" style={{ maxWidth: "26rem", width: "100%" }}>
          <h2 className="text-center mb-4">
            {isRegister ? "Luo uusi tili" : "Kirjaudu sisään"}
          </h2>

          <form onSubmit={handleAuth} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Sähköposti</label>
              <input
                type="email"
                placeholder="esim. nimi@posti.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="form-label">Käyttäjätunnus</label>
                <input
                  type="text"
                  placeholder="Käyttäjänimesi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label">Salasana</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
              {isRegister ? "Rekisteröidy" : "Kirjaudu"}
            </button>
          </form>

          {error && <p className="text-danger text-center mt-3">{error}</p>}

          <p className="mt-4 text-center text-muted">
            {isRegister ? "Onko sinulla jo tili?" : "Eikö sinulla ole vielä tiliä?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="btn btn-link p-0 fw-semibold"
            >
              {isRegister ? "Kirjaudu" : "Rekisteröidy"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tervetuloa, {user.email}!</h2>
        <button onClick={handleLogout} className="btn btn-danger">
          Kirjaudu ulos
        </button>
      </div>
      <Feed token={user.token} />
    </div>
  );
}

// Feed (habittien hallinta)
function Feed({ token }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [impact, setImpact] = useState("neutral");
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/users/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError("Feedin haku epäonnistui");
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/v1/habits`,
        { name, impact },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setImpact("neutral");
      setShowAdd(false);
      await fetchFeed();
    } catch (err) {
      setError("Lisääminen epäonnistui");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/v1/habits/${id}`,
        { name, impact },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(null);
      setName("");
      setImpact("neutral");
      await fetchFeed();
    } catch (err) {
      setError("Päivitys epäonnistui");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/v1/habits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFeed();
    } catch (err) {
      setError("Poistaminen epäonnistui");
    }
  };

  return (
    <div>
      <h3 className="mb-3">Habitit</h3>

      {error && <p className="text-danger">{error}</p>}

      {/* Lista */}
      <div className="d-grid gap-3 mb-4">
        {posts.map((post) => (
          <div key={post.id} className="card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              {editing === post.id ? (
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    style={{ maxWidth: "200px" }}
                  />
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="form-select"
                    style={{ maxWidth: "150px" }}
                  >
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                    <option value="positive">Positive</option>
                  </select>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">{post.name}</span>
                  <span
                    className={`badge ${post.impact === "positive"
                        ? "bg-success"
                        : post.impact === "negative"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                  >
                    {post.impact}
                  </span>
                </div>
              )}

              <div className="btn-group ms-3">
                {editing === post.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(post.id)}
                      className="btn btn-success btn-sm"
                    >
                      ✅ Tallenna
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setName("");
                        setImpact("neutral");
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      ✖ Peruuta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(post.id);
                        setName(post.name);
                        setImpact(post.impact);
                      }}
                      className="btn btn-warning btn-sm text-dark"
                    >
                      ✏️ Muokkaa
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑 Poista
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lisää habit -nappi ja lomake */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-outline-primary"
        >
          ➕ Lisää habit
        </button>
      ) : (
        <form onSubmit={handleAdd} className="row g-2">
          <div className="col-sm">
            <input
              type="text"
              placeholder="Habitin nimi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="col-sm">
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="form-select"
            >
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
            </select>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-success">
              Lisää
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setName("");
                setImpact("neutral");
              }}
              className="btn btn-secondary ms-2"
            >
              Peruuta
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Router App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthWrapper />} />
        <Route path="/confirm/:token" element={<ActivatePage />} />
      </Routes>
    </Router>
  );
}

export default App;
