import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getDatabase, increment, onValue, ref, update } from 'firebase/database'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL:
    env.VITE_FIREBASE_DATABASE_URL ||
    `https://${env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
}

export const isFirebaseConfigured = ['apiKey', 'authDomain', 'projectId', 'appId'].every((key) =>
  Boolean(firebaseConfig[key]),
)

let services

function firebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no está configurado. Define las variables VITE_FIREBASE_* en .env.local.')
  }
  if (!services) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    let auth
    try {
      // La sesión vive por pestaña: así se pueden abrir varios perfiles a la vez en el mismo navegador.
      auth = initializeAuth(app, { persistence: browserSessionPersistence })
    } catch {
      auth = getAuth(app)
    }
    services = { auth, db: getDatabase(app) }
  }
  return services
}

/* ---------- Authentication ---------- */

export function watchUser(callback) {
  return onAuthStateChanged(firebase().auth, callback)
}

const MISSING_USER = ['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/user-not-found']

// Inicia sesión con Firebase Auth. Si la cuenta demo aún no existe en el proyecto,
// la crea con la contraseña demo (solo para las cuentas listadas en profiles.js).
export async function signInWithDemoFallback(email, password, isDemoAccount) {
  const { auth } = firebase()
  try {
    return (await signInWithEmailAndPassword(auth, email, password)).user
  } catch (error) {
    if (!MISSING_USER.includes(error.code) || !isDemoAccount) throw error
    try {
      return (await createUserWithEmailAndPassword(auth, email, password)).user
    } catch (createError) {
      // La cuenta ya existía: la contraseña escrita era incorrecta.
      if (createError.code === 'auth/email-already-in-use') throw error
      throw createError
    }
  }
}

export function signOutUser() {
  return signOut(firebase().auth)
}

/* ---------- Realtime Database ---------- */

// Escucha todo el árbol de la demo. Cada cambio de cualquier perfil llega a todos al instante.
export function subscribeData(onData, onError) {
  return onValue(ref(firebase().db), (snapshot) => onData(snapshot.val() || {}), onError)
}

const INVALID_PATH = /[.#$[\]]|\/\/|^\/|\/$/

// Aplica un lote de operaciones { p: ruta, v: valor } o { p, inc: n } en una sola
// actualización atómica de varias rutas. v null o ausente borra la ruta.
export async function writeOps(ops) {
  const updates = {}
  for (const op of ops) {
    if (typeof op?.p !== 'string' || !op.p || INVALID_PATH.test(op.p)) {
      throw new Error(`Ruta inválida para Realtime Database: ${op?.p}`)
    }
    if (op.inc != null) updates[op.p] = increment(Number(op.inc) || 0)
    else updates[op.p] = op.v == null ? null : JSON.parse(JSON.stringify(op.v))
  }
  await update(ref(firebase().db), updates)
}

/* Hola, prueba Kevin*/
