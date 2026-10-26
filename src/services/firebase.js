import { getApps, getApp, initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId']
let productsPromise

function isConfigured() {
  return requiredConfig.every((key) => Boolean(firebaseConfig[key]))
}

function normalizeProduct(snapshot) {
  const data = snapshot.data()
  const name = data.name ?? data.nombre
  const category = data.category ?? data.categoria ?? 'Fuertes'
  const rawPrice = data.price ?? data.precio
  const price = Number(rawPrice)

  if (!name || rawPrice == null || !Number.isFinite(price)) {
    throw new Error(`El producto ${snapshot.id} no tiene nombre o precio válido`)
  }

  return {
    id: snapshot.id,
    name: String(name),
    cat: String(category),
    price,
    min: Number(data.min ?? data.tiempoPreparacion ?? 20),
    st: data.available === false || data.disponible === false ? 'off' : 'ok',
    icon: data.icon ?? 'fork',
    hot: data.hot == null ? null : Number(data.hot),
    fast: Boolean(data.fast ?? data.rapido),
    options: Boolean(data.options ?? data.opciones),
    imageUrl: data.imageUrl ?? data.imagen ?? null,
    description: data.description ?? data.descripcion ?? '',
  }
}

export async function fetchProducts() {
  if (productsPromise) return productsPromise

  if (!isConfigured()) {
    throw new Error(
      'Firebase no está configurado. Define las variables VITE_FIREBASE_* en .env.local.',
    )
  }

  productsPromise = (async () => {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    const database = getFirestore(app)
    const snapshot = await getDocs(
      collection(database, import.meta.env.VITE_FIREBASE_PRODUCTS_COLLECTION || 'products'),
    )

    return snapshot.docs.map(normalizeProduct)
  })()

  try {
    return await productsPromise
  } catch (error) {
    productsPromise = undefined
    throw error
  }
}
