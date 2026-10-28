import { useState } from 'react'
import PrototypeFrame from './components/PrototypeFrame'

const profiles = {
  director: {
    label: 'Director de A&B',
    email: 'director@farallones.co',
    password: '123456',
    view: 'a',
  },
  planeacion: {
    label: 'Planeación y reservas',
    email: 'planeacion@farallones.co',
    password: '123456',
    view: 'b',
  },
  mesero: {
    label: 'Mesero',
    email: 'mesero@farallones.co',
    password: '123456',
    view: 'a',
  },
  socio: {
    label: 'Socio',
    email: 'socio@farallones.co',
    password: '123456',
    view: 'b',
  },
  pase: {
    label: 'Jefe de pase',
    email: 'pase@farallones.co',
    password: '123456',
    view: 'c',
  },
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const profile = Object.values(profiles).find(
      (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password,
    )

    if (!profile) {
      setError('Correo o contraseña incorrectos. Usa una cuenta demo para continuar.')
      return
    }

    setError('')
    onLogin(profile)
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
  const [profile, setProfile] = useState(null)

  if (!profile) return <Login onLogin={setProfile} />

  return (
    <main className="authenticated-shell">
      <div className="session-bar">
        <span>Sesión activa: <strong>{profile.label}</strong></span>
        <button type="button" onClick={() => setProfile(null)}>Cerrar sesión</button>
      </div>
      <PrototypeFrame profile={profile} />
    </main>
  )
}

export default App
