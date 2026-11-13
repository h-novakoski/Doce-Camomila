import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA opcional: o site funciona normal no navegador; instalar é só um atalho (decisão 008).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flor.svg'],
      manifest: {
        name: 'Doce Camomila — Sacas do dia',
        short_name: 'Camomila',
        description: 'Registro das sacas do dia na Doce Camomila.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#F5F4EE',
        theme_color: '#F5F4EE',
        icons: [
          { src: 'flor.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Fontes do Google ficam em cache para abrir rápido no galpão com sinal ruim.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
})
