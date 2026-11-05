// Perfiles demo. Cada uno tiene su propia ruta y ve solo sus pantallas del prototipo:
// view = propuesta (a, b, c); parts = 'desk' (pantallas del Club) y/o 'phone' (app móvil).
export const profiles = {
  director: {
    label: 'Director de A&B',
    email: 'director@farallones.co',
    password: '123456',
    path: '/director',
    view: 'a',
    parts: ['desk'],
  },
  planeacion: {
    label: 'Planeación y reservas',
    email: 'planeacion@farallones.co',
    password: '123456',
    path: '/planeacion',
    view: 'b',
    parts: ['desk'],
  },
  mesero: {
    label: 'Mesero',
    email: 'mesero@farallones.co',
    password: '123456',
    path: '/mesero',
    view: 'a',
    parts: ['phone'],
  },
  socio: {
    label: 'Socio',
    email: 'socio@farallones.co',
    password: '123456',
    path: '/socio',
    view: 'b',
    parts: ['phone'],
  },
  pase: {
    label: 'Jefe de pase',
    email: 'pase@farallones.co',
    password: '123456',
    path: '/pase',
    view: 'c',
    parts: ['desk'],
  },
}

export const LOGIN_PATH = '/login'
const SESSION_KEY = 'farallones:session'

export function findProfile(email, password) {
  const normalized = email.trim().toLowerCase()
  return Object.keys(profiles).find(
    (key) => profiles[key].email === normalized && profiles[key].password === password,
  )
}

export function readSession() {
  try {
    const key = sessionStorage.getItem(SESSION_KEY)
    return key && profiles[key] ? key : null
  } catch {
    return null
  }
}

export function saveSession(key) {
  try {
    if (key) sessionStorage.setItem(SESSION_KEY, key)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Sin almacenamiento la sesión solo dura hasta recargar la página.
  }
}

// Lo que recibe el iframe: nunca la contraseña.
export function publicProfile(profile) {
  const { label, view, parts } = profile
  return { label, view, parts }
}
