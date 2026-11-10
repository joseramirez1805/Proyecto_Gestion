import { isFirebaseConfigured, signInWithDemoFallback, signOutUser, watchUser } from './firebase'
import { DEMO_PASSWORD, profileKeyByEmail, profiles } from './profiles'

// Sesión = { key: perfil, uid }. Con Firebase la maneja Authentication; sin configuración
// se usa un modo local de respaldo con las cuentas demo guardadas en sessionStorage.
const LOCAL_KEY = 'farallones:session'

function readLocal() {
  try {
    const key = sessionStorage.getItem(LOCAL_KEY)
    return key && profiles[key] ? { key, uid: `local-${key}` } : null
  } catch {
    return null
  }
}

function writeLocal(key) {
  try {
    if (key) sessionStorage.setItem(LOCAL_KEY, key)
    else sessionStorage.removeItem(LOCAL_KEY)
  } catch {
    // Sin almacenamiento la sesión solo dura hasta recargar la página.
  }
}

export const initialSession = () => (isFirebaseConfigured ? undefined : readLocal())

export class LoginError extends Error {}

const AUTH_MESSAGES = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
  'auth/network-request-failed': 'No hay conexión con Firebase. Revisa tu internet.',
  'auth/operation-not-allowed': 'Habilita el proveedor Correo/contraseña en Firebase Authentication.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
}

export async function login(email, password) {
  const key = profileKeyByEmail(email)
  if (!isFirebaseConfigured) {
    if (!key || password !== DEMO_PASSWORD) throw new LoginError('Correo o contraseña incorrectos. Usa una cuenta demo.')
    writeLocal(key)
    return { key, uid: `local-${key}` }
  }
  if (!key) throw new LoginError('Esta cuenta no tiene un perfil en la plataforma. Usa una cuenta demo.')
  try {
    const user = await signInWithDemoFallback(email.trim().toLowerCase(), password, password === DEMO_PASSWORD)
    return { key, uid: user.uid }
  } catch (error) {
    console.error('Error de Firebase Authentication:', error)
    throw new LoginError(AUTH_MESSAGES[error.code] || 'No se pudo iniciar sesión. Inténtalo de nuevo.')
  }
}

export async function logout() {
  if (isFirebaseConfigured) await signOutUser()
  else writeLocal(null)
}

// Notifica la sesión al cargar la página y cada vez que cambia (solo con Firebase).
export function watchSession(callback) {
  if (!isFirebaseConfigured) return () => {}
  return watchUser((user) => {
    if (!user) return callback(null)
    const key = profileKeyByEmail(user.email)
    if (!key) {
      signOutUser()
      return callback(null)
    }
    callback({ key, uid: user.uid })
  })
}
