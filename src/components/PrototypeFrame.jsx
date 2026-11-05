import { useEffect, useRef, useState } from 'react'
import { fetchProducts } from '../services/firebase'
import { publicProfile } from '../services/profiles'
import { prototypeUrl, publishProducts } from '../services/prototypeService'

function PrototypeFrame({ profile }) {
  const frameRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    fetchProducts()
      .then((products) => {
        if (!active) return
        publishProducts(frameRef.current, products)
        frameRef.current?.contentWindow?.postMessage(
          { type: 'farallones:session', profile: publicProfile(profile) },
          window.location.origin,
        )
        setStatus('ready')
      })
      .catch((error) => {
        console.error('No se pudieron cargar los productos de Firebase:', error)
        if (active) setStatus('demo')
      })

    return () => {
      active = false
    }
  }, [profile])

  function handleLoad() {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'farallones:session', profile: publicProfile(profile) },
      window.location.origin,
    )
    fetchProducts()
      .then((products) => {
        publishProducts(frameRef.current, products)
        setStatus('ready')
      })
      .catch(() => {
        setStatus('demo')
      })
  }

  return (
    <main className="prototype-shell">
      {status === 'loading' && (
        <p className="firebase-status" role="status">
          Cargando productos…
        </p>
      )}
      <iframe
        ref={frameRef}
        className="prototype-frame"
        src={prototypeUrl}
        title="Prototipos del Club Campestre Farallones"
        loading="eager"
        onLoad={handleLoad}
      />
    </main>
  )
}

export default PrototypeFrame
