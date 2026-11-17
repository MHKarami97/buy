import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { standardDevProxyPlugin } from './tools/standardDevProxyPlugin.js'

export default defineConfig({
  server: {
    proxy: {
      '/api/irancode': {
        target: 'https://irancode.ir',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/irancode/, ''),
        secure: false
      },
      '/api/cerfood': {
        target: 'https://cerfood.ir',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cerfood/, ''),
        secure: false
      }
    }
  },
  plugins: [
    vue(),
    standardDevProxyPlugin(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon-48.png'],
      manifest: {
        name: 'خرید هوشمند',
        short_name: 'خرید هوشمند',
        description: 'خرید هوشمند خانه',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        lang: 'fa',
        icons: [
          { src: 'icons/icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: 'icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,avif,gif,woff,woff2,json,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      }
    })
  ]
})
