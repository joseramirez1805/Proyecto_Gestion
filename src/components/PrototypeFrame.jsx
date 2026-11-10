import { useEffect, useRef, useState } from 'react'
import { isFirebaseConfigured, subscribeData, writeOps } from '../services/firebase'
import { publicProfile } from '../services/profiles'
import { prototypeUrl } from '../services/prototypeService'

// Puente entre el prototipo (iframe) y Firebase:
// - envía al iframe el perfil de la sesión y el árbol de Realtime Database cada vez que cambia;
// - recibe del iframe las operaciones de escritura y las guarda en Firebase.
function PrototypeFrame({ profileKey, uid }) {
  const frameRef = useRef(null)
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'local')

  useEffect(() => {
    const origin = window.location.origin
    const frame = frameRef.current
    const profile = publicProfile(profileKey, uid)
    let state = isFirebaseConfigured ? null : { type: 'farallones:state', mode: 'local' }

    const post = (message) => frame?.contentWindow?.postMessage(message, origin)
    const sync = () => {
      post({ type: 'farallones:session', profile })
      if (state) post(state)
    }

    const handleMessage = (event) => {
      if (event.origin !== origin || event.source !== frame?.contentWindow) return
      const { type, ops } = event.data || {}
      if (type === 'farallones:ready') sync()
      if (type === 'farallones:write' && Array.isArray(ops)) {
        writeOps(ops).catch((error) => {
          console.error('No se pudo guardar en Realtime Database:', error)
          post({
            type: 'farallones:write-failed',
            message: 'No se pudo guardar el cambio en Firebase. Revisa la conexión o las reglas de la base de datos.',
          })
        })
      }
    }

    window.addEventListener('message', handleMessage)
    frame?.addEventListener('load', sync)

    let unsubscribe = () => {}
    if (isFirebaseConfigured) {
      unsubscribe = subscribeData(
        (db) => {
          state = { type: 'farallones:state', mode: 'firebase', db }
          post(state)
          setStatus('ready')
        },
        (error) => {
          console.error('No se pudo leer Realtime Database:', error)
          setStatus('error')
        },
      )
    }
    sync()

    return () => {
      unsubscribe()
      window.removeEventListener('message', handleMessage)
      frame?.removeEventListener('load', sync)
    }
  }, [profileKey, uid])

  return (
    <div className="prototype-shell">
      {status === 'loading' && (
        <p className="firebase-status" role="status">
          Conectando con Firebase…
        </p>
      )}
      {status === 'error' && (
        <p className="firebase-status is-error" role="alert">
          No se pudo leer la base de datos. Revisa la URL de Realtime Database y sus reglas de acceso.
        </p>
      )}
      {status === 'local' && (
        <p className="firebase-status is-warn" role="status">
          Modo local: Firebase no está configurado y los cambios no se guardan.
        </p>
      )}
      <iframe
        ref={frameRef}
        className="prototype-frame"
        src={prototypeUrl}
        title="Prototipos del Club Campestre Farallones"
        loading="eager"
      />
    </div>
  )
}

export default PrototypeFrame
