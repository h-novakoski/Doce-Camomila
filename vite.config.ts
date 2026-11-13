import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA opcional: o site funciona normal no navegador; instalar é só um atalho (decisão 008).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flor.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Doce Camomila — Sacas do dia',
        short_name: 'Camomila',
        description: 'Registro das sacas do dia na Doce Camomila.',
        lang: 'pt-BR',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F5F4EE',
        theme_color: '#F5F4EE',
        // PNG é obrigatório para o Android instalar (só SVG = a instalação falha sem avisar)
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
