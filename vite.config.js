import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite acceder vía túnel de Cloudflare (cloudflared tunnel --url ...)
    allowedHosts: ['.trycloudflare.com'],
  },
})
