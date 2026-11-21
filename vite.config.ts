import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Custom service worker (src/sw.ts) so we can handle push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Reveal',
        // Home-screen label is deliberately plain (see CLAUDE.md: discreet notifications).
        short_name: 'Cards',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8F1E7',
        theme_color: '#F8F1E7',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    env: { VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com' },
    css: false,
  },
})
