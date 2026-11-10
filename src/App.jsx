import { useEffect, useState } from 'react'
import PrototypeFrame from './components/PrototypeFrame'
import { DEMO_PASSWORD, LOGIN_PATH, profiles } from './services/profiles'
import { initialSession, login, logout, watchSession } from './services/session'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await login(email, password))
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión.')
      setBusy(false)
    }
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
          <button className="login-button" type="submit" disabled={busy}>
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <details className="demo-accounts">
          <summary>Cuentas demo</summary>
          <ul>
            {Object.values(profiles).map((profile) => (
              <li key={profile.email}><b>{profile.label}:</b> {profile.email} / {DEMO_PASSWORD}</li>
            ))}
          </ul>
          <p>Abre cada perfil en una pestaña distinta: los cambios de uno le llegan a los demás al instante.</p>
        </details>
      </section>
    </main>
  )
}

function App() {
  // undefined = comprobando la sesión con Firebase; null = sin sesión.
  const [session, setSession] = useState(initialSession)
  const profile = session ? profiles[session.key] : null

  useEffect(() => watchSession(setSession), [])

  // Cada perfil vive en su propia ruta: sin sesión se va a /login y con sesión
  // a la página del perfil, aunque se escriba otra URL o se use "Atrás".
  useEffect(() => {
    if (session === undefined) return undefined
    const target = profile ? profile.path : LOGIN_PATH
    const sync = () => {
      if (window.location.pathname !== target) window.history.replaceState(null, '', target)
    }
    sync()
    document.title = profile ? `${profile.label} · Farallones` : 'Ingresar · Farallones'
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [session, profile])

  async function handleLogout() {
    await logout()
    setSession(null)
  }

  if (session === undefined) {
    return (
      <main className="login-shell">
        <p className="firebase-status" role="status">Comprobando la sesión…</p>
      </main>
    )
  }

  if (!profile) return <Login onLogin={setSession} />

  return (
    <main className="authenticated-shell">
      <div className="session-bar">
        <span>Sesión activa: <strong>{profile.label}</strong></span>
        <button type="button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
      <PrototypeFrame key={`${session.key}:${session.uid}`} profileKey={session.key} uid={session.uid} />
    </main>
  )
}

export default App
