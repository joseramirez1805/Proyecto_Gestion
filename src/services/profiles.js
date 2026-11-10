// Perfiles demo. Cada uno tiene su propia ruta y ve solo sus pantallas del prototipo:
// view = propuesta inicial (a, b, c) y views = propuestas a las que puede cambiar; parts = 'desk' (pantallas del Club) y/o 'phone' (app móvil).
// Las cuentas existen en Firebase Authentication; si aún no existen, se crean en el primer ingreso.
export const DEMO_PASSWORD = '123456'

export const profiles = {
  director: {
    label: 'Director de A&B',
    email: 'director@farallones.co',
    path: '/director',
    view: 'a',
    parts: ['desk'],
  },
  planeacion: {
    label: 'Planeación y reservas',
    email: 'planeacion@farallones.co',
    path: '/planeacion',
    view: 'b',
    parts: ['desk'],
  },
  mesero: {
    label: 'Mesero',
    name: 'Andrés',
    email: 'mesero@farallones.co',
    path: '/mesero',
    view: 'a',
    parts: ['phone'],
  },
  socio: {
    label: 'Socio',
    email: 'socio@farallones.co',
    path: '/socio',
    view: 'b',
    views: ['b', 'c'],
    parts: ['phone'],
  },
  pase: {
    label: 'Jefe de pase',
    email: 'pase@farallones.co',
    path: '/pase',
    view: 'c',
    parts: ['desk'],
  },
}

export const LOGIN_PATH = '/login'

export function profileKeyByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  return Object.keys(profiles).find((key) => profiles[key].email === normalized) ?? null
}

// Lo que recibe el iframe: rol, vista y el uid de Firebase (para saber qué datos son "míos").
export function publicProfile(key, uid) {
  const { label, name, view, views = [view], parts } = profiles[key]
  return { role: key, label, name, view, views, parts, uid }
}
