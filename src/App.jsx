import { useEffect, useState } from 'react'
import PrototypeFrame from './components/PrototypeFrame'
import { LOGIN_PATH, findProfile, profiles, readSession, saveSession } from './services/profiles'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const profileKey = findProfile(email, password)

    if (!profileKey) {
      setError('Correo o contraseña incorrectos. Usa una cuenta demo para continuar.')
      return
    }

    setError('')
    onLogin(profileKey)
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-mono" aria-hidden="true">CF</span>
          <div>
            <strong>Club Campestre Farallones</strong>
            <span>Plataforma de Alimentos y Bebidas</span>
          </div>
        </div>
        <div className="login-copy">
          <span className="login-tag">Acceso al prototipo</span>
          <h1>Ingresa para ver tu experiencia</h1>
          <p>La vista se ajusta al perfil de cada persona y muestra solo la propuesta que necesita utilizar.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@farallones.co"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-button" type="submit">Ingresar</button>
        </form>
        <details className="demo-accounts">
          <summary>Cuentas demo</summary>
          <ul>
            {Object.values(profiles).map((profile) => (
              <li key={profile.email}><b>{profile.label}:</b> {profile.email} / 123456</li>
            ))}
          </ul>
        </details>
      </section>
    </main>
  )
}

function App() {
  const [profileKey, setProfileKey] = useState(readSession)
  const profile = profileKey ? profiles[profileKey] : null

  // Cada perfil vive en su propia ruta: sin sesión se va a /login y con sesión
  // a la página del perfil, aunque se escriba otra URL o se use "Atrás".
  useEffect(() => {
    const target = profile ? profile.path : LOGIN_PATH
    const sync = () => {
      if (window.location.pathname !== target) window.history.replaceState(null, '', target)
    }
    sync()
    document.title = profile ? `${profile.label} · Farallones` : 'Ingresar · Farallones'
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [profile])

  function handleLogin(key) {
    saveSession(key)
    window.history.pushState(null, '', profiles[key].path)
    setProfileKey(key)
  }

  function handleLogout() {
    saveSession(null)
    setProfileKey(null)
  }

  if (!profile) return <Login onLogin={handleLogin} />

  return (
    <main className="authenticated-shell">
      <div className="session-bar">
        <span>Sesión activa: <strong>{profile.label}</strong></span>
        <button type="button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
      <PrototypeFrame key={profileKey} profile={profile} />
    </main>
  )
}

export default App
